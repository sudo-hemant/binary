'use client';

import { cn } from '@/lib/utils';
import { WrapperProps } from './WrapperTypes';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SidebarWrapper({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}: WrapperProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full bg-background border-r border-border z-50",
          "transform transition-transform duration-300 ease-in-out",
          "w-full sm:w-[90%] md:w-[80%] lg:w-[75%] xl:w-[70%]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title || 'API Testing'}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-65px)]">
          {children}
        </div>
      </div>
    </>
  );
}