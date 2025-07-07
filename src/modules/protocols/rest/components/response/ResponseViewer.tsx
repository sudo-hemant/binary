'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { type ErrorResponse } from '../../types/error';

export interface ApiResponse {
  status: number;
  statusText: string;
  duration: number;
  data: any;
  headers: Record<string, string>;
}

interface ResponseViewerProps {
  response: ApiResponse | null;
  error?: ErrorResponse | null;
  loading?: boolean;
}

export function ResponseViewer({ response, error, loading }: ResponseViewerProps) {
  // Determine the status icon and color based on response or error
  const getStatusIcon = () => {
    if (error) {
      switch (error.type) {
        case 'validation':
          return <AlertCircle className="w-4 h-4 text-yellow-600" />;
        case 'network':
        case 'timeout':
        case 'cors':
          return <XCircle className="w-4 h-4 text-red-600" />;
        case 'http_client':
          return <AlertTriangle className="w-4 h-4 text-orange-600" />;
        case 'http_server':
          return <XCircle className="w-4 h-4 text-red-600" />;
        default:
          return <AlertTriangle className="w-4 h-4 text-red-600" />;
      }
    }
    if (response) {
      if (response.status < 300) return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      if (response.status < 400) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      return <XCircle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const hasContent = response || error;

  // Show loading state
  if (loading) {
    return (
      <Card className="h-full rounded-none border-0 shadow-none">
        <CardContent className="h-full p-0">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-sm text-muted-foreground">Sending request...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait while we process your request</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
      <Card className="h-full rounded-none border-0 shadow-none">
        {hasContent && (
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4 text-sm">
              {error ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-muted-foreground">Error:</span>
                    <span className={`font-medium ${
                      error.type === 'validation' ? 'text-yellow-600' :
                      error.type === 'http_client' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {error.type === 'http_client' ? 'Client Error' :
                        error.type === 'http_server' ? 'Server Error' :
                        error.type.charAt(0).toUpperCase() + error.type.slice(1).replace('_', ' ') + ' Error'}
                    </span>
                  </div>
                  {error.status !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">{error.status}</span>
                      {error.statusText && <span className="text-muted-foreground">({error.statusText})</span>}
                    </div>
                  )}
                </div>
              ) : response && (
                <>
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`font-medium ${response.status < 300 ? 'text-green-600' : response.status < 400 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {response.status} {response.statusText}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium">{response.duration}ms</span>
                  </div>
                </>
              )}
            </div>
          </CardHeader>
        )}

        <CardContent className={`${hasContent ? 'h-[calc(100%-4rem)]' : 'h-full'} p-0`}>
          {error ? (
            <div className="h-full p-4 overflow-auto">
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2 break-words">
                      {error.message}
                    </h3>
                    
                    {error.validationErrors && error.validationErrors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                          Validation errors:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {error.validationErrors.map((err, idx) => (
                            <li key={idx} className="text-sm text-red-700 dark:text-red-400">
                              {err}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {error.details?.suggestion && (
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded">
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                          💡 Suggestion:
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">
                          {error.details.suggestion}
                        </p>
                      </div>
                    )}
                    
                    {error.details && typeof error.details === 'string' && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                          Details:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-400 break-words">
                          {error.details}
                        </p>
                      </div>
                    )}
                    
                    {error.details && typeof error.details === 'object' && !error.details.suggestion && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                          Details:
                        </p>
                        <pre className="text-xs bg-red-100 dark:bg-red-950/50 p-2 rounded overflow-auto max-w-full">
                          <code className="break-words">{JSON.stringify(error.details, null, 2)}</code>
                        </pre>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-red-600 dark:text-red-500">
                      {new Date(error.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : response ? (
            <Tabs defaultValue="response-body" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-4 rounded-lg">
                <TabsTrigger value="response-body">Body</TabsTrigger>
                <TabsTrigger value="response-headers">Headers</TabsTrigger>
                <TabsTrigger value="response-raw">Raw</TabsTrigger>
              </TabsList>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="response-body" className="h-full m-0 p-4">
                  <pre className="bg-background border rounded-md p-4 overflow-auto h-full text-sm font-mono">
                    {(() => {
                      try {
                        const content = typeof response.data === 'string' 
                          ? response.data 
                          : JSON.stringify(response.data, null, 2);
                        
                        // Limit display to 100KB to prevent browser freeze
                        if (content.length > 100000) {
                          return content.substring(0, 100000) + '\n\n... (Response truncated - too large to display)';
                        }
                        return content;
                      } catch {
                        return '[Error displaying response: Response contains circular references or invalid data]';
                      }
                    })()}
                  </pre>
                </TabsContent>
                
                <TabsContent value="response-headers" className="h-full m-0 p-4">
                  <pre className="bg-background border rounded-md p-4 overflow-auto h-full text-sm font-mono">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </TabsContent>
                
                <TabsContent value="response-raw" className="h-full m-0 p-4">
                  <pre className="bg-background border rounded-md p-4 overflow-auto h-full text-sm font-mono">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </TabsContent>
              </div>
            </Tabs>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No response yet</p>
                <p className="text-xs mt-1">Send a request to see the response here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );
}