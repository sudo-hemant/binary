'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { setWorkspaces, setCurrentWorkspace } from '../store/workspaceSlice';
import { workspaceDb } from '@/lib/db';

export function useWorkspaceInit() {
  const dispatch = useDispatch<AppDispatch>();
  const { workspaces, currentWorkspace } = useSelector((state: RootState) => state.workspace);

  useEffect(() => {
    const initializeWorkspaces = async () => {
      try {
        // Load existing workspaces from database
        const existingWorkspaces = await workspaceDb.workspaces.toArray();
        
        if (existingWorkspaces.length === 0) {
          // Create default workspace if none exist
          const now = Date.now();
          const defaultWorkspace = {
            id: 'default',
            name: 'My Workspace',
            description: 'Default workspace',
            createdAt: now,
            updatedAt: now
          };
          
          await workspaceDb.workspaces.add(defaultWorkspace);
          dispatch(setWorkspaces([defaultWorkspace]));
          dispatch(setCurrentWorkspace('default'));
        } else {
          // Load existing workspaces
          dispatch(setWorkspaces(existingWorkspaces));
          
          // Set current workspace if not already set
          if (!currentWorkspace || !existingWorkspaces.find(w => w.id === currentWorkspace)) {
            dispatch(setCurrentWorkspace(existingWorkspaces[0].id));
          }
        }
      } catch (error) {
        console.error('Failed to initialize workspaces:', error);
      }
    };

    // Only initialize if workspaces haven't been loaded yet
    if (workspaces.length === 0) {
      initializeWorkspaces();
    }
  }, [dispatch, workspaces.length, currentWorkspace]);
}