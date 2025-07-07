'use client';

import { RestSidebar } from '@/modules/protocols/rest/components/RestSidebar';

// TODO: import from a single location
type Protocol = 'rest' | 'graphql' | 'realtime';
type RestSection = 'collections' | 'environments' | 'history';

interface ProtocolLeftPanelProps {
  activeProtocol: Protocol;
  activeRestSection: RestSection;
  onRestSectionChange: (section: RestSection) => void;
}

export function ProtocolLeftPanel({ 
  activeProtocol, 
  activeRestSection, 
  onRestSectionChange 
}: ProtocolLeftPanelProps) {
  return (
    <div 
      className="w-64 border-r border-border"
      role="complementary"
      aria-label="Protocol sections"
    >
      {activeProtocol === 'rest' && (
        <RestSidebar 
          activeSection={activeRestSection}
          onSectionChange={onRestSectionChange}
        />
      )}
      {activeProtocol === 'graphql' && (
        <div 
          className="p-4 text-center text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          GraphQL coming soon...
        </div>
      )}
      {activeProtocol === 'realtime' && (
        <div 
          className="p-4 text-center text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          Realtime coming soon...
        </div>
      )}
    </div>
  );
}