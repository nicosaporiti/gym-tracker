import React, { useState } from 'react';
import { TrendingUp, ChevronLeft, ChevronRight, X, Edit2, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { parseLocalDate } from '../../utils/dateUtils';
import { getWorkoutTotalVolume, getWorkoutExerciseSummary, isExercisePerformed } from '../../utils/exerciseUtils';
import type { Workout, CalendarDay, TabType } from '../../types';

interface ProgressTabProps {
  setActiveTab: (tab: TabType) => void;
}

export function ProgressTab({ setActiveTab }: ProgressTabProps) {
  const { darkMode, theme } = useTheme();
  const { workouts, deleteWorkout, editWorkout } = useData();

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // Helper functions
  const getAllExercises = (): string[] => {
    const exercises = new Set<string>();
    workouts.forEach((w: any) => {
      w.exercises.forEach((e: any) => exercises.add(e.name));
    });
    return Array.from(exercises);
  };

  const getExerciseData = (exerciseName: string) => {
    const exerciseWorkouts = workouts
      .filter((w: Workout) => w.exercises.some((e) => e.name === exerciseName))
      .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime());

    return exerciseWorkouts
      .map((w) => {
        const exercise = w.exercises.find((e) => e.name === exerciseName);
        if (!exercise || !isExercisePerformed(exercise)) {
          return null;
        }

        const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
        const totalVolume = exercise.sets.reduce(
          (sum, s) => sum + s.weight * s.reps,
          0
        );

        const workoutDate = parseLocalDate(w.date);

        return {
          date: workoutDate.toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
          }),
          peso: maxWeight,
          volumen: totalVolume,
        };
      })
      .filter(Boolean);
  };

  const getCalendarDays = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

    const days: CalendarDay[] = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getWorkoutsForDate = (date: Date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return workouts.filter((w: Workout) => w.date === dateStr);
  };

  const hasWorkoutOnDate = (date: Date) => {
    return getWorkoutsForDate(date).length > 0;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const navigateMonth = (direction: number) => {
    setCalendarMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
    setSelectedCalendarDate(null);
  };

  if (workouts.length === 0) {
    return (
      <div className='space-y-4 sm:space-y-6'>
        <div
          className={`p-6 sm:p-8 rounded-lg ${theme.card} border ${theme.border} text-center`}
        >
          <TrendingUp className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50' />
          <p className={`text-base sm:text-lg ${theme.textSecondary}`}>
            Aún no hay entrenamientos registrados
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Stats Cards */}
      <div className='grid grid-cols-3 gap-2 sm:gap-4'>
        <div
          className={`p-3 sm:p-6 rounded-lg ${theme.card} border ${theme.border} text-center`}
        >
          <p className='text-xl sm:text-3xl font-bold mb-1'>
            {workouts.length}
          </p>
          <p className={`${theme.textSecondary} text-xs sm:text-sm`}>
            Entrenamientos
          </p>
        </div>
        <div
          className={`p-3 sm:p-6 rounded-lg ${theme.card} border ${theme.border} text-center`}
        >
          <p className='text-xl sm:text-3xl font-bold mb-1'>
            {getAllExercises().length}
          </p>
          <p className={`${theme.textSecondary} text-xs sm:text-sm`}>
            Ejercicios
          </p>
        </div>
        <div
          className={`p-3 sm:p-6 rounded-lg ${theme.card} border ${theme.border} text-center`}
        >
          <p className='text-xl sm:text-3xl font-bold mb-1'>
            {new Set(workouts.map((w: Workout) => w.date)).size}
          </p>
          <p className={`${theme.textSecondary} text-xs sm:text-sm`}>
            Días activos
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div
        className={`p-3 sm:p-4 rounded-lg ${theme.card} border ${theme.border}`}
      >
        <div className='flex items-center justify-between mb-2'>
          <button
            onClick={() => navigateMonth(-1)}
            className={`p-1 rounded ${theme.hover} touch-manipulation`}
            aria-label='Mes anterior'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <h3 className='text-sm font-semibold capitalize'>
            {calendarMonth.toLocaleDateString('es-ES', {
              month: 'short',
              year: 'numeric',
            })}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className={`p-1 rounded ${theme.hover} touch-manipulation`}
            aria-label='Mes siguiente'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>

        <div className='grid grid-cols-7 gap-0.5 mb-1'>
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
            <div
              key={day}
              className={`text-center text-[10px] font-medium ${theme.textSecondary}`}
            >
              {day}
            </div>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-0.5'>
          {getCalendarDays(calendarMonth).map((dayObj, index) => {
            const hasWorkout = hasWorkoutOnDate(dayObj.date);
            const isTodayDate = isToday(dayObj.date);
            const isSelected =
              selectedCalendarDate &&
              dayObj.date.toDateString() === selectedCalendarDate.toDateString();

            return (
              <button
                key={index}
                onClick={() => hasWorkout && setSelectedCalendarDate(dayObj.date)}
                disabled={!hasWorkout}
                className={`
                  w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-[10px] sm:text-xs
                  ${!dayObj.isCurrentMonth ? 'opacity-20' : ''}
                  ${hasWorkout ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700' : ''}
                  ${isTodayDate && !hasWorkout ? 'ring-1 ring-blue-400' : ''}
                  ${isSelected ? 'ring-2 ring-blue-300' : ''}
                  ${!hasWorkout ? 'cursor-default' : ''}
                `}
              >
                {dayObj.date.getDate()}
              </button>
            );
          })}
        </div>

        {selectedCalendarDate && (
          <div className={`mt-3 pt-3 border-t ${theme.border}`}>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs font-medium'>
                {selectedCalendarDate.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <button
                onClick={() => setSelectedCalendarDate(null)}
                className={`p-0.5 rounded ${theme.hover}`}
                aria-label='Cerrar'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
            <div className='space-y-2'>
              {getWorkoutsForDate(selectedCalendarDate).map((workout: Workout) => (
                <div
                  key={workout.id}
                  className={`p-2 rounded border ${theme.border} text-xs`}
                >
                  <div className='flex items-center justify-between mb-1'>
                    <p className='font-medium'>{workout.routine_name}</p>
                    <div className='flex gap-1'>
                      <button
                        onClick={(e) => {
                          editWorkout(workout, e, true);
                          setSelectedCalendarDate(null);
                        }}
                        className={`p-1 rounded ${theme.hover}`}
                        aria-label='Editar'
                      >
                        <Edit2 className='w-3 h-3' />
                      </button>
                      <button
                        onClick={(e) => {
                          deleteWorkout(workout.id!, e);
                          setSelectedCalendarDate(null);
                        }}
                        className='p-1 rounded hover:bg-red-600 text-red-500 hover:text-white'
                        aria-label='Eliminar'
                      >
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  </div>
                  {workout.exercises.map((ex, idx) => (
                    <div
                      key={idx}
                      className={`${theme.textSecondary} flex justify-between`}
                    >
                      <span className='truncate mr-2'>{ex.name}</span>
                      <span className='flex-shrink-0'>{ex.sets.length}x</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Selector */}
      <div
        className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
      >
        <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
          Seleccionar Ejercicio
        </h3>
        <select
          value={selectedExercise || ''}
          onChange={(e) => setSelectedExercise(e.target.value)}
          className={`w-full px-4 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
        >
          <option value=''>-- Selecciona un ejercicio --</option>
          {getAllExercises().map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>
      </div>

      {/* Charts */}
      {selectedExercise && (
        <div
          className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
        >
          <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
            Progreso: {selectedExercise}
          </h3>

          <div className='mb-4 sm:mb-6'>
            <h4
              className={`text-xs sm:text-sm font-medium mb-2 ${theme.textSecondary}`}
            >
              Peso Máximo (kg)
            </h4>
            <ResponsiveContainer width='100%' height={180}>
              <LineChart data={getExerciseData(selectedExercise)}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                />
                <XAxis
                  dataKey='date'
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#f3f4f6' : '#111827',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='peso'
                  stroke='#3b82f6'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4
              className={`text-xs sm:text-sm font-medium mb-2 ${theme.textSecondary}`}
            >
              Volumen Total (kg)
            </h4>
            <ResponsiveContainer width='100%' height={180}>
              <LineChart data={getExerciseData(selectedExercise)}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke={darkMode ? '#374151' : '#e5e7eb'}
                />
                <XAxis
                  dataKey='date'
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 10 }}
                  angle={-45}
                  textAnchor='end'
                  height={60}
                />
                <YAxis
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: darkMode ? '#f3f4f6' : '#111827',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='volumen'
                  stroke='#10b981'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Workout History */}
      <div
        className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
      >
        <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
          Historial Reciente
        </h3>
        <div className='space-y-2 sm:space-y-3'>
          {workouts.slice(0, 10).map((workout: Workout) => {
            const totalVolume = getWorkoutTotalVolume(workout);
            const isExpanded = selectedWorkoutDetail === workout.id;

            return (
              <div key={workout.id}>
                <div
                  onClick={() =>
                    setSelectedWorkoutDetail(isExpanded ? null : workout.id!)
                  }
                  className={`p-3 sm:p-4 rounded-lg border ${theme.border} cursor-pointer transition-colors ${theme.hover} ${
                    isExpanded ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2'>
                    <span className='font-medium text-sm sm:text-base truncate'>
                      {workout.routine_name}
                    </span>
                    <span
                      className={`${theme.textSecondary} text-xs sm:text-sm flex-shrink-0`}
                    >
                      {parseLocalDate(workout.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                    <p
                      className={`text-xs sm:text-sm ${theme.textSecondary}`}
                    >
                      {workout.exercises.length} ejercicios
                    </p>
                    <span className='text-xs sm:text-sm font-semibold text-blue-500'>
                      Volumen total: {totalVolume.toFixed(1)} kg
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    className={`mt-2 p-3 sm:p-4 rounded-lg border ${theme.border} ${theme.card} space-y-2`}
                  >
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='font-semibold text-sm sm:text-base'>
                        Resumen por Ejercicio
                      </h4>
                      <div className='flex gap-1 sm:gap-2'>
                        <button
                          onClick={(e) => editWorkout(workout, e)}
                          className={`p-2 rounded-lg ${theme.hover} touch-manipulation`}
                          aria-label='Editar entrenamiento'
                        >
                          <Edit2 className='w-4 h-4' />
                        </button>
                        <button
                          onClick={(e) => deleteWorkout(workout.id!, e)}
                          className='p-2 rounded-lg hover:bg-red-600 active:bg-red-700 text-red-500 hover:text-white touch-manipulation'
                          aria-label='Eliminar entrenamiento'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                    {getWorkoutExerciseSummary(workout).map((exercise, idx) => (
                      <div
                        key={idx}
                        className={`p-2 sm:p-3 rounded border ${theme.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 ${
                          !exercise.performed ? 'opacity-50' : ''
                        }`}
                      >
                        <span
                          className={`font-medium text-sm sm:text-base ${
                            !exercise.performed ? theme.textSecondary : ''
                          }`}
                        >
                          {exercise.name}
                          {!exercise.performed && (
                            <span className='ml-2 text-xs bg-gray-500 text-white px-2 py-0.5 rounded'>
                              No realizado
                            </span>
                          )}
                        </span>
                        {exercise.performed && (
                          <div className='flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm'>
                            <span className={theme.textSecondary}>
                              Series: {exercise.totalSets}
                            </span>
                            <span className={theme.textSecondary}>
                              Reps: {exercise.totalReps}
                            </span>
                            <span className={theme.textSecondary}>
                              Peso máx: {exercise.maxWeight} kg
                            </span>
                            <span className='font-semibold text-blue-500'>
                              Total: {exercise.totalVolume.toFixed(1)} kg
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
