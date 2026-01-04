import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import type { Routine, Workout, EditingRoutine, SelectedRoutine, TabType } from '../types';
import { getLocalDateString, parseLocalDate } from '../utils/dateUtils';

interface DataContextType {
  // Data
  routines: Routine[];
  workouts: Workout[];
  dataLoading: boolean;

  // Routine operations
  editingRoutine: EditingRoutine | null;
  setEditingRoutine: React.Dispatch<React.SetStateAction<EditingRoutine | null>>;
  createRoutine: () => void;
  addExercise: () => void;
  updateExercise: (index: number, field: string, value: any) => void;
  removeExercise: (index: number) => void;
  saveRoutine: () => Promise<void>;
  deleteRoutine: (id: string) => Promise<void>;

  // Workout operations
  selectedRoutine: SelectedRoutine | null;
  setSelectedRoutine: React.Dispatch<React.SetStateAction<SelectedRoutine | null>>;
  startWorkout: (routine: Routine) => void;
  updateWorkoutSet: (exerciseIndex: number, setIndex: number, field: string, value: string) => void;
  saveWorkout: () => Promise<void>;
  deleteWorkout: (id: string, e: React.MouseEvent) => Promise<void>;
  editWorkout: (workout: Workout, e: React.MouseEvent, fromCalendar?: boolean) => void;

  // Data management
  loadData: () => Promise<void>;
  exportToJSON: () => void;
  exportToCSV: () => void;
  importFromJSON: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  setActiveTab: (tab: TabType) => void;
  setShowSettings: (show: boolean) => void;
  setSelectedWorkoutDetail: (workout: any) => void;
}

