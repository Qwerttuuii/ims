import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

type AlertVariant = 'success' | 'error' | 'info';

type AlertOptions = {
  title?: string;
  message: string;
  variant?: AlertVariant;
};

type AlertItem = Required<AlertOptions> & {
  id: number;
};

type AlertContextValue = {
  showAlert: (options: AlertOptions) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

const variants = {
  success: {
    icon: CheckCircle2,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
    iconClassName: 'text-red-600',
  },
  info: {
    icon: Info,
    className: 'border-blue-100 bg-white text-zinc-800',
    iconClassName: 'text-blue-950',
  },
};

export function AppAlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const dismissAlert = useCallback((id: number) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const showAlert = useCallback(
    ({ title, message, variant = 'info' }: AlertOptions) => {
      const id = Date.now();
      const alert = {
        id,
        title: title || (variant === 'success' ? 'Success' : variant === 'error' ? 'Something went wrong' : 'Notice'),
        message,
        variant,
      };

      setAlerts((current) => [...current, alert].slice(-3));
      window.setTimeout(() => dismissAlert(id), 4500);
    },
    [dismissAlert]
  );

  const value = useMemo(() => ({ showAlert }), [showAlert]);

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-3 pointer-events-none">
        {alerts.map((alert) => {
          const styles = variants[alert.variant];
          const Icon = styles.icon;

          return (
            <div
              key={alert.id}
              className={`pointer-events-auto w-full sm:w-96 rounded-2xl border p-4 shadow-xl shadow-blue-950/10 ${styles.className}`}
              role="status"
            >
              <div className="flex gap-3">
                <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.iconClassName}`} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-5">{alert.title}</p>
                  <p className="mt-1 text-sm leading-5 opacity-80">{alert.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="rounded-full p-1 opacity-60 transition hover:bg-black/5 hover:opacity-100"
                  aria-label="Dismiss alert"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error('useAppAlert must be used inside AppAlertProvider');
  }

  return context;
}
