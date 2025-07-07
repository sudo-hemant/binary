'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TabItemProps {
  id: string;
  name: string;
  method: string;
  isActive: boolean;
  onClick: (tabId: string) => void;
  onClose: (tabId: string) => void;
}

export function TabItem({ id, name, method, isActive, onClick, onClose }: TabItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  return (
    <div
      className={cn(
        "relative group flex items-center px-3 py-2 min-w-[140px] max-w-[200px] cursor-pointer border-r",
        "hover:bg-accent/50 transition-colors",
        isActive && "bg-accent/70 border-b-2 border-b-primary"
      )}
      onClick={() => onClick(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Method Badge */}
      <span 
        className={cn(
          "text-xs font-medium mr-2 px-1.5 py-0.5 rounded",
          method === 'GET' && "bg-green-100 text-green-700",
          method === 'POST' && "bg-blue-100 text-blue-700",
          method === 'PUT' && "bg-orange-100 text-orange-700",
          method === 'DELETE' && "bg-red-100 text-red-700",
          method === 'PATCH' && "bg-purple-100 text-purple-700"
        )}
      >
        {method}
      </span>

      {/* Tab Name */}
      <span className="flex-1 text-sm truncate pr-2">
        {name}
      </span>

      {/* Close Button (always present, visible on hover) */}
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
    </div>
  );
}