'use client';

import { Button } from '@/components/ui/button';
import { Plus, Import } from 'lucide-react';

export function CollectionHeader() {
  return (
    <div className="flex items-center justify-between mb-2">
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <Plus className="h-3 w-3" />
      </Button>

      <span className="text-xs font-medium text-muted-foreground flex-1 text-center">Collections</span>

      <Button variant="ghost" size="icon" className="h-6 w-6">
        <Import className="h-3 w-3" />
      </Button>
    </div>
  );
}