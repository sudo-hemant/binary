'use client';

import { Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { WorkspaceSelector } from '../../components/WorkspaceSelector';
import { EnvironmentSelector } from '@/modules/protocols/rest/components/common/EnvironmentSelector';

export function WorkspaceHeader() {
  return (
    <div
      className="h-14 border-b border-border flex items-center px-6 w-full justify-between"
      role="banner"
    >
      {/* Left section - Logo and Workspace Selector */}
      <div className="flex items-center gap-6 flex-1">
        <h1 className="text-xl font-semibold tracking-wide text-foreground flex-shrink-0">ConsoleX</h1>
        <WorkspaceSelector />
      </div>

      {/* Center section - Search (placeholder) */}
      <div className="flex-1 flex justify-center">
        <div className="text-sm text-muted-foreground/50 px-4">
          Search coming soon...
        </div>
      </div>

      {/* Right section - Environment Selector and Settings */}
      <div className="flex items-center justify-end flex-1 gap-3">
        <EnvironmentSelector />
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          aria-label="Settings"
          title="Settings (Ctrl+,)"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}