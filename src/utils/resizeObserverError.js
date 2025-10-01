const RESIZE_OBSERVER_LIMIT_MESSAGE = 'ResizeObserver loop limit exceeded';
const RESIZE_OBSERVER_UNDELIVERED_MESSAGE =
  'ResizeObserver loop completed with undelivered notifications.';

const isResizeObserverError = (message) =>
  message === RESIZE_OBSERVER_LIMIT_MESSAGE || message === RESIZE_OBSERVER_UNDELIVERED_MESSAGE;

export const installResizeObserverErrorHandler = () => {
  if (typeof window === 'undefined' || window.__resizeObserverErrorHandlerInstalled) {
    return;
  }

  window.__resizeObserverErrorHandlerInstalled = true;

  const handleWindowError = (event) => {
    const message = event?.message || event?.error?.message;
    if (isResizeObserverError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const handleUnhandledRejection = (event) => {
    const message = event?.reason?.message || event?.reason;
    if (isResizeObserverError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  };

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const text = typeof message === 'string' ? message : error?.message;
    if (isResizeObserverError(text)) {
      return true;
    }

    if (typeof originalOnError === 'function') {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }

    return false;
  };
};
