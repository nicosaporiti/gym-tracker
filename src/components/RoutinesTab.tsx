import React from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';

export function RoutinesTab() {
  const { theme } = useTheme();
  const {
    routines,
    editingRoutine,
    setEditingRoutine,
    createRoutine,
    addExercise,
    updateExercise,
    removeExercise,
    saveRoutine,
    deleteRoutine,
    startWorkout,
  } = useData();

  return (
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
                  onClick={() => setEditingRoutine(routine as any)}
                  className={`p-2 rounded-lg ${theme.hover} touch-manipulation`}
                  aria-label='Editar rutina'
                >
                  <Edit2 className='w-5 h-5' />
                </button>
                <button
                  onClick={() => deleteRoutine(routine.id!)}
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
  );
}
