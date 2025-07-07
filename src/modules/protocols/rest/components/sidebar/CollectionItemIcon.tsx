'use client';

import { ChevronRight, ChevronDown, Folder, FileText } from 'lucide-react';
import type { CollectionItem } from '../../store/restSlice';

interface CollectionItemIconProps {
  item: CollectionItem;
  hasChildren: boolean;
  isExpanded: boolean;
}

export function CollectionItemIcon({ item, hasChildren, isExpanded }: CollectionItemIconProps) {
  return (
    <>
      {/* Chevron for folders */}
      {item.type === 'folder' && (
        <div className="w-4 h-4 flex items-center justify-center">
          {hasChildren && (
            isExpanded ? 
              <ChevronDown className="h-3 w-3" /> : 
              <ChevronRight className="h-3 w-3" />
          )}
        </div>
      )}
      
      {/* Icon */}
      {item.type === 'folder' ? (
        <Folder className="h-3.5 w-3.5 text-muted-foreground" />
      ) : (
        <FileText className="h-3.5 w-3.5 text-muted-foreground ml-4" />
      )}
    </>
  );
}