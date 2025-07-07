'use client';

import { Button } from '@/components/ui/button';
import { FolderPlus, Plus } from 'lucide-react';

interface CollectionItemActionsProps {
  itemName: string;
}

export function CollectionItemActions({ itemName }: CollectionItemActionsProps) {
  const handleAddFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Add folder to:', itemName);
    // TODO: Implement add folder functionality
  };

  const handleAddRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Add request to:', itemName);
    // TODO: Implement add request functionality
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-accent"
        onClick={handleAddFolder}
        title="Add Folder"
      >
        <FolderPlus className="h-2.5 w-2.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 hover:bg-accent"
        onClick={handleAddRequest}
        title="Add Request"
      >
        <Plus className="h-2.5 w-2.5" />
      </Button>
    </div>
  );
}