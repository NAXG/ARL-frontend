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
    if (isResizeObserverError(event?.message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  const handleUnhandledRejection = (event) => {
    if (isResizeObserverError(event?.reason?.message)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  };

  window.addEventListener('error', handleWindowError);
  window.addEventListener('unhandledrejection', handleUnhandledRejection);
};
