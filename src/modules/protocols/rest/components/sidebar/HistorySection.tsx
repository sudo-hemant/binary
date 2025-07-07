'use client';

import { cn } from '@/lib/utils';

export function HistorySection() {
  // const history = useSelector((state: RootState) => state.rest.history);
  const history: any[] = []; // Placeholder until history is implemented
  
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">Recent Requests</span>
      {history.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          No history yet
        </div>
      ) : (
        <div className="space-y-1">
          {history.slice(0, 10).map((request) => (
            <div key={request.id} className="p-2 rounded hover:bg-accent cursor-pointer">
              <div className="text-xs font-medium truncate">{request.name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <span className={cn(
                  "px-1 py-0.5 rounded text-xs font-mono",
                  request.method === 'GET' && "bg-green-100 text-green-800",
                  request.method === 'POST' && "bg-blue-100 text-blue-800",
                  request.method === 'PUT' && "bg-orange-100 text-orange-800",
                  request.method === 'DELETE' && "bg-red-100 text-red-800"
                )}>
                  {request.method}
                </span>
                <span className="truncate">{request.url || 'No URL'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}