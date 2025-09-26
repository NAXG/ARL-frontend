import axios from 'axios';
import { getToken } from '@/utils/auth';

const http = axios.create({
  baseURL: '/',
  timeout: 10000
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Token = token;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(`API error: ${error.response.status}`, error.response.data);
    } else {
      console.error('API error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default http;
