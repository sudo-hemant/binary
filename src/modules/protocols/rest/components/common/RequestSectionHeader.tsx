'use client';

import { TooltipButton } from '@/components/ui/tooltip-button';
import { Trash2, Edit3 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { selectActiveTab, toggleTabBulkEditMode } from '../../store/restSlice';

interface RequestSectionHeaderProps {
  title: string;
  section: 'params' | 'headers';
  isBulkEditMode: boolean;
  onDeleteAll: () => void;
}

export function RequestSectionHeader({ 
  title, 
  section,
  isBulkEditMode,
  onDeleteAll
}: RequestSectionHeaderProps) {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab)!; // Parent guarantees this exists
  
  const handleToggleBulkEdit = () => {
    dispatch(toggleTabBulkEditMode({ 
      tabId: activeTab.id, 
      section 
    }));
  };
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="flex items-center gap-1">
        <TooltipButton
          variant={isBulkEditMode ? "default" : "ghost"}
          size="sm"
          onClick={handleToggleBulkEdit}
          className="h-8 w-8 p-0"
          tooltip={isBulkEditMode ? 'Switch to key-value editor' : 'Switch to bulk editor'}
        >
          <Edit3 className="h-3 w-3" />
        </TooltipButton>
        
        <TooltipButton
          variant="ghost"
          size="sm"
          onClick={onDeleteAll}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          tooltip={`Delete all ${title.toLowerCase()}`}
        >
          <Trash2 className="h-3 w-3" />
        </TooltipButton>
      </div>
    </div>
  );
}