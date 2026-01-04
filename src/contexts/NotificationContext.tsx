import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  } | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const showConfirm = useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void) => {
      setConfirmModal({ message, onConfirm, onCancel });
    },
    []
  );

  const handleConfirm = () => {
    if (confirmModal) {
      confirmModal.onConfirm();
      setConfirmModal(null);
    }
  };

  const handleCancel = () => {
    if (confirmModal?.onCancel) {
      confirmModal.onCancel();
    }
    setConfirmModal(null);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationType) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-500`} strokeWidth={2.5} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-500`} strokeWidth={2.5} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-yellow-500`} strokeWidth={2.5} />;
      default:
        return <Info className={`${iconClass} text-blue-500`} strokeWidth={2.5} />;
    }
  };

  const getIconContainer = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm }}>
      {children}
      
      {/* Toast Notifications */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 flex flex-col gap-2 sm:gap-3 max-w-[calc(100vw-1.5rem)] sm:max-w-md w-full sm:w-auto pointer-events-none">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-gray-800 dark:bg-gray-900 rounded-lg p-3 sm:p-4 shadow-xl border border-gray-700 dark:border-gray-800 flex items-start gap-2.5 sm:gap-3 pointer-events-auto animate-slide-in"
          >
            <div className={`flex-shrink-0 w-7 h-7 sm:w-6 sm:h-6 rounded-full border-2 ${getIconContainer(notification.type)} flex items-center justify-center bg-gray-800 dark:bg-gray-900`}>
              <div className="scale-110 sm:scale-100">
                {getIcon(notification.type)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-base sm:text-sm font-medium leading-snug sm:leading-tight">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-300 transition-colors p-1.5 sm:p-1 -mt-1 -mr-1 touch-manipulation"
              aria-label="Cerrar notificación"
            >
              <X className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 max-w-md w-full shadow-xl mx-3 sm:mx-0">
            <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-4">
              <div className="flex-shrink-0 w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Confirmar acción
                </h3>
                <p className="text-sm sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-3 sm:py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 transition-colors font-medium text-base sm:text-sm touch-manipulation"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-3 sm:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors font-medium text-base sm:text-sm touch-manipulation"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

