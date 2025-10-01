const RESIZE_OBSERVER_LIMIT_MESSAGE = 'ResizeObserver loop limit exceeded';
const RESIZE_OBSERVER_UNDELIVERED_MESSAGE =
  'ResizeObserver loop completed with undelivered notifications.';

const isResizeObserverError = (message) => {
  if (!message) return false;
  const msg = typeof message === 'string' ? message : message.toString();
  return msg.includes('ResizeObserver') || 
         msg === RESIZE_OBSERVER_LIMIT_MESSAGE || 
         msg === RESIZE_OBSERVER_UNDELIVERED_MESSAGE;
};

export const installResizeObserverErrorHandler = () => {
  if (typeof window === 'undefined' || window.__resizeObserverErrorHandlerInstalled) {
    return;
  }

  window.__resizeObserverErrorHandlerInstalled = true;

  // 拦截 window.error 事件
  const handleWindowError = (event) => {
    const message = event?.message || event?.error?.message;
    if (isResizeObserverError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return true;
    }
  };

  // 拦截 unhandledrejection 事件
  const handleUnhandledRejection = (event) => {
    const message = event?.reason?.message || event?.reason;
    if (isResizeObserverError(message)) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
      return true;
    }
  };

  window.addEventListener('error', handleWindowError, true);
  window.addEventListener('unhandledrejection', handleUnhandledRejection, true);

  // 重写 window.onerror
  const originalOnError = window.onerror;
  window.onerror = (message, source, lineno, colno, error) => {
    const text = typeof message === 'string' ? message : error?.message;
    if (isResizeObserverError(text)) {
      return true; // 返回 true 阻止错误显示
    }

    if (typeof originalOnError === 'function') {
      return originalOnError.call(window, message, source, lineno, colno, error);
    }

    return false;
  };

  // 重写 console.error（更激进的方式）
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const message = args[0];
    if (isResizeObserverError(message)) {
      // 完全忽略 ResizeObserver 错误
      return;
    }
    originalConsoleError.apply(console, args);
  };
};
