// Mock de Supabase para tests
const createMockFrom = () => ({
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
  insert: jest.fn().mockResolvedValue({ data: null, error: null }),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockResolvedValue({ data: null, error: null }),
});

export const supabase = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
    signUp: jest.fn().mockResolvedValue({ error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    }),
  },
  from: jest.fn(() => createMockFrom()),
};

// Helper para configurar usuario autenticado en tests
export const mockAuthenticatedUser = (user = { id: 'test-user-id', email: 'test@example.com' }) => {
  supabase.auth.getSession.mockResolvedValue({
    data: { session: { user } },
  });
  return user;
};

// Helper para configurar datos de rutinas
export const mockRoutines = (routines = []) => {
  supabase.from.mockImplementation((table) => {
    if (table === 'routines') {
      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: routines, error: null })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      };
    }
    return {
      select: jest.fn(() => ({
        order: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: null, error: null })) })),
      delete: jest.fn(() => ({ eq: jest.fn(() => Promise.resolve({ data: null, error: null })) })),
    };
  });
};

// Helper para configurar datos de workouts
export const mockWorkouts = (workouts = []) => {
  const currentFrom = supabase.from;
  supabase.from.mockImplementation((table) => {
    if (table === 'workouts') {
      return {
        select: jest.fn(() => ({
          order: jest.fn(() => Promise.resolve({ data: workouts, error: null })),
        })),
        insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        delete: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      };
    }
    return currentFrom(table);
  });
};

// Reset all mocks
export const resetSupabaseMocks = () => {
  jest.clearAllMocks();
  supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
};
