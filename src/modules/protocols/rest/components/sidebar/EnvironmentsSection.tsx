'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function EnvironmentsSection() {
  // const environments = useSelector((state: RootState) => state.rest.environments);
  const environments: any[] = []; // Placeholder until environments are implemented
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">Environments</span>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {environments.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground">
          No environments yet
        </div>
      ) : (
        <div className="space-y-1">
          {environments.map((environment) => (
            <div key={environment.id} className="p-2 rounded hover:bg-accent cursor-pointer">
              <div className="text-xs font-medium">{environment.name}</div>
              <div className="text-xs text-muted-foreground">
                {Object.keys(environment.variables).length} variable{Object.keys(environment.variables).length !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}