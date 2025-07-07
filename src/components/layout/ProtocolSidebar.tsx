'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Globe, Code, Radio } from 'lucide-react';

type Protocol = 'rest' | 'graphql' | 'realtime';

interface ProtocolSidebarProps {
  activeProtocol: Protocol;
  onProtocolChange: (protocol: Protocol) => void;
}

const protocols = [
  { id: 'rest' as const, name: 'REST', icon: Globe },
  { id: 'graphql' as const, name: 'GraphQL', icon: Code },
  { id: 'realtime' as const, name: 'Realtime', icon: Radio },
];

export function ProtocolSidebar({ activeProtocol, onProtocolChange }: ProtocolSidebarProps) {
  return (
    <div className="w-20 bg-muted/50 border-r border-border flex flex-col items-center py-6 space-y-4">
      {protocols.map((protocol) => {
        const Icon = protocol.icon;
        return (
          <Button
            key={protocol.id}
            variant="ghost"
            size="icon"
            className={cn(
              "h-16 w-16 flex flex-col items-center justify-center gap-1 p-2",
              activeProtocol === protocol.id 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "hover:bg-accent"
            )}
            onClick={() => onProtocolChange(protocol.id)}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs font-medium">{protocol.name}</span>
          </Button>
        );
      })}
    </div>
  );
}