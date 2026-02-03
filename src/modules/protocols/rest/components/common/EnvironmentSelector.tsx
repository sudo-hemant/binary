'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

  return (
    <Select
      value={activeEnvironmentId || 'none'}
      onValueChange={handleChange}
    >
      <SelectTrigger className={cn("w-[160px] h-10", className)}>
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="No Environment" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">No Environment</span>
        </SelectItem>
        {environments.map((env) => (
          <SelectItem key={env.id} value={env.id}>
            <div className="flex flex-col">
              <span>{env.name}</span>
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
