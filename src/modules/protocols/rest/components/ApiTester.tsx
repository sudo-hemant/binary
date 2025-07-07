'use client';

import { useEffect, useCallback } from 'react';

import { RequestBar } from './request/RequestBar';
import { RequestTabs } from './request/RequestTabs';
import { ResponseViewer } from './response/ResponseViewer';
import { TabBar } from './tabs/TabBar';
import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { useAutoSave } from '../hooks/useAutoSave';
import { useWorkspaceSession } from '../hooks/useWorkspaceSession';
import { 
  updateTabUrl,
  updateTabMethod,
  selectActiveTab,
  addTabResponse,
  setTabLoading,
  setTabError,
} from '../store/restSlice';
import { executeHttpRequest } from '../services/requestService';
import { shouldPrependProtocol } from '../utils/urlHelper';

export function ApiTester() {
  const dispatch = useAppDispatch();
  const activeTab = useAppSelector(selectActiveTab);
  
  // Enable auto-save to indexDB for redux changes
  useAutoSave();
  // Load workspace session when workspace changes
  useWorkspaceSession();

  const handleSendRequest = useCallback(async () => {
    // Don't send if already loading
    if (!activeTab || activeTab.ui.loading) return;

    // Check if we need to update the URL with protocol
    const urlCheck = shouldPrependProtocol(activeTab.request.url);
    const finalUrl = urlCheck.normalizedUrl;
    
    if (urlCheck.needed) {
      // Update the URL in the state so user can see what was used
      dispatch(updateTabUrl({ tabId: activeTab.id, url: finalUrl }));
    }

    // Clear any previous errors and start loading
    dispatch(setTabError({ tabId: activeTab.id, error: null }));
    dispatch(setTabLoading({ tabId: activeTab.id, loading: true }));
    
    const result = await executeHttpRequest(
      finalUrl,  // Use the normalized URL directly
      activeTab.request.method,
      activeTab.request.params,
      activeTab.request.headers,
      activeTab.request.body
    );
    
    if (result.success) {
      dispatch(addTabResponse({ tabId: activeTab.id, response: result.response }));
    } else {
      dispatch(setTabError({ tabId: activeTab.id, error: result.error }));
    }
  }, [activeTab, dispatch]);

  // Keyboard shortcut for sending request
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+Enter on Mac, Ctrl+Enter on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSendRequest();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSendRequest]);

  if (!activeTab) {
    return (
      <div className="flex flex-col h-full">
        {/* Tab Bar */}
        <TabBar />
        
        {/* Empty State Message */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">No tabs open</p>
            <p className="text-sm">Click the + button to create a new request</p>
          </div>
        </div>
      </div>
    );
  }

  const { request, ui, responses } = activeTab;
  // Get the latest response (last item in array)
  const latestResponse = responses.length > 0 ? responses[responses.length - 1] : null;

  return (
    <div className="flex flex-col h-full">
      {/* Tab Bar */}
      <TabBar />
      
      {/* Request Section */}
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        <RequestBar
          method={request.method}
          url={request.url}
          loading={ui.loading}
          headers={request.headers}
          body={request.body}
          params={request.params}
          onMethodChange={(method) => dispatch(updateTabMethod({ tabId: activeTab.id, method }))}
          onUrlChange={(url) => dispatch(updateTabUrl({ tabId: activeTab.id, url }))}
          onSend={handleSendRequest}
        />

        <RequestTabs activeTab={activeTab} />
      </div>

      {/* Response Section */}
      <div className="h-[55%] border-t bg-muted/10">
        <ResponseViewer 
          response={latestResponse} 
          error={ui.error} 
          loading={ui.loading}
        />
      </div>
    </div>
  );
}