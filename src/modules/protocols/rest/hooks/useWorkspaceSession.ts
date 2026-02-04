import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks/redux';
import { restoreWorkspaceSession, setTabRequestData } from '../store/restSlice';
import { loadWorkspaceSession, loadWorkspaceCollection, loadWorkspaceEnvironments } from './useAutoSave';
import { restDb } from '@/lib/db';
import type { ApiRequest } from '../store/restSlice';

export function useWorkspaceSession() {
  const dispatch = useAppDispatch();
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);
  const allTabs = useAppSelector(state => state.rest.tabs.byId);

  // Load request data for tabs that are marked as loading
  useEffect(() => {
    if (!currentWorkspace) return;

    // Find tabs that need their request data loaded
    const loadingTabs = Object.values(allTabs).filter(tab => tab && tab.isLoadingRequest);

    if (loadingTabs.length === 0) return;

    const loadTabData = async () => {
      for (const tab of loadingTabs) {
        try {
          console.log('Loading request data for tab:', tab.id);
          const requestData = await restDb.requests.get(tab.id);

          if (requestData) {
            // Found data in IndexedDB, update the tab
            dispatch(setTabRequestData({
              tabId: tab.id,
              requestData: requestData as ApiRequest
            }));
            console.log('Loaded request data for tab:', tab.id);
          } else {
            // No data in IndexedDB, mark as loaded with default data
            // The tab already has default data from createDefaultTab
            dispatch(setTabRequestData({
              tabId: tab.id,
              requestData: tab.request // Use existing default data
            }));
            console.log('No saved data found for tab, using defaults:', tab.id);
          }
        } catch (error) {
          console.error(`Failed to load request data for tab ${tab.id}:`, error);
          // On error, still mark as loaded to prevent infinite loops
          dispatch(setTabRequestData({
            tabId: tab.id,
            requestData: tab.request
          }));
        }
      }
    };

    loadTabData();
  }, [currentWorkspace, allTabs, dispatch]);

  // Load workspace session when workspace changes
  useEffect(() => {
    if (!currentWorkspace) return;

    const loadSession = async () => {
      try {
        console.log('Loading workspace data for:', currentWorkspace);

        // Load session, collection, and environments in parallel
        const [session, collectionData, environmentsData] = await Promise.all([
          loadWorkspaceSession(currentWorkspace),
          loadWorkspaceCollection(currentWorkspace),
          loadWorkspaceEnvironments(currentWorkspace)
        ]);

        console.log('Loaded data:', { session, collectionData, environmentsData });
        
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
          environments: environmentsData?.environments,
          activeEnvironmentId: environmentsData?.activeEnvironmentId,
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