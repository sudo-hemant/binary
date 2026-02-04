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
    <div className="w-[72px] bg-muted/30 border-r border-border flex flex-col items-center py-4 space-y-2">
      {protocols.map((protocol) => {
        const Icon = protocol.icon;
        return (
          <Button
            key={protocol.id}
            variant="ghost"
            size="icon"
            className={cn(
              "h-14 w-14 flex flex-col items-center justify-center gap-1 p-2 rounded-lg",
              activeProtocol === protocol.id
                ? "bg-primary text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => onProtocolChange(protocol.id)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{protocol.name}</span>
          </Button>
        );
      })}
    </div>
  );
}