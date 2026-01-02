import React from 'react';
import { Calendar, Save, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import type { TabType } from '../types';

interface WorkoutTabProps {
  setActiveTab: (tab: TabType) => void;
}

export function WorkoutTab({ setActiveTab }: WorkoutTabProps) {
  const { theme } = useTheme();
  const {
    selectedRoutine,
    setSelectedRoutine,
    updateWorkoutSet,
    saveWorkout,
  } = useData();

  if (!selectedRoutine) {
    return (
      <div className='space-y-3 sm:space-y-4'>
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
      </div>
    );
  }

  const isEditing = (selectedRoutine as any).isEditing;
  const fromCalendar = (selectedRoutine as any).fromCalendar;

  return (
    <div className='space-y-3 sm:space-y-4'>
      <div className='space-y-3 sm:space-y-4'>
        <div
          className={`p-4 sm:p-6 rounded-lg ${theme.card} border ${theme.border}`}
        >
          <h2 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>
            {isEditing && <span className="text-blue-500">Editando: </span>}
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
            {isEditing ? 'Actualizar Entrenamiento' : 'Guardar Entrenamiento'}
          </button>
          <button
            onClick={() => {
              setSelectedRoutine(null);
              if (fromCalendar) setActiveTab('progress');
            }}
            className='flex-1 py-3 sm:py-4 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 active:bg-red-800 flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base'
          >
            <X className='w-5 h-5' />
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
