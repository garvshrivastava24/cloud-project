import React, { useEffect } from 'react';

/**
 * Notification — A dismissible alert banner for success, error, info, and warning messages.
 *
 * Props:
 *   - notification: { message: string, type: 'success' | 'error' | 'info' | 'warning' }
 *   - onDismiss: callback to clear the notification
 *   - autoDismissMs: optional ms after which it auto-dismisses (default: no auto-dismiss)
 */
export default function Notification({ notification, onDismiss, autoDismissMs }) {
  // Auto-dismiss after the given timeout if provided
  useEffect(() => {
    if (!notification || !notification.message || !autoDismissMs) return;
    const timer = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(timer);
  }, [notification, onDismiss, autoDismissMs]);

  if (!notification || !notification.message) return null;

  const typeClass = {
    success: 'alert-success',
    error: 'alert-error',
    info: 'alert-info',
    warning: 'alert-warning',
  }[notification.type] || 'alert-success';

  const typeIcon = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }[notification.type] || '✅';

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`alert ${typeClass}`}
    >
      <span className="alert-icon" aria-hidden="true">{typeIcon}</span>
      <span className="alert-message">{notification.message}</span>
      <button
        type="button"
        className="alert-close-btn"
        onClick={onDismiss}
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
}
