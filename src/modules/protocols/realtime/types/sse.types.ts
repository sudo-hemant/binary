export type SSEMethod = 'GET' | 'POST';

export interface SSEEvent {
  id: string;
  timestamp: number;
  event: string;
  data: any;
  raw: string;
}

export interface SSERequest {
  url: string;
  method: SSEMethod;
  headers?: Record<string, string>;
  body?: any;
}
