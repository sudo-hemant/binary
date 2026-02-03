'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { openCollectionRequest, selectActiveTab, renameCollectionItem } from '../../store/restSlice';
import type { CollectionItem } from '../../store/restSlice';
import { cn } from '@/lib/utils';
import { CollectionItemIcon } from './CollectionItemIcon';
import { CollectionItemActions } from './CollectionItemActions';
import { Input } from '@/components/ui/input';

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

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check if this request is currently active
  const isActive = item.type === 'request' && item.requestId && activeTab?.id === item.requestId;

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = () => {
    if (isEditing) return; // Don't handle click while editing

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

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(item.name);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== item.name) {
      dispatch(renameCollectionItem({
        itemId: item.id,
        newName: trimmedName,
      }));
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(item.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleInputBlur = () => {
    handleSaveEdit();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(item.name);
    setIsEditing(true);
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

      {/* Name or Edit Input */}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()}
          className="h-5 text-xs py-0 px-1 flex-1"
        />
      ) : (
        <span
          className="flex-1 truncate"
          onDoubleClick={handleDoubleClick}
        >
          {item.name}
        </span>
      )}

      {/* Action buttons - show for both folders and requests on hover */}
      {!isEditing && (
        <CollectionItemActions
          item={item}
          onStartEdit={handleStartEdit}
        />
      )}
    </div>
  );
}
