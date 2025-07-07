'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestParamsTab } from './tabs/RequestParamsTab';
import { RequestHeadersTab } from './tabs/RequestHeadersTab';
import { RequestBodyTab } from './tabs/RequestBodyTab';
import { RequestAuthTab } from './tabs/RequestAuthTab';
import type { RestTab } from '../../store/restSlice';

interface RequestTabsProps {
  activeTab: RestTab;
}

export function RequestTabs({ activeTab }: RequestTabsProps) {
  const { request, ui } = activeTab;

  return (
    <div className="w-full">
      <Tabs defaultValue="params" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full mb-4" aria-label="Request configuration tabs">
          <TabsTrigger value="params" className="flex-1" aria-label="Query parameters">Params</TabsTrigger>
          <TabsTrigger value="headers" className="flex-1" aria-label="Request headers">Headers</TabsTrigger>
          <TabsTrigger value="body" className="flex-1" aria-label="Request body">Body</TabsTrigger>
          <TabsTrigger value="auth" className="flex-1" aria-label="Authentication">Auth</TabsTrigger>
        </TabsList>
      
        <TabsContent value="params" className="space-y-4">
          <RequestParamsTab
            tabId={activeTab.id}
            params={request.params}
            isBulkEditMode={ui.bulkEditMode.params}
          />
        </TabsContent>
        
        <TabsContent value="headers" className="space-y-4">
          <RequestHeadersTab
            tabId={activeTab.id}
            headers={request.headers}
            isBulkEditMode={ui.bulkEditMode.headers}
          />
        </TabsContent>
        
        <TabsContent value="body" className="space-y-4">
          <RequestBodyTab
            tabId={activeTab.id}
            body={request.body}
          />
        </TabsContent>
        
        <TabsContent value="auth" className="space-y-4">
          <RequestAuthTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}