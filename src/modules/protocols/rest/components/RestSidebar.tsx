'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Folder, Settings, History, Import } from 'lucide-react';
import { ImportCurlDialog } from './common/ImportCurlDialog';
import { CollectionsSection } from './sidebar/CollectionsSection';
import { EnvironmentsSection } from './sidebar/EnvironmentsSection';
import { HistorySection } from './sidebar/HistorySection';
import { useAppDispatch, useAppSelector } from '@/store/hooks/redux';
import { createTabFromImport } from '../store/restSlice';
import type { ParsedCurlRequest } from '../utils/curlParser';


// TODO: import from a single location
type RestSection = 'collections' | 'environments' | 'history';

interface RestSidebarProps {
  activeSection?: RestSection;
  onSectionChange?: (section: RestSection) => void;
}

// TODO: import from a single location
const sections = [
  { id: 'collections' as const, name: 'Collections', icon: Folder },
  { id: 'environments' as const, name: 'Environments', icon: Settings },
  { id: 'history' as const, name: 'History', icon: History },
];

export function RestSidebar({ 
  activeSection = 'collections', 
  onSectionChange 
}: RestSidebarProps) {
  const dispatch = useAppDispatch();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);

  const handleImportCurl = (parsed: ParsedCurlRequest) => {
    if (!currentWorkspace) return;
    
    // Generate a name based on the URL
    const urlObj = new URL(parsed.url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    const path = urlObj.pathname === '/' ? '' : urlObj.pathname;
    const tabName = `${parsed.method} ${domain}${path}`;

    // Create new tab with the imported data
    dispatch(createTabFromImport({
      name: tabName,
      url: parsed.url,
      method: parsed.method,
      headers: parsed.headers,
      body: parsed.body,
      params: parsed.params,
      workspaceId: currentWorkspace
    }));

    // Close the import dialog
    setShowImportDialog(false);
  };

  return (
    <div className="w-full h-full bg-background border-r border-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border min-h-[48px] flex items-center">
        <div className="flex items-center justify-between w-full">
          <h2 className="text-sm font-semibold text-muted-foreground">REST API</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1.5"
            onClick={() => setShowImportDialog(true)}
          >
            <Import className="h-3.5 w-3.5" />
            Import
          </Button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="p-2 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          
          return (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2 h-8 px-2 text-xs",
                isActive 
                  ? "bg-accent text-accent-foreground" 
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSectionChange?.(section.id)}
            >
              <Icon className="h-4 w-4" />
              {section.name}
            </Button>
          );
        })}
      </div>
      
      {/* Content Area */}
      <div className="flex-1 p-3">
        {activeSection === 'collections' && <CollectionsSection />}
        
        {activeSection === 'environments' && <EnvironmentsSection />}
        
        {activeSection === 'history' && <HistorySection />}
      </div>

      <ImportCurlDialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        onImportCurl={handleImportCurl}
      />
    </div>
  );
}

