export type ErrorType = 
  | 'validation' 
  | 'network' 
  | 'timeout' 
  | 'http_client'  // 4xx errors
  | 'http_server'  // 5xx errors
  | 'cors'
  | 'unknown';

export interface ErrorResponse {
  type: ErrorType;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
  // For validation errors
  validationErrors?: string[];
  // For HTTP errors
  status?: number;
  statusText?: string;
  // Original error for debugging
  originalError?: unknown;
}