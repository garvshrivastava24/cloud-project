import React from 'react';

export default function Notification({ notification, onDismiss }) {
  if (!notification || !notification.message) return null;

  return (
    <div
      role="alert"
      className={`alert ${
        notification.type === 'error' ? 'alert-error' : 'alert-success'
      }`}
    >
      <span>{notification.message}</span>
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
