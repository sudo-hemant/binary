'use client';

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { SSEMethod, SSEEvent } from '../types/sse.types';
import { SSEService } from '../services/sseService';

type RealtimeProtocol = 'sse' | 'websocket';

export function RealtimeMain() {
  const [activeProtocol, setActiveProtocol] = useState<RealtimeProtocol>('sse');
  const [method, setMethod] = useState<SSEMethod>('GET');
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(`${window.location.origin}/api/proxy/sse`);
  }, []);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const sseServiceRef = useRef<SSEService | null>(null);

  const handleConnect = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setError(null);
    setLoading(true);
    setEvents([]);

    if (!sseServiceRef.current) {
      sseServiceRef.current = new SSEService();
    }

    try {
      await sseServiceRef.current.connect(
        { url, method },
        (event) => {
          setEvents(prev => [...prev, event]);
          setIsConnected(true);
          setLoading(false);
          
          // Auto-disconnect on completed event
          if (event.event === 'completed') {
            setTimeout(() => {
              handleDisconnect();
            }, 1000); // Small delay to show the completed message
          }
        },
        (error) => {
          setError(error);
          setIsConnected(false);
          setLoading(false);
        }
      );
    } catch {
      setError('Failed to connect');
      setIsConnected(false);
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    if (sseServiceRef.current) {
      sseServiceRef.current.disconnect();
    }
    setIsConnected(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Subheader with tabs */}
      <div className="border-b px-4 py-2">
        <Tabs value={activeProtocol} onValueChange={(value) => setActiveProtocol(value as RealtimeProtocol)}>
          <TabsList>
            <TabsTrigger value="sse">Server-Sent Events</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2-pane view below subheader */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane - Configuration */}
        <div className="w-1/2 border-r p-4 space-y-4">
          <h3 className="text-lg font-semibold">SSE Configuration</h3>
          
          <div className="space-y-4">
            {/* Method and URL */}
            <div className="flex gap-2">
              <Select value={method} onValueChange={(value) => setMethod(value as SSEMethod)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  {/* <SelectItem value="POST">POST</SelectItem> */}
                </SelectContent>
              </Select>
              
              <Input
                type="url"
                placeholder="Enter SSE endpoint URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                disabled={isConnected}
              />
            </div>

            {/* Connect/Disconnect Button */}
            <Button
              onClick={isConnected ? handleDisconnect : handleConnect}
              disabled={loading}
              variant={isConnected ? "destructive" : "default"}
              className="w-full"
            >
              {loading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
            </Button>

            {/* Error display */}
            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}
          </div>
        </div>

        {/* Right pane - Events */}
        <div className="w-1/2 p-4 space-y-4">
          <h3 className="text-lg font-semibold">SSE Events ({events.length})</h3>
          
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(100vh-200px)]">
            {events.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                {isConnected ? 'Waiting for events...' : 'Connect to start receiving events'}
              </div>
            ) : (
              // Display events in reverse order (newest first)
              events.slice().reverse().map((event) => (
                <Card key={event.id} className="p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Event: {event.event}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}