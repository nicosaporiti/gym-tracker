import type { WorkoutExercise, Workout, ExerciseSummary } from '../types';

/**
 * Determina si un ejercicio fue realizado durante un entrenamiento.
 * Un ejercicio se considera "no realizado" si TODOS sus sets tienen weight=0 y reps=0.
 */
export const isExercisePerformed = (exercise: WorkoutExercise | null | undefined): boolean => {
  if (!exercise || !exercise.sets || exercise.sets.length === 0) {
    return false;
  }
  return exercise.sets.some((set) => set.weight > 0 || set.reps > 0);
};

/**
 * Calcula el volumen total de un workout (suma de weight * reps de todos los sets)
 */
export const getWorkoutTotalVolume = (workout: Workout): number => {
  return workout.exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0
    );
    return total + exerciseVolume;
  }, 0);
};

/**
 * Genera un resumen por ejercicio de un workout
 */
export const getWorkoutExerciseSummary = (workout: Workout): ExerciseSummary[] => {
  return workout.exercises.map((exercise) => {
    const totalSets = exercise.sets.length;
    const totalVolume = exercise.sets.reduce(
      (sum, set) => sum + set.weight * set.reps,
      0
    );
    const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);
    const maxWeight = Math.max(...exercise.sets.map((s) => s.weight));
    const performed = isExercisePerformed(exercise);

    return {
      name: exercise.name,
      totalSets,
      totalVolume,
      totalReps,
      maxWeight,
      performed,
    };
  });
};
