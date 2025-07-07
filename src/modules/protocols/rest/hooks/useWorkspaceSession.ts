import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { restoreWorkspaceSession } from '../store/restSlice';
import { loadWorkspaceSession, loadWorkspaceCollection } from './useAutoSave';
import { restDb } from '@/lib/db';

export function useWorkspaceSession() {
  const dispatch = useAppDispatch();
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);

  // Load workspace session when workspace changes
  useEffect(() => {
    if (!currentWorkspace) return;

    const loadSession = async () => {
      try {
        console.log('Loading workspace data for:', currentWorkspace);
        
        // Load both session and collection in parallel
        const [session, collectionData] = await Promise.all([
          loadWorkspaceSession(currentWorkspace),
          loadWorkspaceCollection(currentWorkspace)
        ]);
        
        console.log('Loaded data:', { session, collectionData });
        
        // Step 2: Load all tab request data from IndexedDB
        const visibleTabIds = session?.visibleTabIds || [];
        let tabsData: Record<string, any> = {};
        
        if (visibleTabIds.length > 0) {
          console.log('Loading request data for all visible tabs:', visibleTabIds);
          
          const tabPromises = visibleTabIds.map(async (tabId) => {
            try {
              const requestData = await restDb.requests.get(tabId);
              return { tabId, requestData };
            } catch (error) {
              console.error(`Failed to load request data for tab ${tabId}:`, error);
              return { tabId, requestData: null };
            }
          });
          
          const tabResults = await Promise.all(tabPromises);
          tabsData = tabResults.reduce((acc, { tabId, requestData }) => {
            if (requestData) {
              acc[tabId] = requestData;
            }
            return acc;
          }, {} as Record<string, any>);
          
          console.log(`Loaded request data for ${Object.keys(tabsData).length} tabs`);
        }
        
        // Step 3: Restore everything to Redux (sync - with all tab data)
        dispatch(restoreWorkspaceSession({
          activeTabId: session?.activeTabId || null,
          visibleTabIds: visibleTabIds,
          collection: collectionData?.collection,
          tabsData: tabsData,
          workspaceId: currentWorkspace
        }));
        
        if (!session && !collectionData) {
          console.log('No existing data found for workspace:', currentWorkspace);
        }
      } catch (error) {
        console.error('Failed to load workspace data:', error);
      }
    };

    loadSession();
  }, [currentWorkspace, dispatch]);
}