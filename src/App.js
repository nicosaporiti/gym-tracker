import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Dumbbell,
  Calendar,
  TrendingUp,
  Moon,
  Sun,
  Download,
  Upload,
  Settings,
  LogOut,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from './supabaseClient';

// Componente de Autenticación
function AuthForm({ darkMode, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    input: darkMode
      ? 'bg-gray-700 text-gray-100 border-gray-600'
      : 'bg-white text-gray-900 border-gray-300',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Revisa tu email para confirmar tu cuenta');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center p-4`}>
      <div className={`w-full max-w-md ${theme.card} rounded-xl p-6 sm:p-8 border ${theme.border}`}>
        <div className="flex items-center justify-center gap-3 mb-6">
          <Dumbbell className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold">Gym Tracker</h1>
        </div>

        <h2 className="text-xl font-semibold text-center mb-6">
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
              Email
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSecondary}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme.input}`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.textSecondary}`}>
              Contraseña
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${theme.textSecondary}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme.input}`}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg bg-green-500/20 text-green-400 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <User className="w-5 h-5" />
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setMessage(null);
            }}
            className={`text-sm ${theme.textSecondary} hover:text-blue-500`}
          >
            {isLogin
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente Principal
export default function GymTracker() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('routines');
  const [routines, setRoutines] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('gym-darkmode');
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      const [routinesRes, workoutsRes] = await Promise.all([
        supabase.from('routines').select('*').order('created_at', { ascending: false }),
        supabase.from('workouts').select('*').order('created_at', { ascending: false }),
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

  // Cargar datos cuando hay usuario
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setRoutines([]);
      setWorkouts([]);
    }
  }, [user, loadData]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('gym-darkmode', newMode.toString());
  };

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
  };

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

  const importFromJSON = async (event) => {
    const file = event.target.files[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);

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
        alert('Datos importados correctamente');
        setShowSettings(false);
      } catch (error) {
        alert('Error al importar: archivo JSON inválido');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = async () => {
    if (!user) return;
    if (
      window.confirm(
        '¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.'
      )
    ) {
      try {
        await Promise.all([
          supabase.from('routines').delete().eq('user_id', user.id),
          supabase.from('workouts').delete().eq('user_id', user.id),
        ]);
        setRoutines([]);
        setWorkouts([]);
        alert('Todos los datos han sido borrados');
        setShowSettings(false);
      } catch (error) {
        console.error('Error borrando datos:', error);
        alert('Error al borrar los datos');
      }
    }
  };

  const createRoutine = () => {
    setEditingRoutine({
      id: null,
      name: '',
      exercises: [],
    });
  };

  const addExercise = () => {
    setEditingRoutine({
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, { name: '', sets: 3, reps: 10 }],
    });
  };

  const updateExercise = (index, field, value) => {
    const newExercises = [...editingRoutine.exercises];
    newExercises[index][field] = value;
    setEditingRoutine({ ...editingRoutine, exercises: newExercises });
  };

  const removeExercise = (index) => {
    const newExercises = editingRoutine.exercises.filter((_, i) => i !== index);
    setEditingRoutine({ ...editingRoutine, exercises: newExercises });
  };

  const saveRoutine = async () => {
    if (!editingRoutine.name || editingRoutine.exercises.length === 0 || !user) return;

    try {
      if (editingRoutine.id) {
        // Update existing
        const { error } = await supabase
          .from('routines')
          .update({
            name: editingRoutine.name,
            exercises: editingRoutine.exercises,
          })
          .eq('id', editingRoutine.id);
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase.from('routines').insert({
          user_id: user.id,
          name: editingRoutine.name,
          exercises: editingRoutine.exercises,
        });
        if (error) throw error;
      }

      await loadData();
      setEditingRoutine(null);
    } catch (error) {
      console.error('Error guardando rutina:', error);
      alert('Error al guardar la rutina');
    }
  };

  const deleteRoutine = async (id) => {
    if (window.confirm('¿Eliminar esta rutina?')) {
      try {
        const { error } = await supabase.from('routines').delete().eq('id', id);
        if (error) throw error;
        setRoutines(routines.filter((r) => r.id !== id));
      } catch (error) {
        console.error('Error eliminando rutina:', error);
        alert('Error al eliminar la rutina');
      }
    }
  };

  const deleteWorkout = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('¿Eliminar este entrenamiento?')) {
      try {
        const { error } = await supabase.from('workouts').delete().eq('id', id);
        if (error) throw error;
        setWorkouts(workouts.filter((w) => w.id !== id));
        setSelectedWorkoutDetail(null);
      } catch (error) {
        console.error('Error eliminando entrenamiento:', error);
        alert('Error al eliminar el entrenamiento');
      }
    }
  };

  const editWorkout = (workout, e) => {
    e.stopPropagation();
    setSelectedRoutine({
      ...workout,
      isEditing: true,
      name: workout.routine_name,
      exercises: workout.exercises.map((ex) => ({
        ...ex,
        sets: ex.sets,
      })),
    });
    setSelectedWorkoutDetail(null);
    setActiveTab('workout');
  };

  const startWorkout = (routine) => {
    setSelectedRoutine({
      ...routine,
      date: getLocalDateString(),
      exercises: routine.exercises.map((ex) => ({
        ...ex,
        sets: Array(ex.sets).fill({ weight: 0, reps: 0 }),
      })),
    });
    setActiveTab('workout');
  };

  const updateWorkoutSet = (exerciseIndex, setIndex, field, value) => {
    const newRoutine = { ...selectedRoutine };
    newRoutine.exercises[exerciseIndex].sets[setIndex] = {
      ...newRoutine.exercises[exerciseIndex].sets[setIndex],
      [field]: parseFloat(value) || 0,
    };
    setSelectedRoutine(newRoutine);
  };

  const saveWorkout = async () => {
    if (!user) return;

    let workoutDate = selectedRoutine.date;
    if (workoutDate) {
      const dateObj = parseLocalDate(workoutDate);
      workoutDate = getLocalDateString(dateObj);
    } else {
      workoutDate = getLocalDateString();
    }

    const workoutData = {
      routine_name: selectedRoutine.name,
      date: workoutDate,
      exercises: selectedRoutine.exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets,
      })),
    };

    try {
      if (selectedRoutine.isEditing) {
        // Update existing workout
        const { error } = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', selectedRoutine.id);
        if (error) throw error;
      } else {
        // Insert new workout
        const { error } = await supabase.from('workouts').insert({
          ...workoutData,
          user_id: user.id,
          routine_id: selectedRoutine.id,
        });
        if (error) throw error;
      }

      await loadData();
      setSelectedRoutine(null);
      setActiveTab('progress');
    } catch (error) {
      console.error('Error guardando entrenamiento:', error);
      alert('Error al guardar el entrenamiento');
    }
  };

  const getExerciseData = (exerciseName) => {
    const exerciseWorkouts = workouts
      .filter((w) => w.exercises.some((e) => e.name === exerciseName))
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));

    return exerciseWorkouts.map((w) => {
      const exercise = w.exercises.find((e) => e.name === exerciseName);
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
    });
  };

  const getAllExercises = () => {
    const exercises = new Set();
    workouts.forEach((w) => {
      w.exercises.forEach((e) => exercises.add(e.name));
    });
    return Array.from(exercises);
  };

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

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    input: darkMode
      ? 'bg-gray-700 text-gray-100 border-gray-600'
      : 'bg-white text-gray-900 border-gray-300',
    hover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
  };

  // Loading auth state
  if (authLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // No user - show auth form
  if (!user) {
    return <AuthForm darkMode={darkMode} />;
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-200`}
    >
      <div className='max-w-6xl mx-auto p-3 sm:p-4'>
        <div className='flex items-center justify-between mb-4 sm:mb-8'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <Dumbbell className='w-6 h-6 sm:w-8 sm:h-8' />
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>
              Gym Tracker
            </h1>
          </div>
          <div className='flex gap-1 sm:gap-2'>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${theme.card} ${theme.hover} touch-manipulation`}
              aria-label='Toggle dark mode'
            >
              {darkMode ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${theme.card} ${theme.hover} touch-manipulation`}
              aria-label='Settings'
            >
              <Settings className='w-5 h-5' />
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${theme.card} ${theme.hover} touch-manipulation text-red-500`}
              aria-label='Logout'
            >
              <LogOut className='w-5 h-5' />
            </button>
          </div>
        </div>

        {showSettings && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50'>
            <div
              className={`${theme.card} rounded-lg p-4 sm:p-6 max-w-md w-full space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto`}
            >
              <div className='flex items-center justify-between mb-3 sm:mb-4'>
                <h2 className='text-xl sm:text-2xl font-bold'>Configuración</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`p-2 rounded-lg ${theme.hover} touch-manipulation`}
                  aria-label='Close settings'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              <div className={`p-3 rounded-lg border ${theme.border} mb-4`}>
                <p className={`text-sm ${theme.textSecondary}`}>Sesión iniciada como:</p>
                <p className="font-medium truncate">{user.email}</p>
              </div>

              <div className='space-y-2 sm:space-y-3'>
                <button
                  onClick={exportToJSON}
                  className='w-full py-3 px-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                >
                  <Download className='w-5 h-5 flex-shrink-0' />
                  <span className='text-center'>Exportar a JSON</span>
                </button>

                <button
                  onClick={exportToCSV}
                  className='w-full py-3 px-4 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                >
                  <Download className='w-5 h-5 flex-shrink-0' />
                  <span className='text-center'>Exportar a CSV</span>
                </button>

                <label className='w-full py-3 px-4 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 active:bg-purple-800 flex items-center justify-center gap-2 cursor-pointer touch-manipulation text-sm sm:text-base'>
                  <Upload className='w-5 h-5 flex-shrink-0' />
                  <span className='text-center'>Importar desde JSON</span>
                  <input
                    type='file'
                    accept='.json'
                    onChange={importFromJSON}
                    className='hidden'
                  />
                </label>

                <div className={`border-t ${theme.border} pt-2 sm:pt-3`}>
                  <button
                    onClick={clearAllData}
                    className='w-full py-3 px-4 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                  >
                    <Trash2 className='w-5 h-5 flex-shrink-0' />
                    <span className='text-center'>Borrar todos los datos</span>
                  </button>
                </div>
              </div>

              <div
                className={`text-xs sm:text-sm ${theme.textSecondary} mt-3 sm:mt-4`}
              >
                <p>
                  <strong>JSON:</strong> Backup completo de rutinas y
                  entrenamientos.
                </p>
                <p className='mt-1 sm:mt-2'>
                  <strong>CSV:</strong> Solo entrenamientos para análisis
                  externo.
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`flex gap-1 sm:gap-2 mb-4 sm:mb-6 p-1 rounded-lg ${theme.card}`}
        >
          {[
            { id: 'routines', label: 'Rutinas', icon: Dumbbell },
            { id: 'workout', label: 'Entrenar', icon: Calendar },
            { id: 'progress', label: 'Progreso', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg transition-colors touch-manipulation text-xs sm:text-sm ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : `${theme.hover} ${theme.textSecondary}`
              }`}
            >
              <Icon className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
              <span className='hidden xs:inline sm:inline'>{label}</span>
            </button>
          ))}
        </div>

        {dataLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!dataLoading && activeTab === 'routines' && (
          <div className='space-y-3 sm:space-y-4'>
            {!editingRoutine && (
              <button
                onClick={createRoutine}
                className='w-full py-3 sm:py-4 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
              >
                <Plus className='w-5 h-5' />
                Nueva Rutina
              </button>
            )}

            {editingRoutine && (
              <div
                className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border} space-y-3 sm:space-y-4`}
              >
                <input
                  type='text'
                  placeholder='Nombre de la rutina'
                  value={editingRoutine.name}
                  onChange={(e) =>
                    setEditingRoutine({
                      ...editingRoutine,
                      name: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                />

                <div className='space-y-3'>
                  {editingRoutine.exercises.map((exercise, index) => (
                    <div
                      key={index}
                      className={`p-3 sm:p-4 rounded-lg border ${theme.border} space-y-2 sm:space-y-2`}
                    >
                      <div className='flex items-center gap-2'>
                        <input
                          type='text'
                          placeholder='Nombre del ejercicio'
                          value={exercise.name}
                          onChange={(e) =>
                            updateExercise(index, 'name', e.target.value)
                          }
                          className={`flex-1 px-3 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                        />
                        <button
                          onClick={() => removeExercise(index)}
                          className='p-2.5 sm:p-2 rounded-lg hover:bg-red-600 active:bg-red-700 text-red-500 hover:text-white touch-manipulation flex-shrink-0'
                          aria-label='Eliminar ejercicio'
                        >
                          <Trash2 className='w-4 h-4 sm:w-4 sm:h-4' />
                        </button>
                      </div>
                      <div className='flex gap-2'>
                        <input
                          type='number'
                          placeholder='Series'
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExercise(
                              index,
                              'sets',
                              parseInt(e.target.value)
                            )
                          }
                          className={`w-1/2 sm:w-24 px-3 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                        />
                        <input
                          type='number'
                          placeholder='Reps'
                          value={exercise.reps}
                          onChange={(e) =>
                            updateExercise(
                              index,
                              'reps',
                              parseInt(e.target.value)
                            )
                          }
                          className={`w-1/2 sm:w-24 px-3 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={addExercise}
                    className={`flex-1 py-3 sm:py-2 rounded-lg border ${theme.border} ${theme.hover} active:opacity-80 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base`}
                  >
                    <Plus className='w-4 h-4' />
                    Agregar Ejercicio
                  </button>
                </div>

                <div className='flex flex-col sm:flex-row gap-2'>
                  <button
                    onClick={saveRoutine}
                    className='flex-1 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                  >
                    <Save className='w-5 h-5' />
                    Guardar
                  </button>
                  <button
                    onClick={() => setEditingRoutine(null)}
                    className='flex-1 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                  >
                    <X className='w-5 h-5' />
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className='grid gap-3 sm:gap-4'>
              {routines.map((routine) => (
                <div
                  key={routine.id}
                  className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
                >
                  <div className='flex items-start justify-between mb-3 sm:mb-4 gap-2'>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-lg sm:text-xl font-bold mb-1 sm:mb-2 truncate'>
                        {routine.name}
                      </h3>
                      <p className={`${theme.textSecondary} text-sm`}>
                        {routine.exercises.length} ejercicios
                      </p>
                    </div>
                    <div className='flex gap-1 sm:gap-2 flex-shrink-0'>
                      <button
                        onClick={() => setEditingRoutine(routine)}
                        className={`p-2 rounded-lg ${theme.hover} touch-manipulation`}
                        aria-label='Editar rutina'
                      >
                        <Edit2 className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className='p-2 rounded-lg hover:bg-red-600 active:bg-red-700 text-red-500 hover:text-white touch-manipulation'
                        aria-label='Eliminar rutina'
                      >
                        <Trash2 className='w-5 h-5' />
                      </button>
                    </div>
                  </div>
                  <div className='space-y-1.5 sm:space-y-2 mb-3 sm:mb-4'>
                    {routine.exercises.map((ex, i) => (
                      <div
                        key={i}
                        className={`flex justify-between ${theme.textSecondary} text-sm`}
                      >
                        <span className='truncate pr-2'>{ex.name}</span>
                        <span className='flex-shrink-0'>
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => startWorkout(routine)}
                    className='w-full py-3 sm:py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 active:bg-blue-800 touch-manipulation text-sm sm:text-base'
                  >
                    Comenzar Entrenamiento
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!dataLoading && activeTab === 'workout' && (
          <div className='space-y-3 sm:space-y-4'>
            {!selectedRoutine ? (
              <div
                className={`p-6 sm:p-8 rounded-lg ${theme.card} border ${theme.border} text-center`}
              >
                <Calendar className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50' />
                <p
                  className={`text-base sm:text-lg ${theme.textSecondary} px-2`}
                >
                  Selecciona una rutina desde la pestaña Rutinas para comenzar
                </p>
              </div>
            ) : (
              <div className='space-y-3 sm:space-y-4'>
                <div
                  className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
                >
                  <h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>
                    {selectedRoutine.isEditing && <span className="text-blue-500">Editando: </span>}
                    {selectedRoutine.name}
                  </h2>
                  <div className='space-y-2'>
                    <label
                      className={`text-sm font-medium ${theme.textSecondary}`}
                    >
                      Fecha del entrenamiento
                    </label>
                    <input
                      type='date'
                      value={selectedRoutine.date}
                      onChange={(e) =>
                        setSelectedRoutine({
                          ...selectedRoutine,
                          date: e.target.value,
                        })
                      }
                      className={`w-full px-4 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                    />
                  </div>
                </div>

                {selectedRoutine.exercises.map((exercise, exIndex) => (
                  <div
                    key={exIndex}
                    className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
                  >
                    <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                      {exercise.name}
                    </h3>
                    <div className='space-y-2.5 sm:space-y-3'>
                      {exercise.sets.map((set, setIndex) => (
                        <div
                          key={setIndex}
                          className={`p-2 sm:p-0 rounded-lg border ${theme.border} sm:border-0`}
                        >
                          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3'>
                            <span
                              className={`${theme.textSecondary} text-xs sm:text-sm font-medium sm:font-normal w-16 sm:w-16 flex-shrink-0`}
                            >
                              Serie {setIndex + 1}
                            </span>
                            <div className='flex items-center gap-2 sm:gap-3 w-full sm:flex-1'>
                              <input
                                type='number'
                                step='0.5'
                                placeholder='Kg'
                                value={set.weight || ''}
                                onChange={(e) =>
                                  updateWorkoutSet(
                                    exIndex,
                                    setIndex,
                                    'weight',
                                    e.target.value
                                  )
                                }
                                className={`flex-1 min-w-0 px-3 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                              />
                              <span
                                className={`${theme.textSecondary} text-base sm:text-lg flex-shrink-0`}
                              >
                                ×
                              </span>
                              <input
                                type='number'
                                placeholder='Reps'
                                value={set.reps || ''}
                                onChange={(e) =>
                                  updateWorkoutSet(
                                    exIndex,
                                    setIndex,
                                    'reps',
                                    e.target.value
                                  )
                                }
                                className={`flex-1 min-w-0 px-3 py-3 sm:py-2 rounded-lg border ${theme.input} text-base sm:text-sm`}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className='flex flex-col sm:flex-row gap-2'>
                  <button
                    onClick={saveWorkout}
                    className='flex-1 py-3 sm:py-4 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700 active:bg-green-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                  >
                    <Save className='w-5 h-5' />
                    {selectedRoutine.isEditing ? 'Actualizar Entrenamiento' : 'Guardar Entrenamiento'}
                  </button>
                  <button
                    onClick={() => setSelectedRoutine(null)}
                    className='flex-1 py-3 sm:py-4 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
                  >
                    <X className='w-5 h-5' />
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!dataLoading && activeTab === 'progress' && (
          <div className='space-y-4 sm:space-y-6'>
            {workouts.length === 0 ? (
              <div
                className={`p-6 sm:p-8 rounded-lg ${theme.card} border ${theme.border} text-center`}
              >
                <TrendingUp className='w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50' />
                <p className={`text-base sm:text-lg ${theme.textSecondary}`}>
                  Aún no hay entrenamientos registrados
                </p>
              </div>
            ) : (
              <>
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
                      {new Set(workouts.map((w) => w.date)).size}
                    </p>
                    <p className={`${theme.textSecondary} text-xs sm:text-sm`}>
                      Días activos
                    </p>
                  </div>
                </div>

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
                              border: `1px solid ${
                                darkMode ? '#374151' : '#e5e7eb'
                              }`,
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
                              border: `1px solid ${
                                darkMode ? '#374151' : '#e5e7eb'
                              }`,
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

                <div
                  className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
                >
                  <h3 className='text-lg sm:text-xl font-bold mb-3 sm:mb-4'>
                    Historial Reciente
                  </h3>
                  <div className='space-y-2 sm:space-y-3'>
                    {workouts
                      .slice(0, 10)
                      .map((workout) => {
                        const totalVolume = getWorkoutTotalVolume(workout);
                        const isExpanded = selectedWorkoutDetail === workout.id;

                        return (
                          <div key={workout.id}>
                            <div
                              onClick={() =>
                                setSelectedWorkoutDetail(
                                  isExpanded ? null : workout.id
                                )
                              }
                              className={`p-3 sm:p-4 rounded-lg border ${
                                theme.border
                              } cursor-pointer transition-colors ${
                                theme.hover
                              } ${isExpanded ? 'ring-2 ring-blue-500' : ''}`}
                            >
                              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 mb-1 sm:mb-2'>
                                <span className='font-medium text-sm sm:text-base truncate'>
                                  {workout.routine_name}
                                </span>
                                <span
                                  className={`${theme.textSecondary} text-xs sm:text-sm flex-shrink-0`}
                                >
                                  {parseLocalDate(
                                    workout.date
                                  ).toLocaleDateString('es-ES')}
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
                                      onClick={(e) => deleteWorkout(workout.id, e)}
                                      className='p-2 rounded-lg hover:bg-red-600 active:bg-red-700 text-red-500 hover:text-white touch-manipulation'
                                      aria-label='Eliminar entrenamiento'
                                    >
                                      <Trash2 className='w-4 h-4' />
                                    </button>
                                  </div>
                                </div>
                                {getWorkoutExerciseSummary(workout).map(
                                  (exercise, idx) => (
                                    <div
                                      key={idx}
                                      className={`p-2 sm:p-3 rounded border ${theme.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2`}
                                    >
                                      <span className='font-medium text-sm sm:text-base'>
                                        {exercise.name}
                                      </span>
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
                                          Total:{' '}
                                          {exercise.totalVolume.toFixed(1)} kg
                                        </span>
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
