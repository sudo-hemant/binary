'use client';

import { useState } from 'react';
import { RestSidebar } from '@/modules/protocols/rest/components/RestSidebar';
import { ApiTester } from '@/modules/protocols/rest/components/ApiTester';
import { RealtimeMain } from '@/modules/protocols/realtime/components/RealtimeMain';

type Protocol = 'rest' | 'graphql' | 'realtime';
type RestSection = 'collections' | 'environments' | 'history';

interface ProtocolPanelProps {
  activeProtocol: Protocol;
}

function RestPanel() {
  const [activeSection, setActiveSection] = useState<RestSection>('collections');

  return (
    <>
      {/* Left Panel - REST Sidebar */}
      <div className="w-80 border-r bg-muted/10">
        <RestSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      </div>

      {/* Right Panel - REST Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ApiTester />
      </div>
    </>
  );
}

function GraphQLPanel() {
  return (
    <>
      {/* Left Panel - GraphQL Sidebar */}
      <div className="w-80 border-r bg-muted/10">
        <div className="p-4 text-muted-foreground">
          GraphQL sidebar coming soon...
        </div>
      </div>

      {/* Right Panel - GraphQL Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          GraphQL interface coming soon...
        </div>
      </div>
    </>
  );
}

function RealtimePanel() {
  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <RealtimeMain />
      </div>
    </>
  );
}

export function ProtocolPanel({ activeProtocol }: ProtocolPanelProps) {
  return (
    <div className="flex-1 flex overflow-hidden">
      {activeProtocol === 'rest' && <RestPanel />}
      {activeProtocol === 'graphql' && <GraphQLPanel />}
      {activeProtocol === 'realtime' && <RealtimePanel />}
    </div>
  );
}