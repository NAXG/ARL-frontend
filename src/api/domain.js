import http from './http';

export function fetchDomainPrefixStat(params) {
  return http.get('/domain/prefix_stat/', { params });
}