export function DataProvider({ children, setActiveTab, setShowSettings, setSelectedWorkoutDetail }: DataProviderProps) {
  const { user } = useAuth();
  const { showNotification, showConfirm } = useNotification();

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingRoutine, setEditingRoutine] = useState<EditingRoutine | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<SelectedRoutine | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    try {
      const [routinesRes, workoutsRes] = await Promise.all([
        supabase.from('routines').select('*').eq('user_id', user.id),
        supabase.from('workouts').select('*').eq('user_id', user.id),
      ]);

      if (routinesRes.error) throw routinesRes.error;
      if (workoutsRes.error) throw workoutsRes.error;

      setRoutines(routinesRes.data || []);
      setWorkouts(workoutsRes.data || []);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setRoutines([]);
      setWorkouts([]);
      setDataLoading(false);
    }
  }, [user, loadData]);

  // Routine operations
  const createRoutine = () => {
    setEditingRoutine({
      name: '',
      exercises: [],
    });
  };

  const addExercise = () => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, { name: '', sets: 3, reps: 10 }],
    });
  };

  const updateExercise = (index: number, field: string, value: any) => {
    if (!editingRoutine) return;
    const newExercises = [...editingRoutine.exercises];
    (newExercises[index] as any)[field] = value;
    setEditingRoutine({ ...editingRoutine, exercises: newExercises });
  };

  const removeExercise = (index: number) => {
    if (!editingRoutine) return;
    const newExercises = editingRoutine.exercises.filter((_, i) => i !== index);
    setEditingRoutine({ ...editingRoutine, exercises: newExercises });
  };

  const saveRoutine = async () => {
    if (!editingRoutine || !editingRoutine.name || editingRoutine.exercises.length === 0 || !user) return;

    try {
      if (editingRoutine.id) {
        const { error } = await supabase
          .from('routines')
          .update({
            name: editingRoutine.name,
            exercises: editingRoutine.exercises,
          })
          .eq('id', editingRoutine.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('routines').insert({
          user_id: user.id,
          name: editingRoutine.name,
          exercises: editingRoutine.exercises,
        });
        if (error) throw error;
      }

      await loadData();
      setEditingRoutine(null);
      showNotification('Rutina guardada correctamente', 'success');
    } catch (error) {
      console.error('Error guardando rutina:', error);
      showNotification('Error al guardar la rutina', 'error');
    }
  };

  const deleteRoutine = async (id: string) => {
    const routine = routines.find((r) => r.id === id);
    const routineName = routine?.name || 'esta rutina';
    
    showConfirm(`¿Eliminar la rutina "${routineName}"?`, async () => {
      try {
        const { error } = await supabase.from('routines').delete().eq('id', id);
        if (error) throw error;
        setRoutines(routines.filter((r) => r.id !== id));
        showNotification(`Rutina "${routineName}" eliminada correctamente`, 'success');
      } catch (error) {
        console.error('Error eliminando rutina:', error);
        showNotification('Error al eliminar la rutina', 'error');
      }
    });
  };

  // Workout operations
  const startWorkout = (routine: Routine) => {
    setSelectedRoutine({
      ...routine,
      date: getLocalDateString(),
      exercises: routine.exercises.map((ex) => ({
        ...ex,
        sets: Array(ex.sets).fill({ weight: 0, reps: 0 }),
      })),
    } as any);
    setActiveTab('workout');
  };

  const updateWorkoutSet = (exerciseIndex: number, setIndex: number, field: string, value: string) => {
    if (!selectedRoutine) return;
    const newRoutine = { ...selectedRoutine };
    newRoutine.exercises[exerciseIndex].sets[setIndex] = {
      ...newRoutine.exercises[exerciseIndex].sets[setIndex],
      [field]: parseFloat(value) || 0,
    };
    setSelectedRoutine(newRoutine);
  };

  const saveWorkout = async () => {
    if (!selectedRoutine || !user) return;

    const workoutDate = (selectedRoutine as any).date || getLocalDateString();

    const workoutData = {
      routine_name: selectedRoutine.name,
      date: workoutDate,
      exercises: selectedRoutine.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
      })),
    };

    try {
      if ((selectedRoutine as any).isEditing && (selectedRoutine as any).id) {
        const { error } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', (selectedRoutine as any).id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('workouts').insert({
          ...workoutData,
          user_id: user.id,
        });
        if (error) throw error;
      }

      await loadData();

      if ((selectedRoutine as any).fromCalendar) {
        setActiveTab('progress');
      }
      setSelectedRoutine(null);
      showNotification('¡Entrenamiento guardado correctamente!', 'success');
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
      showNotification('Error al guardar el entrenamiento', 'error');
    }
  };

  const deleteWorkout = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const workout = workouts.find((w) => w.id === id);
    const workoutName = workout?.routine_name || 'este entrenamiento';
    const workoutDate = workout?.date 
      ? parseLocalDate(workout.date).toLocaleDateString('es-ES')
      : '';
    const dateText = workoutDate ? ` del ${workoutDate}` : '';
    
    showConfirm(`¿Eliminar el entrenamiento "${workoutName}"${dateText}?`, async () => {
      try {
        const { error } = await supabase.from('workouts').delete().eq('id', id);
        if (error) throw error;
        setWorkouts(workouts.filter((w) => w.id !== id));
        setSelectedWorkoutDetail(null);
        showNotification(`Entrenamiento "${workoutName}" eliminado correctamente`, 'success');
      } catch (error) {
        console.error('Error eliminando entrenamiento:', error);
        showNotification('Error al eliminar el entrenamiento', 'error');
      }
    });
  };

  const editWorkout = (workout: Workout, e: React.MouseEvent, fromCalendar = false) => {
    e.stopPropagation();
    setSelectedRoutine({
      ...workout,
      isEditing: true,
      fromCalendar,
      name: workout.routine_name,
      exercises: workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets,
      })),
    } as any);
    setSelectedWorkoutDetail(null);
    setActiveTab('workout');
  };

  // Data management
  const exportToJSON = () => {
    const data = {
      routines,
      workouts,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-backup-${getLocalDateString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csv = 'Fecha,Rutina,Ejercicio,Serie,Peso(kg),Repeticiones\n';

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set, index) => {
          csv += `${workout.date},${workout.routine_name},${exercise.name},${
            index + 1
          },${set.weight},${set.reps}\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-workouts-${getLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (data.routines && Array.isArray(data.routines)) {
          for (const routine of data.routines) {
            await supabase.from('routines').insert({
              user_id: user.id,
              name: routine.name,
              exercises: routine.exercises,
            });
          }
        }

        if (data.workouts && Array.isArray(data.workouts)) {
          for (const workout of data.workouts) {
            await supabase.from('workouts').insert({
              user_id: user.id,
              routine_name: workout.routineName || workout.routine_name,
              date: workout.date,
              exercises: workout.exercises,
            });
          }
        }

        await loadData();
        showNotification('Datos importados correctamente', 'success');
        setShowSettings(false);
      } catch (error) {
        showNotification('Error al importar: archivo JSON inválido', 'error');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = async () => {
    if (!user) return;
    showConfirm(
      '¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.',
      async () => {
        try {
          await Promise.all([
            supabase.from('routines').delete().eq('user_id', user.id),
            supabase.from('workouts').delete().eq('user_id', user.id),
          ]);
          setRoutines([]);
          setWorkouts([]);
          showNotification('Todos los datos han sido borrados', 'success');
          setShowSettings(false);
        } catch (error) {
          console.error('Error borrando datos:', error);
          showNotification('Error al borrar los datos', 'error');
        }
      }
    );
  };

  return (
    <DataContext.Provider
      value={{
        routines,
        workouts,
        dataLoading,
        editingRoutine,
        setEditingRoutine,
        createRoutine,
        addExercise,
        updateExercise,
        removeExercise,
        saveRoutine,
        deleteRoutine,
        selectedRoutine,
        setSelectedRoutine,
        startWorkout,
        updateWorkoutSet,
        saveWorkout,
        deleteWorkout,
        editWorkout,
        loadData,
        exportToJSON,
        exportToCSV,
        importFromJSON,
        clearAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
