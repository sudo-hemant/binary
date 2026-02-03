'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TabItemProps {
  id: string;
  name: string;
  method: string;
  isActive: boolean;
  onClick: (tabId: string) => void;
  onClose: (tabId: string) => void;
  onRename: (tabId: string, newName: string) => void;
}

export function TabItem({ id, name, method, isActive, onClick, onClose, onRename }: TabItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Update editName when name prop changes
  useEffect(() => {
    setEditName(name);
  }, [name]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(name);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== name) {
      onRename(id, trimmedName);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(name);
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

  const handleClick = () => {
    if (!isEditing) {
      onClick(id);
    }
  };

  return (
    <div
      className={cn(
        "relative group flex items-center px-3 py-2 min-w-[140px] max-w-[200px] cursor-pointer border-r",
        "hover:bg-accent/50 transition-colors",
        isActive && "bg-accent/70 border-b-2 border-b-primary"
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Method Badge */}
      <span
        className={cn(
          "text-xs font-medium mr-2 px-1.5 py-0.5 rounded",
          method === 'GET' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
          method === 'POST' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          method === 'PUT' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
          method === 'DELETE' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          method === 'PATCH' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
        )}
      >
        {method}
      </span>

      {/* Tab Name or Edit Input */}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          onClick={(e) => e.stopPropagation()}
          className="h-6 text-sm py-0 px-1 flex-1 min-w-0"
        />
      ) : (
        <span
          className="flex-1 text-sm truncate pr-2"
          onDoubleClick={handleDoubleClick}
          title="Double-click to rename"
        >
          {name}
        </span>
      )}

      {/* Close Button (always present, visible on hover) */}
      {!isEditing && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-5 w-5 ml-2 hover:bg-destructive/20 transition-opacity",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          onClick={handleClose}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
