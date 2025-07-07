import { SSERequest, SSEEvent } from '../types/sse.types';

export class SSEService {
  private abortController: AbortController | null = null;
  private eventSource: EventSource | null = null;

  async connect(
    request: SSERequest,
    onEvent: (event: SSEEvent) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      // Close existing connection
      this.disconnect();
      
      this.abortController = new AbortController();

      const fetchOptions: RequestInit = {
        method: request.method,
        headers: {
          ...request.headers,
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
          ...(request.method === 'POST' && { 'Content-Type': 'application/json' })
        },
        signal: this.abortController.signal,
        // Only include body for POST requests
        // ...(request.method === 'POST' && request.body && { body: JSON.stringify(request.body) }),
      };

      const response = await fetch(request.url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      let currentEvent = '';

      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Parse any remaining event
          if (currentEvent) {
            this.parseSSEEvent(currentEvent, onEvent);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in buffer
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.trim() === '') {
            // Empty line indicates end of event
            if (currentEvent) {
              this.parseSSEEvent(currentEvent, onEvent);
              currentEvent = '';
            }
          } else {
            currentEvent += line + '\n';
          }
        }
      }
    } catch (error: any) {
      // Don't report abort errors as they're expected when disconnecting
      if (error.name === 'AbortError' || error.message?.includes('aborted')) {
        console.log('SSE connection aborted');
        return;
      }
      
      console.error('SSE connection error:', error);
      onError(error.message || 'Failed to connect');
      this.disconnect();
    }
  }

  private parseSSEEvent(eventText: string, onEvent: (event: SSEEvent) => void) {
    const lines = eventText.trim().split('\n');
    let eventName = 'message';
    let eventData = '';
    
    for (const line of lines) {
      if (line.startsWith('event:')) {
        eventName = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        // Accumulate data lines
        if (eventData) eventData += '\n';
        eventData += line.substring(5).trim();
      }
    }
    
    if (eventData) {
      try {
        // Try to parse as JSON
        let parsedData;
        try {
          parsedData = JSON.parse(eventData);
        } catch {
          parsedData = eventData;
        }

        const sseEvent: SSEEvent = {
          id: Date.now().toString() + Math.random(),
          timestamp: Date.now(),
          event: eventName,
          data: parsedData,
          raw: eventData
        };

        onEvent(sseEvent);
      } catch (error) {
        console.error('Error parsing SSE event:', error);
      }
    }
  }

  disconnect() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}