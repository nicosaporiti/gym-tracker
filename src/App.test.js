import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GymTracker from './App';

// Mock Supabase
jest.mock('./supabaseClient');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => { store[key] = value; }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.confirm
window.confirm = jest.fn(() => true);
window.alert = jest.fn();

// ============================================
// UTILITY FUNCTIONS (isolated for unit testing)
// ============================================

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDate = (dateString) => {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const getWorkoutTotalVolume = (workout) => {
  return workout.exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0
    );
    return total + exerciseVolume;
  }, 0);
};

const getWorkoutExerciseSummary = (workout) => {
  return workout.exercises.map((exercise) => {
    const totalSets = exercise.sets.length;
    const totalVolume = exercise.sets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0
    );
    const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
    const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));

    return {
      name: exercise.name,
      totalSets,
      totalVolume,
      totalReps,
      maxWeight,
    };
  });
};

const getCalendarDays = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const days = [];

  const prevMonth = new Date(year, month, 0);
  const prevMonthDays = prevMonth.getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthDays - i),
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return days;
};

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// ============================================
// TEST DATA
// ============================================

const mockWorkout = {
  id: '1',
  user_id: 'test-user',
  routine_name: 'Push Day',
  date: '2026-01-01',
  exercises: [
    {
      name: 'Bench Press',
      sets: [
        { weight: 80, reps: 10 },
        { weight: 80, reps: 8 },
      ],
    },
    {
      name: 'Shoulder Press',
      sets: [{ weight: 40, reps: 12 }],
    },
  ],
};

const mockRoutine = {
  id: '1',
  user_id: 'test-user',
  name: 'Push Day',
  exercises: [{ name: 'Bench Press', sets: 3, reps: 10 }],
};

// ============================================
// UNIT TESTS - Utility Functions
// ============================================

