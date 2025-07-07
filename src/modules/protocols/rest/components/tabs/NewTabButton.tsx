'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppSelector } from '@/store/hooks/redux';
import { selectMaxVisibleTabs } from '../../store/restSlice';

interface NewTabButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export function NewTabButton({ onClick, disabled }: NewTabButtonProps) {
  const maxTabs = useAppSelector(selectMaxVisibleTabs);

  if (disabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled
            >
              <Plus className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Maximum {maxTabs} tabs reached</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-accent"
            onClick={onClick}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>New tab</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}