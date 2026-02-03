import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks/redux';
import { restDb, type WorkspaceSession, type WorkspaceCollection, type WorkspaceEnvironments } from '@/lib/db';

// Helper function to load workspace session
export async function loadWorkspaceSession(workspaceId: string): Promise<WorkspaceSession | null> {
  try {
    const session = await restDb.workspaceSessions.get(workspaceId);
    return session || null;
  } catch (error) {
    console.error('Failed to load workspace session:', error);
    return null;
  }
}

// Helper function to load workspace collection
export async function loadWorkspaceCollection(workspaceId: string): Promise<WorkspaceCollection | null> {
  try {
    const collection = await restDb.workspaceCollections.get(workspaceId);
    return collection || null;
  } catch (error) {
    console.error('Failed to load workspace collection:', error);
    return null;
  }
}

// Helper function to load workspace environments
export async function loadWorkspaceEnvironments(workspaceId: string): Promise<WorkspaceEnvironments | null> {
  try {
    const environments = await restDb.workspaceEnvironments.get(workspaceId);
    return environments || null;
  } catch (error) {
    console.error('Failed to load workspace environments:', error);
    return null;
  }
}

export function useAutoSave() {
  const currentWorkspace = useAppSelector(state => state.workspace.currentWorkspace);
  const activeTabId = useAppSelector(state => state.rest.tabs.activeTabId);
  const visibleTabIds = useAppSelector(state => state.rest.ui.visibleTabIds);
  const collection = useAppSelector(state => state.rest.collection);
  const environments = useAppSelector(state => state.rest.environments);
  const activeEnvironmentId = useAppSelector(state => state.rest.activeEnvironmentId);
  const allTabs = useAppSelector(state => state.rest.tabs.byId);

  // FIXME: TODO: ON WORKSPACE CHANGE, WE WANT TO AVOID RUNNING ALL THE USEEFFECTS

  // Auto-save workspace session when activeTabId or visibleTabIds change
  useEffect(() => {
    if (!currentWorkspace) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log('Auto-saving workspace session:', {
          workspaceId: currentWorkspace,
          activeTabId,
          visibleTabIds
        });

        await restDb.workspaceSessions.put({
          workspaceId: currentWorkspace,
          activeTabId,
          visibleTabIds: [...visibleTabIds], // Create a copy
          lastUpdated: Date.now()
        });

        console.log('Workspace session saved successfully');
      } catch (error) {
        console.error('Failed to save workspace session:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentWorkspace, activeTabId, visibleTabIds]);

  // Auto-save workspace collection when collection changes
  useEffect(() => {
    if (!currentWorkspace) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log('Auto-saving workspace collection:', {
          workspaceId: currentWorkspace,
          collectionLength: collection.length
        });

        await restDb.workspaceCollections.put({
          workspaceId: currentWorkspace,
          collection: [...collection], // Create a copy
          lastUpdated: Date.now()
        });

        console.log('Workspace collection saved successfully');
      } catch (error) {
        console.error('Failed to save workspace collection:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentWorkspace, collection]);

  // Auto-save workspace environments when environments or activeEnvironmentId change
  useEffect(() => {
    if (!currentWorkspace) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log('Auto-saving workspace environments:', {
          workspaceId: currentWorkspace,
          environmentsCount: environments.length,
          activeEnvironmentId
        });

        await restDb.workspaceEnvironments.put({
          workspaceId: currentWorkspace,
          environments: environments.map(env => ({ ...env, variables: [...env.variables] })), // Deep copy
          activeEnvironmentId,
          lastUpdated: Date.now()
        });

        console.log('Workspace environments saved successfully');
      } catch (error) {
        console.error('Failed to save workspace environments:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentWorkspace, environments, activeEnvironmentId]);

  // Auto-save individual request changes when specific tab's request data changes
  useEffect(() => {
    if (!currentWorkspace) return;

    // Get all tabs that are marked as dirty
    const dirtyTabs = Object.values(allTabs).filter(tab => tab && tab.isDirty);

    if (dirtyTabs.length === 0) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log(`Auto-saving ${dirtyTabs.length} modified requests for workspace:`, currentWorkspace);

        // Save only the modified requests to IndexedDB
        const requestPromises = dirtyTabs.map(tab => {
          return restDb.requests.put({
            ...tab.request,
            updatedAt: Date.now()
          });
        });

        await Promise.all(requestPromises);
        console.log(`Saved ${dirtyTabs.length} modified requests to IndexedDB`);
      } catch (error) {
        console.error('Failed to save modified requests:', error);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [currentWorkspace, allTabs]);
}