describe('Utility Functions', () => {
  describe('getLocalDateString', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const date = new Date(2026, 0, 15); // January 15, 2026
      expect(getLocalDateString(date)).toBe('2026-01-15');
    });

    it('pads single digit months and days with zeros', () => {
      const date = new Date(2026, 4, 5); // May 5, 2026
      expect(getLocalDateString(date)).toBe('2026-05-05');
    });

    it('uses current date when no argument provided', () => {
      const result = getLocalDateString();
      const today = new Date();
      const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('parseLocalDate', () => {
    it('converts YYYY-MM-DD string to Date object', () => {
      const result = parseLocalDate('2026-01-15');
      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(15);
    });

    it('returns current date for empty string', () => {
      const result = parseLocalDate('');
      const today = new Date();
      expect(result.getDate()).toBe(today.getDate());
    });

    it('returns current date for null', () => {
      const result = parseLocalDate(null);
      const today = new Date();
      expect(result.getDate()).toBe(today.getDate());
    });
  });

  describe('getWorkoutTotalVolume', () => {
    it('calculates total volume correctly (weight x reps for all sets)', () => {
      // Bench Press: (80*10) + (80*8) = 800 + 640 = 1440
      // Shoulder Press: 40*12 = 480
      // Total: 1920
      const result = getWorkoutTotalVolume(mockWorkout);
      expect(result).toBe(1920);
    });

    it('returns 0 for workout with no exercises', () => {
      const emptyWorkout = { exercises: [] };
      expect(getWorkoutTotalVolume(emptyWorkout)).toBe(0);
    });

    it('handles sets with zero weight or reps', () => {
      const workout = {
        exercises: [
          { name: 'Test', sets: [{ weight: 0, reps: 10 }, { weight: 50, reps: 0 }] },
        ],
      };
      expect(getWorkoutTotalVolume(workout)).toBe(0);
    });
  });

  describe('getWorkoutExerciseSummary', () => {
    it('returns correct summary for each exercise', () => {
      const result = getWorkoutExerciseSummary(mockWorkout);

      expect(result).toHaveLength(2);

      // Bench Press
      expect(result[0].name).toBe('Bench Press');
      expect(result[0].totalSets).toBe(2);
      expect(result[0].totalReps).toBe(18); // 10 + 8
      expect(result[0].maxWeight).toBe(80);
      expect(result[0].totalVolume).toBe(1440); // 80*10 + 80*8

      // Shoulder Press
      expect(result[1].name).toBe('Shoulder Press');
      expect(result[1].totalSets).toBe(1);
      expect(result[1].totalReps).toBe(12);
      expect(result[1].maxWeight).toBe(40);
      expect(result[1].totalVolume).toBe(480);
    });
  });
});

// ============================================
// UNIT TESTS - Calendar Functions
// ============================================

describe('Calendar Functions', () => {
  describe('getCalendarDays', () => {
    it('generates exactly 42 days (6 weeks)', () => {
      const date = new Date(2026, 0, 1); // January 2026
      const result = getCalendarDays(date);
      expect(result).toHaveLength(42);
    });

    it('marks current month days with isCurrentMonth: true', () => {
      const date = new Date(2026, 0, 1); // January 2026
      const result = getCalendarDays(date);
      const currentMonthDays = result.filter((d) => d.isCurrentMonth);
      expect(currentMonthDays.length).toBe(31); // January has 31 days
    });

    it('marks other month days with isCurrentMonth: false', () => {
      const date = new Date(2026, 0, 1); // January 2026
      const result = getCalendarDays(date);
      const otherMonthDays = result.filter((d) => !d.isCurrentMonth);
      expect(otherMonthDays.length).toBe(11); // 42 - 31
    });

    it('starts week on Monday', () => {
      // January 2026 starts on Thursday
      const date = new Date(2026, 0, 1);
      const result = getCalendarDays(date);

      // First day should be Monday Dec 29, 2025
      expect(result[0].date.getDay()).toBe(1); // Monday
      expect(result[0].isCurrentMonth).toBe(false);
    });

    it('handles February correctly', () => {
      const date = new Date(2026, 1, 1); // February 2026
      const result = getCalendarDays(date);
      const febDays = result.filter((d) => d.isCurrentMonth);
      expect(febDays.length).toBe(28); // 2026 is not a leap year
    });

    it('handles leap year February correctly', () => {
      const date = new Date(2024, 1, 1); // February 2024 (leap year)
      const result = getCalendarDays(date);
      const febDays = result.filter((d) => d.isCurrentMonth);
      expect(febDays.length).toBe(29);
    });
  });

  describe('isToday', () => {
    it('returns true for current date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for same day different month', () => {
      const today = new Date();
      const sameDay = new Date(today);
      sameDay.setMonth(today.getMonth() - 1);
      expect(isToday(sameDay)).toBe(false);
    });

    it('returns false for same day different year', () => {
      const today = new Date();
      const sameDay = new Date(today);
      sameDay.setFullYear(today.getFullYear() - 1);
      expect(isToday(sameDay)).toBe(false);
    });
  });

  describe('hasWorkoutOnDate / getWorkoutsForDate logic', () => {
    const workouts = [
      { id: '1', date: '2026-01-01', routine_name: 'Push' },
      { id: '2', date: '2026-01-01', routine_name: 'Pull' },
      { id: '3', date: '2026-01-15', routine_name: 'Legs' },
    ];

    const getWorkoutsForDate = (date, workoutList) => {
      const dateStr = getLocalDateString(date);
      return workoutList.filter((w) => w.date === dateStr);
    };

    const hasWorkoutOnDate = (date, workoutList) =>
      getWorkoutsForDate(date, workoutList).length > 0;

    it('returns workouts for date with multiple workouts', () => {
      const date = new Date(2026, 0, 1);
      const result = getWorkoutsForDate(date, workouts);
      expect(result).toHaveLength(2);
      expect(result[0].routine_name).toBe('Push');
      expect(result[1].routine_name).toBe('Pull');
    });

    it('returns empty array for date with no workouts', () => {
      const date = new Date(2026, 0, 10);
      const result = getWorkoutsForDate(date, workouts);
      expect(result).toHaveLength(0);
    });

    it('hasWorkoutOnDate returns true when workout exists', () => {
      const date = new Date(2026, 0, 1);
      expect(hasWorkoutOnDate(date, workouts)).toBe(true);
    });

    it('hasWorkoutOnDate returns false when no workout exists', () => {
      const date = new Date(2026, 0, 10);
      expect(hasWorkoutOnDate(date, workouts)).toBe(false);
    });
  });
});

// ============================================
// COMPONENT TESTS
// ============================================

// Helper para configurar mocks de Supabase
const setupSupabaseMock = (options = {}) => {
  const { supabase } = require('./supabaseClient');
  const {
    user = null,
    routines = [],
    workouts = [],
  } = options;

  supabase.auth.getSession.mockResolvedValue({
    data: { session: user ? { user } : null },
  });

  supabase.auth.onAuthStateChange.mockReturnValue({
    data: {
      subscription: {
        unsubscribe: jest.fn(),
      },
    },
  });

  supabase.from.mockImplementation((table) => {
    const mockChain = {
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({
        data: table === 'routines' ? routines : workouts,
        error: null,
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };
    return mockChain;
  });

  return supabase;
};

describe('Component Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('GymTracker - Auth State', () => {
    it('shows auth form when no user is logged in', async () => {
      setupSupabaseMock({ user: null });

      render(<GymTracker />);

      await waitFor(() => {
        // Buscar el heading específico del formulario de auth
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
      });
    });
  });

  describe('AuthForm', () => {
    beforeEach(() => {
      setupSupabaseMock({ user: null });
    });

    it('renders login form by default', async () => {
      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      });
    });

    it('toggles between login and signup', async () => {
      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Iniciar Sesión' })).toBeInTheDocument();
      });

      const toggleButton = screen.getByText('¿No tienes cuenta? Regístrate');
      fireEvent.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Crear Cuenta' })).toBeInTheDocument();
        expect(screen.getByText('¿Ya tienes cuenta? Inicia sesión')).toBeInTheDocument();
      });
    });
  });

  describe('GymTracker - Main App', () => {
    const mockUser = { id: 'test-user', email: 'test@test.com' };

    beforeEach(() => {
      setupSupabaseMock({
        user: mockUser,
        routines: [mockRoutine],
        workouts: [mockWorkout],
      });
    });

    it('renders tabs when user is authenticated', async () => {
      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByText('Gym Tracker')).toBeInTheDocument();
      });

      const tabs = screen.getAllByRole('button');
      expect(tabs.length).toBeGreaterThan(3);
    });

    it('shows routines tab by default', async () => {
      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByText('Nueva Rutina')).toBeInTheDocument();
      });
    });

    it('has navigation tabs available', async () => {
      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByText('Nueva Rutina')).toBeInTheDocument();
      });

      // Verificar que hay múltiples botones de navegación
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(5);
    });
  });

  describe('Dark Mode', () => {
    it('toggles dark mode and saves to localStorage', async () => {
      setupSupabaseMock({
        user: { id: 'test', email: 'test@test.com' },
      });

      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByText('Gym Tracker')).toBeInTheDocument();
      });

      const darkModeButton = screen.getByLabelText('Toggle dark mode');

      await act(async () => {
        fireEvent.click(darkModeButton);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('gym-darkmode', expect.any(String));
    });
  });
});

// ============================================
// INTEGRATION TESTS
// ============================================

describe('Integration Flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe('App loads correctly with data', () => {
    it('displays routine name when routines exist', async () => {
      setupSupabaseMock({
        user: { id: 'test', email: 'test@test.com' },
        routines: [mockRoutine],
        workouts: [mockWorkout],
      });

      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });
    });
  });

  describe('Routine to Workout Flow', () => {
    it('can start a workout from a routine', async () => {
      setupSupabaseMock({
        user: { id: 'test', email: 'test@test.com' },
        routines: [mockRoutine],
        workouts: [],
      });

      render(<GymTracker />);

      await waitFor(() => {
        expect(screen.getByText('Push Day')).toBeInTheDocument();
      });

      const startButton = screen.getByText('Comenzar Entrenamiento');

      await act(async () => {
        fireEvent.click(startButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Fecha del entrenamiento')).toBeInTheDocument();
        expect(screen.getByText('Guardar Entrenamiento')).toBeInTheDocument();
      });
    });
  });
});
