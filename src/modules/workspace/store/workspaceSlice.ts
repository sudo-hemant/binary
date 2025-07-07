'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Protocol = 'rest' | 'graphql' | 'realtime';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number; // epoch timestamp
  updatedAt: number; // epoch timestamp
}

interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspace: string | null;
  activeProtocol: Protocol;
  loading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspace: 'default',
  activeProtocol: 'rest',
  loading: false,
  error: null
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setCurrentWorkspace: (state, action: PayloadAction<string>) => {
      state.currentWorkspace = action.payload;
    },
    addWorkspace: (state, action: PayloadAction<Pick<Workspace, 'name'> & Partial<Workspace>>) => {
      const now = Date.now();
      const newWorkspace: Workspace = {
        id: `workspace-${now}`,
        createdAt: now,
        updatedAt: now,
        ...action.payload,
      };
      state.workspaces.push(newWorkspace);
    },
    updateWorkspace: (state, action: PayloadAction<{ id: string; updates: Partial<Workspace> }>) => {
      const index = state.workspaces.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = {
          ...state.workspaces[index],
          ...action.payload.updates,
          updatedAt: Date.now()
        };
      }
    },
    deleteWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
      if (state.currentWorkspace === action.payload) {
        state.currentWorkspace = state.workspaces[0]?.id || null;
      }
    },
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setActiveProtocol: (state, action: PayloadAction<Protocol>) => {
      state.activeProtocol = action.payload;
    }
  }
});

export const {
  setCurrentWorkspace,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  setWorkspaces,
  setLoading,
  setError,
  setActiveProtocol
} = workspaceSlice.actions;

export default workspaceSlice.reducer;