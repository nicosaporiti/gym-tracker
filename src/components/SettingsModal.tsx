import React from 'react';
import { X, Download, Upload, Trash2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { exportToJSON, exportToCSV, importFromJSON, clearAllData } = useData();

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50'>
      <div
        className={`${theme.card} ${theme.text} rounded-lg p-4 sm:p-6 max-w-md w-full space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto`}
      >
        <div className='flex items-center justify-between mb-3 sm:mb-4'>
          <h2 className='text-xl sm:text-2xl font-bold'>Configuración</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme.hover} touch-manipulation`}
            aria-label='Close settings'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className={`p-3 rounded-lg border ${theme.border} mb-4`}>
          <p className={`text-sm ${theme.textSecondary}`}>Sesión iniciada como:</p>
          <p className="font-medium truncate">{user?.email}</p>
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
  );
}
