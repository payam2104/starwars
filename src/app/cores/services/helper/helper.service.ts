import { Injectable } from '@angular/core';
import * as url from '../../../../config/url.json';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  /**
   * Build an absolute API endpoint from the base URI in config/url.json.
   * Assumes apiUri has no trailing slash; `path` must not start with a slash.
   */
  tsmsUrl(path: string): string {
    return `${url.apiUri}/${path}`;
  }

  /**
   * Convert HttpErrorResponse into a short, user-friendly message.
   * - status 0: network/CORS/offline
   * - 5xx: server-side failure
   * - otherwise: include HTTP status and any backend-provided message
   */
  formatError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Network error! Are you online?';
    if (err.status >= 500) return 'Server error. Please try again later.';
    return `Error ${err.status}: ${err.error?.message ?? 'Unknown error'}`;
  }

}
