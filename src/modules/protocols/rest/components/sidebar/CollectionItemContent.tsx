'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { openCollectionRequest, selectActiveTab } from '../../store/restSlice';
import type { CollectionItem } from '../../store/restSlice';
import { cn } from '@/lib/utils';
import { CollectionItemIcon } from './CollectionItemIcon';
import { CollectionItemActions } from './CollectionItemActions';

interface CollectionItemContentProps {
  item: CollectionItem;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export function CollectionItemContent({ 
  item, 
  level, 
  hasChildren, 
  isExpanded, 
  onToggleExpanded 
}: CollectionItemContentProps) {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);
  
  // Check if this request is currently active
  const isActive = item.type === 'request' && item.requestId && activeTab?.id === item.requestId;
  
  const handleClick = () => {
    if (item.type === 'folder') {
      onToggleExpanded();
    } else if (item.type === 'request' && item.requestId && currentWorkspace) {
      // Open the request in a tab
      dispatch(openCollectionRequest({ 
        requestId: item.requestId, 
        name: item.name,
        workspaceId: currentWorkspace
      }));
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-1 hover:bg-accent/50 cursor-pointer rounded-sm group",
        "text-xs min-h-[24px]",
        isActive && "bg-primary/10 text-primary border-r-2 border-r-primary"
      )}
      style={{ paddingLeft: `${level * 12 + 8}px` }}
      onClick={handleClick}
    >
      <CollectionItemIcon 
        item={item} 
        hasChildren={hasChildren} 
        isExpanded={isExpanded} 
      />
      
      {/* Name */}
      <span className="flex-1 truncate">{item.name}</span>

      {/* Action buttons - only show for folders on hover */}
      {item.type === 'folder' && (
        <CollectionItemActions itemName={item.name} />
      )}
    </div>
  );
}