'use client';

import { useSelector, useDispatch } from 'react-redux';
import { ProtocolSidebar } from '@/components/layout/ProtocolSidebar';
import { useWorkspaceInit } from '../hooks/useWorkspaceInit';
import { RootState, AppDispatch } from '@/store/store';
import { setActiveProtocol, type Protocol } from '../store/workspaceSlice';
import {
  WorkspaceHeader,
  ProtocolPanel
} from './components';

export function WorkspaceLayout() {
  useWorkspaceInit(); // Initialize workspaces on mount

  const dispatch = useDispatch<AppDispatch>();
  const { activeProtocol } = useSelector((state: RootState) => state.workspace);

  const handleProtocolChange = (protocol: Protocol) => {
    dispatch(setActiveProtocol(protocol));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkspaceHeader />
      
      <div className="flex-1 flex overflow-hidden">
        <ProtocolSidebar 
          activeProtocol={activeProtocol}
          onProtocolChange={handleProtocolChange}
        />

        <ProtocolPanel
          activeProtocol={activeProtocol}
        />
      </div>
    </div>
  );
}