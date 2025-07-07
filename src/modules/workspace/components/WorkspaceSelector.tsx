'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Plus } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RootState, AppDispatch } from '@/store/store';
import { workspaceDb } from '@/lib/db';

import { setCurrentWorkspace, addWorkspace } from '../store/workspaceSlice';
import { CreateWorkspaceDialog } from './CreateWorkspaceDialog';

export function WorkspaceSelector() {
  const dispatch = useDispatch<AppDispatch>();
  const { workspaces, currentWorkspace } = useSelector((state: RootState) => state.workspace);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  const currentWorkspaceName = workspaces.find(w => w.id === currentWorkspace)?.name || 'Select Workspace';

  const handleWorkspaceChange = (workspaceId: string) => {
    dispatch(setCurrentWorkspace(workspaceId));
  };

  const handleCreateWorkspace = async (workspaceData: { name: string; description?: string }) => {
    const now = Date.now();
    const newWorkspace = {
      ...workspaceData,
      id: `workspace-${now}`,
      createdAt: now,
      updatedAt: now
    };
    
    try {
      await workspaceDb.workspaces.add(newWorkspace);
      dispatch(addWorkspace(newWorkspace)); // Pass full workspace object, not just data
      dispatch(setCurrentWorkspace(newWorkspace.id));
      setIsCreateDialogOpen(false); // Close dialog
      setIsSelectOpen(false); // Close dropdown after creating workspace
    } catch (error) {
      console.error('Failed to create workspace:', error);
      throw error; // Re-throw to let dialog handle the error
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Select 
          value={currentWorkspace || ''} 
          onValueChange={handleWorkspaceChange}
          open={isSelectOpen}
          onOpenChange={setIsSelectOpen}
        >
          <SelectTrigger className="w-[200px] border border-border bg-muted/30 hover:bg-muted/50 px-3 gap-2">
            <SelectValue>{currentWorkspaceName}</SelectValue>
          </SelectTrigger>

          <SelectContent className="min-w-[200px]">
            {workspaces.map((workspace) => (
              <SelectItem 
                key={workspace.id} 
                value={workspace.id}
              >
                <div className="flex items-center w-full">
                  <span className="flex-1">{workspace.name}</span>
                </div>
              </SelectItem>
            ))}

            <div className="border-t border-border mt-1 pt-1">
              <div
                role="button"
                tabIndex={0}
                className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm"
                onClick={() => setIsCreateDialogOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsCreateDialogOpen(true);
                  }
                }}
                aria-label="Create new workspace"
              >
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>Create Workspace</span>
              </div>
            </div>
          </SelectContent>
        </Select>
      </div>
      
      <CreateWorkspaceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateWorkspace={handleCreateWorkspace}
      />
    </>
  );
}