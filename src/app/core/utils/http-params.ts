import { HttpParams } from '@angular/common/http';

export function buildPageParams(filters: { page: number; size: number } & Record<string, string | number>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === '' || value === null || value === undefined) continue;
    params = params.set(key, key === 'page' ? Number(value) - 1 : value);
  }
  return params;
}
