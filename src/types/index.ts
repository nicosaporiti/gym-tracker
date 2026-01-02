// Definición de ejercicio en una rutina (template)
export interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

// Set individual durante un workout
export interface WorkoutSet {
  weight: number;
  reps: number;
}

// Ejercicio durante un workout (con sets completados)
export interface WorkoutExercise {
  name: string;
  sets: WorkoutSet[];
}

// Rutina guardada
export interface Routine {
  id?: string;
  user_id?: string;
  name: string;
  exercises: Exercise[];
}

// Rutina en edición (puede no tener id)
export interface EditingRoutine {
  id?: string;
  name: string;
  exercises: Exercise[];
}

// Rutina seleccionada para workout (con fecha y sets expandidos)
export interface SelectedRoutine {
  id?: string;
  name: string;
  date: string;
  exercises: WorkoutExercise[];
}

// Workout guardado
export interface Workout {
  id?: string;
  user_id?: string;
  routine_name: string;
  date: string;
  exercises: WorkoutExercise[];
}

// Resumen de ejercicio para historial
export interface ExerciseSummary {
  name: string;
  totalSets: number;
  totalVolume: number;
  totalReps: number;
  maxWeight: number;
  performed: boolean;
}

// Datos para gráficos de progreso
export interface ExerciseChartData {
  date: string;
  peso: number;
  volumen: number;
}

// Día del calendario
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
}

// Tabs de navegación
export type TabType = 'routines' | 'workout' | 'progress';

// Tema
export interface Theme {
  bg: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  input: string;
  hover: string;
}

// Usuario de Supabase (simplificado)
export interface User {
  id: string;
  email?: string;
}
