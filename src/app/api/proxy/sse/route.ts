import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Generate random data types
  const getRandomData = () => {
    const dataTypes = [
      () => ({ type: 'user', name: `User${Math.floor(Math.random() * 1000)}`, status: 'online' }),
      () => ({ type: 'message', content: `Random message ${Math.floor(Math.random() * 100)}`, timestamp: Date.now() }),
      () => ({ type: 'metric', cpu: Math.floor(Math.random() * 100), memory: Math.floor(Math.random() * 100) }),
      () => ({ type: 'notification', title: 'New Event', message: `Event ${Math.floor(Math.random() * 50)}` }),
      () => ({ type: 'price', symbol: 'BTC', price: (Math.random() * 50000 + 30000).toFixed(2) })
    ];
    
    const randomType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
    return randomType();
  };

  const stream = new ReadableStream({
    start(controller) {
      let intervalId: NodeJS.Timeout;
      let messageCount = 0;
      let isAborted = false;
      
      const sendEvent = (eventName: string, data: any) => {
        if (isAborted) return;
        try {
          const eventData = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(eventData));
        } catch (error) {
          // Ignore errors after abort
          if (!isAborted) {
            console.error('Error sending SSE data:', error);
          }
        }
      };

      // Send initial connection event
      sendEvent('connected', { message: 'Connected to SSE stream', timestamp: Date.now() });

      // Send random data every 2 seconds, limited to 10 messages
      intervalId = setInterval(() => {
        if (isAborted) return;
        
        if (messageCount >= 10) {
          sendEvent('completed', { message: 'All 10 messages sent', timestamp: Date.now() });
          clearInterval(intervalId);
          setTimeout(() => {
            if (!isAborted) {
              controller.close();
            }
          }, 1000);
          return;
        }

        messageCount++;
        const randomData = getRandomData();
        sendEvent('data', { 
          ...randomData, 
          messageNumber: messageCount,
          remaining: 10 - messageCount 
        });
      }, 2000);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        isAborted = true;
        clearInterval(intervalId);
        // Don't call controller.close() here as it may already be closed
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}