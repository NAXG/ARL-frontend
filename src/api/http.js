import axios from 'axios';
import { message } from 'ant-design-vue';
import { clearAuth, getToken } from '@/utils/auth';

const baseURL = process.env.VUE_APP_API_BASE_URL || '/';
const requestTimeout = Number(process.env.VUE_APP_API_TIMEOUT || 10000);

const http = axios.create({
  baseURL,
  timeout: Number.isFinite(requestTimeout) ? requestTimeout : 10000
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Token = token;
  }
  return config;
});

let unauthorizedNotified = false;

const notifyUnauthorized = () => {
  if (!unauthorizedNotified) {
    unauthorizedNotified = true;
    message.error('登录已过期，请重新登录');
    setTimeout(() => {
      unauthorizedNotified = false;
    }, 1000);
  }
};

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const errorMessage = data?.message || `请求失败（${status}）`;

      if (status === 401) {
        notifyUnauthorized();
        clearAuth();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
      } else if (status >= 500) {
        message.error('服务器异常，请稍后重试');
      } else {
        message.error(errorMessage);
      }

      console.error(`API error: ${status}`, data);
    } else {
      message.error('网络连接异常，请检查后重试');
      console.error('API error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default http;
