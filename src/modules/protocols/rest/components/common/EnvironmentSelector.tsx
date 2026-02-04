'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux';
import {
  selectEnvironments,
  selectActiveEnvironmentId,
  setActiveEnvironment,
} from '../../store/restSlice';
import { cn } from '@/lib/utils';

interface EnvironmentSelectorProps {
  className?: string;
}

export function EnvironmentSelector({ className }: EnvironmentSelectorProps) {
  const dispatch = useAppDispatch();
  const environments = useAppSelector(selectEnvironments);
  const activeEnvironmentId = useAppSelector(selectActiveEnvironmentId);

  const handleChange = (value: string) => {
    dispatch(setActiveEnvironment({ id: value === 'none' ? null : value }));
  };

  // Get the display name for the selected environment
  const selectedEnvName = activeEnvironmentId
    ? environments.find(e => e.id === activeEnvironmentId)?.name || 'No Environment'
    : 'No Environment';

  return (
    <Select
      value={activeEnvironmentId || 'none'}
      onValueChange={handleChange}
    >
      <SelectTrigger className={cn("w-[160px] h-10", className)}>
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{selectedEnvName}</span>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">No Environment</span>
        </SelectItem>
        {environments.map((env) => (
          <SelectItem key={env.id} value={env.id}>
            <div className="flex flex-col max-w-[200px]">
              <span className="truncate">{env.name}</span>
              <span className="text-xs text-muted-foreground">
                {env.variables.length} variable{env.variables.length !== 1 ? 's' : ''}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
