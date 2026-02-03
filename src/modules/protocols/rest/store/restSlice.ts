import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

export interface Header {
  id: string;
  key: string;
  value: string;
  description: string;
  enabled: boolean;
}

// export interface AuthConfig {
//   type: 'none' | 'basic' | 'bearer' | 'apikey';
//   credentials: Record<string, any>;
// }

export type BodyType = 'none' | 'json' | 'text';

export interface RequestBody {
  type: BodyType;
  content: {
    raw: string;                    // Raw input from user
    parsed: unknown | null;         // Parsed content (for JSON) or null
    formatted: string;              // Pretty-formatted version
  };
  validation: {
    isValid: boolean;      // Validation status
    error: string | null;  // Validation error message
  };
}

export interface ApiRequest {
  id: string;
  workspaceId: string;
  name: string;
  url: string;
  method: string;
  params: QueryParam[];
  headers: Header[];
  body: RequestBody;
  // auth: AuthConfig;
  createdAt: number; 
  updatedAt: number; 
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  duration: number;
  timestamp: number;
}

export interface TabUIState {
  activeSection: 'params' | 'headers' | 'body' | 'auth';
  bulkEditMode: {
    params: boolean;
    headers: boolean;
  };
  loading: boolean;
  error: any | null; // TODO: Should be ErrorResponse | null but needs proper import
  responseActiveTab: 'body' | 'headers' | 'raw';
}

export interface RestTab {
  id: string;
  name: string;
  request: ApiRequest;  // Full ApiRequest object
  ui: TabUIState;
  responses: ApiResponse[]; // Array to store response history
  isDirty: boolean;
  createdAt: number;
  // Loading states for lazy loading
  isLoadingRequest: boolean;  // True when loading request data from IndexedDB
  hasRequestData: boolean;    // True when request data has been loaded
}

// Collection types
export interface CollectionItem {
  id: string;
  name: string;
  type: 'folder' | 'request';
  children?: CollectionItem[];    // Only folders have children
  requestId?: string;             // Only requests have this (references tab ID)
}

interface RestProtocolState {
  // Tab management
  tabs: {
    byId: Record<string, RestTab>;
    // allIds: string[];
    activeTabId: string | null;
  };
  
  // UI State for tabs
  ui: {
    visibleTabIds: string[];    // Tabs shown in tab bar
    maxVisibleTabs: number;     // Maximum tabs that can be open
  };
  
  // Collection
  collection: CollectionItem[];
  
  // Shared across all tabs (to be implemented later)
  // history: ApiRequest[];
  // environments: Environment[];
  // activeEnvironmentId: string | null;
}

// Helper function to create default body
const createDefaultBody = (): RequestBody => ({
  type: 'none',
  content: {
    raw: '',
    parsed: null,
    formatted: ''
  },
  validation: {
    isValid: true,
    error: null
  }
});

// Helper function to create default tab
const createDefaultTab = (id: string, workspaceId: string, name: string = 'Untitled Request', hasRequestData: boolean = true): RestTab => {
  const now = Date.now();
  return {
    id,
    name,
    request: {
      id,  // Same as tab ID
      workspaceId,
      name,
      url: '',
      method: 'GET',
      params: [{ id: '1', key: '', value: '', description: '', enabled: false }],
      headers: [{ id: '1', key: '', value: '', description: '', enabled: false }],
      body: createDefaultBody(),
      // auth: { type: 'none', credentials: {} }
      createdAt: now,
      updatedAt: now
    },
    ui: {
      activeSection: 'params',
      bulkEditMode: {
        params: false,
        headers: false
      },
      loading: false,
      error: null,
      responseActiveTab: 'body'
    },
    responses: [],
    isDirty: true,
    createdAt: now,
    isLoadingRequest: false,
    hasRequestData: hasRequestData  // For new tabs, data is immediately available
  };
};

// Helper function to find an item in the collection tree by ID
const findCollectionItemById = (
  items: CollectionItem[],
  id: string
): { item: CollectionItem; parent: CollectionItem[] } | null => {
  for (const item of items) {
    if (item.id === id) {
      return { item, parent: items };
    }
    if (item.type === 'folder' && item.children) {
      const found = findCollectionItemById(item.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Helper function to find parent folder by ID
const findParentFolder = (
  items: CollectionItem[],
  parentId: string | null
): CollectionItem[] | null => {
  if (parentId === null) return items; // Root level

  for (const item of items) {
    if (item.id === parentId && item.type === 'folder') {
      return item.children || [];
    }
    if (item.type === 'folder' && item.children) {
      const found = findParentFolder(item.children, parentId);
      if (found) return found;
    }
  }
  return null;
};

// Helper to ensure folder has children array
const ensureFolderChildren = (
  items: CollectionItem[],
  folderId: string
): CollectionItem[] | null => {
  for (const item of items) {
    if (item.id === folderId && item.type === 'folder') {
      if (!item.children) {
        item.children = [];
      }
      return item.children;
    }
    if (item.type === 'folder' && item.children) {
      const found = ensureFolderChildren(item.children, folderId);
      if (found) return found;
    }
  }
  return null;
};

// Dummy collection data for UI development
// FIXME: REMOVE
const dummyCollection: CollectionItem[] = [
  {
    id: 'folder-1',
    name: 'User Management',
    type: 'folder',
    children: [
      {
        id: 'req-1',
        name: 'Get All Users',
        type: 'request',
        requestId: 'tab-11'
      },
      {
        id: 'req-2',
        name: 'Create User',
        type: 'request',
        requestId: 'tab-2'
      },
      {
        id: 'folder-1-1',
        name: 'Authentication',
        type: 'folder',
        children: [
          {
            id: 'req-3',
            name: 'Login',
            type: 'request',
            requestId: 'tab-3'
          },
          {
            id: 'req-4',
            name: 'Logout',
            type: 'request',
            requestId: 'tab-4'
          }
        ]
      }
    ]
  },
  {
    id: 'folder-2',
    name: 'Products API',
    type: 'folder',
    children: [
      {
        id: 'req-5',
        name: 'List Products',
        type: 'request',
        requestId: 'tab-5'
      },
      {
        id: 'req-6',
        name: 'Get Product Details',
        type: 'request',
        requestId: 'tab-6'
      }
    ]
  },
  {
    id: 'req-7',
    name: 'Health Check',
    type: 'request',
    requestId: 'tab-7'
  }
];

const initialState: RestProtocolState = {
  tabs: {
    byId: {},
    activeTabId: null,
  },
  ui: {
    visibleTabIds: [],
    maxVisibleTabs: 15
  },
  // FIXME:
  collection: dummyCollection
};

const restSlice = createSlice({
  name: 'rest',
  initialState,
  reducers: {
    // Tab management actions
    createTab: (state, action: PayloadAction<{ name?: string; workspaceId: string; id?: string }>) => {
      // Check if we can add more tabs first
      if (state.ui.visibleTabIds.length >= state.ui.maxVisibleTabs) {
        return; // Don't create tab if limit reached
      }

      const timestamp = Date.now();
      const newTabId = action.payload.id || `tab-${timestamp}`;
      const shortId = timestamp.toString().slice(-4); // Last 4 digits
      const defaultName = `New Request ${shortId}`;
      const newTab = createDefaultTab(newTabId, action.payload.workspaceId, action.payload.name || defaultName);

      // Add to state
      // Already set isDirty to true while creating request
      state.tabs.byId[newTabId] = newTab;
      state.tabs.activeTabId = newTabId;
      state.ui.visibleTabIds.push(newTabId);
    },
    
    createTabFromImport: (state, action: PayloadAction<{ 
      name: string; 
      url: string; 
      method: string; 
      headers: Header[]; 
      body: RequestBody; 
      params: QueryParam[];
      workspaceId: string;
    }>) => {
      // Check if we can add more tabs first
      if (state.ui.visibleTabIds.length >= state.ui.maxVisibleTabs) {
        return; // Don't create tab if limit reached
      }
      
      const { name, url, method, headers, body, params, workspaceId } = action.payload;
      const newTabId = `tab-${Date.now()}`;
      const now = Date.now();
      
      const newTab: RestTab = {
        id: newTabId,
        name,
        request: {
          id: newTabId,  // Same as tab ID
          workspaceId,  // Use provided workspace ID
          name,
          url,
          method,
          params,
          headers,
          body,
          createdAt: now,
          updatedAt: now
        },
        ui: {
          activeSection: 'params',
          bulkEditMode: {
            params: false,
            headers: false
          },
          loading: false,
          error: null,
          responseActiveTab: 'body'
        },
        responses: [],
        isDirty: true,
        createdAt: now,
        isLoadingRequest: false,
        hasRequestData: true  // Imported data is immediately available
      };
      
      // Add to state
      // Already set isDirty to true while creating request
      state.tabs.byId[newTabId] = newTab;
      state.tabs.activeTabId = newTabId;
      state.ui.visibleTabIds.push(newTabId);
    },
    
    openCollectionRequest: (state, action: PayloadAction<{ requestId: string; name: string; workspaceId: string }>) => {
      const { requestId, name, workspaceId } = action.payload;
      
      // Check if tab already exists with this request ID
      if (state.tabs.byId[requestId]) {
        // Tab exists, just activate it
        state.tabs.activeTabId = requestId;
        
        // Make sure it's visible
        if (!state.ui.visibleTabIds.includes(requestId)) {
          if (state.ui.visibleTabIds.length < state.ui.maxVisibleTabs) {
            state.ui.visibleTabIds.push(requestId);
          } else {
            // TODO: some message to user for limit
          }
        }
      } else {
        // Check if we can add more tabs
        if (state.ui.visibleTabIds.length >= state.ui.maxVisibleTabs) {
          return; // Don't create tab if limit reached
        }
        
        // TODO: This will become an async thunk in the future
        // 1. Load request from IndexedDB by requestId
        // 2. Create tab with loaded data
        // 3. If not found in DB, then create empty tab
        
        // For now: create empty tab (temporary)
        const newTab = createDefaultTab(requestId, workspaceId, name);
        
        state.tabs.byId[requestId] = newTab;
        state.ui.visibleTabIds.push(requestId);
        state.tabs.activeTabId = requestId;
      }
    },
    
    closeTab: (state, action: PayloadAction<{ tabId: string }>) => {
      const { tabId } = action.payload;
      const visibleTabIndex = state.ui.visibleTabIds.indexOf(tabId);
      
      if (!state.tabs.byId[tabId]) return;
      
      // Remove tab from all collections
      delete state.tabs.byId[tabId];
      
      // Remove from visible tabs if present
      if (visibleTabIndex !== -1) {
        state.ui.visibleTabIds.splice(visibleTabIndex, 1);
      }
      
      // If closing active tab, activate another
      if (state.tabs.activeTabId === tabId) {
        const remainingTabIds = Object.keys(state.tabs.byId);
        
        if (remainingTabIds.length > 0) {
          // Try to activate the next visible tab, or the previous one
          if (visibleTabIndex !== -1 && state.ui.visibleTabIds.length > 0) {
            const newIndex = Math.min(visibleTabIndex, state.ui.visibleTabIds.length - 1);
            state.tabs.activeTabId = state.ui.visibleTabIds[newIndex];
          } else {
            // Fallback to any remaining tab
            state.tabs.activeTabId = remainingTabIds[0];
          }
        } else {
          // No tabs left, set activeTabId to null
          state.tabs.activeTabId = null;
        }
      }
    },
    
    setActiveTab: (state, action: PayloadAction<{ tabId: string }>) => {
      if (state.tabs.byId[action.payload.tabId]) {
        state.tabs.activeTabId = action.payload.tabId;
      }
    },
    
    // Request actions (tab-specific)
    updateTabUrl: (state, action: PayloadAction<{ tabId: string; url: string }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.request.url = action.payload.url;
        tab.isDirty = true;
      }
    },
    
    updateTabMethod: (state, action: PayloadAction<{ tabId: string; method: string }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.request.method = action.payload.method;
        tab.isDirty = true;
      }
    },
    
    updateTabParams: (state, action: PayloadAction<{ tabId: string; params: QueryParam[] }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.request.params = action.payload.params;
        tab.isDirty = true;
      }
    },
    
    updateTabHeaders: (state, action: PayloadAction<{ tabId: string; headers: Header[] }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.request.headers = action.payload.headers;
        tab.isDirty = true;
      }
    },
    
    updateTabBody: (state, action: PayloadAction<{ tabId: string; body: RequestBody }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.request.body = action.payload.body;
        tab.isDirty = true;
      }
    },
    
    updateTabBodyType: (state, action: PayloadAction<{ tabId: string; bodyType: BodyType }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        // Reset body when type changes
        tab.request.body = {
          type: action.payload.bodyType,
          content: {
            raw: '',
            parsed: null,
            formatted: ''
          },
          validation: {
            isValid: true,
            error: null
          }
        };
        tab.isDirty = true;
      }
    },
    
    updateTabBodyContent: (state, action: PayloadAction<{ tabId: string; raw: string }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (!tab) return;
      
      const { raw } = action.payload;
      tab.request.body.content.raw = raw;
      
      // Handle validation and formatting based on type
      if (tab.request.body.type === 'json') {
        try {
          const parsed = JSON.parse(raw);
          tab.request.body.content.parsed = parsed;
          tab.request.body.content.formatted = JSON.stringify(parsed, null, 2);
          tab.request.body.validation.isValid = true;
          tab.request.body.validation.error = null;
        } catch (error) {
          tab.request.body.content.parsed = null;
          tab.request.body.content.formatted = raw;
          tab.request.body.validation.isValid = false;
          tab.request.body.validation.error = error instanceof Error ? error.message : 'Invalid JSON';
        }
      } else if (tab.request.body.type === 'text') {
        tab.request.body.content.parsed = null;
        tab.request.body.content.formatted = raw;
        tab.request.body.validation.isValid = true;
        tab.request.body.validation.error = null;
      }
      
      tab.isDirty = true;
    },
    
    updateTabBodyRaw: (state, action: PayloadAction<{ tabId: string; raw: string }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (!tab) return;
      
      // Only update raw content, no validation
      tab.request.body.content.raw = action.payload.raw;
      tab.isDirty = true;
    },
    
    // UI state actions
    toggleTabBulkEditMode: (state, action: PayloadAction<{ tabId: string; section: 'params' | 'headers' }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.ui.bulkEditMode[action.payload.section] = !tab.ui.bulkEditMode[action.payload.section];
      }
    },
    
    // updateTabAuth: (state, action: PayloadAction<{ tabId: string; auth: AuthConfig }>) => {
    //   const tab = state.tabs.byId[action.payload.tabId];
    //   if (tab) {
    //     tab.request.auth = action.payload.auth;
    //     tab.isDirty = true;
    //   }
    // },
    
    updateTabName: (state, action: PayloadAction<{ tabId: string; name: string }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.name = action.payload.name;
        tab.request.name = action.payload.name;
        tab.isDirty = true;

        // Also update the collection item if it exists
        const findAndUpdateRequest = (items: CollectionItem[]): boolean => {
          for (const item of items) {
            if (item.type === 'request' && item.requestId === action.payload.tabId) {
              item.name = action.payload.name;
              return true;
            }
            if (item.type === 'folder' && item.children) {
              if (findAndUpdateRequest(item.children)) return true;
            }
          }
          return false;
        };
        findAndUpdateRequest(state.collection);
      }
    },
    
    // Response actions
    addTabResponse: (state, action: PayloadAction<{ tabId: string; response: ApiResponse }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        // Add new response to the end of the array
        tab.responses.push(action.payload.response);
        // Keep only last 10 responses to avoid memory issues
        if (tab.responses.length > 10) {
          tab.responses = tab.responses.slice(-10);
        }
        tab.ui.loading = false;
        tab.ui.error = null;
      }
    },
    
    setTabError: (state, action: PayloadAction<{ tabId: string; error: any }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.ui.loading = false;
        tab.ui.error = action.payload.error;
      }
    },
    
    setTabLoading: (state, action: PayloadAction<{ tabId: string; loading: boolean }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.ui.loading = action.payload.loading;
      }
    },
    
    clearTabResponses: (state, action: PayloadAction<{ tabId: string }>) => {
      const tab = state.tabs.byId[action.payload.tabId];
      if (tab) {
        tab.responses = [];
      }
    },

    // Collection CRUD actions
    addCollectionFolder: (state, action: PayloadAction<{
      name: string;
      parentId: string | null; // null = root level
    }>) => {
      const { name, parentId } = action.payload;
      const newFolder: CollectionItem = {
        id: `folder-${Date.now()}`,
        name,
        type: 'folder',
        children: []
      };

      if (parentId === null) {
        // Add to root level
        state.collection.push(newFolder);
      } else {
        // Add to parent folder
        const parentChildren = ensureFolderChildren(state.collection, parentId);
        if (parentChildren) {
          parentChildren.push(newFolder);
        }
      }
    },

    addCollectionRequest: (state, action: PayloadAction<{
      name: string;
      parentId: string | null; // null = root level
      requestId: string; // The tab/request ID
    }>) => {
      const { name, parentId, requestId } = action.payload;
      const newRequest: CollectionItem = {
        id: `req-${Date.now()}`,
        name,
        type: 'request',
        requestId
      };

      if (parentId === null) {
        // Add to root level
        state.collection.push(newRequest);
      } else {
        // Add to parent folder
        const parentChildren = ensureFolderChildren(state.collection, parentId);
        if (parentChildren) {
          parentChildren.push(newRequest);
        }
      }
    },

    renameCollectionItem: (state, action: PayloadAction<{
      itemId: string;
      newName: string;
    }>) => {
      const { itemId, newName } = action.payload;
      const found = findCollectionItemById(state.collection, itemId);
      if (found) {
        found.item.name = newName;

        // If it's a request, also update the tab name
        if (found.item.type === 'request' && found.item.requestId) {
          const tab = state.tabs.byId[found.item.requestId];
          if (tab) {
            tab.name = newName;
            tab.request.name = newName;
            tab.isDirty = true;
          }
        }
      }
    },

    deleteCollectionItem: (state, action: PayloadAction<{ itemId: string }>) => {
      const { itemId } = action.payload;

      // Helper to recursively delete from collection
      const deleteFromCollection = (items: CollectionItem[]): boolean => {
        const index = items.findIndex(item => item.id === itemId);
        if (index !== -1) {
          items.splice(index, 1);
          return true;
        }

        // Search in children
        for (const item of items) {
          if (item.type === 'folder' && item.children) {
            if (deleteFromCollection(item.children)) return true;
          }
        }
        return false;
      };

      deleteFromCollection(state.collection);
    },

    // Update collection directly (for reordering, etc.)
    setCollection: (state, action: PayloadAction<CollectionItem[]>) => {
      state.collection = action.payload;
    },

    // Workspace session restoration (sync - restores all tab data)
    restoreWorkspaceSession: (state, action: PayloadAction<{ 
      activeTabId: string | null; 
      visibleTabIds: string[];
      collection?: CollectionItem[];
      tabsData?: Record<string, ApiRequest>; // Pre-loaded tab data
      workspaceId: string; // Current workspace ID
    }>) => {
      const { activeTabId, visibleTabIds, collection, tabsData, workspaceId } = action.payload;
      
      // Set active tab
      state.tabs.activeTabId = activeTabId;
      
      // Clear existing visible tabs and add new ones
      state.ui.visibleTabIds.length = 0; // Clear array
      state.ui.visibleTabIds.push(...visibleTabIds); // Add new items
      
      // Restore collection if provided
      if (collection) {
        state.collection.length = 0; // Clear array
        state.collection.push(...collection); // Add new items
      }
      
      // Create tabs with loaded data or empty shells
      visibleTabIds.forEach(tabId => {
        if (!state.tabs.byId[tabId]) {
          const requestData = tabsData?.[tabId];
          
          if (requestData) {
            // Create tab with loaded request data
            const now = Date.now();
            const tab: RestTab = {
              id: tabId,
              name: requestData.name,
              request: requestData,
              ui: {
                activeSection: 'params',
                bulkEditMode: {
                  params: false,
                  headers: false
                },
                loading: false,
                error: null,
                responseActiveTab: 'body'
              },
              responses: [],
              isDirty: false, // Loaded from DB, not dirty
              createdAt: now,
              isLoadingRequest: false,
              hasRequestData: true
            };
            state.tabs.byId[tabId] = tab;
          } else {
            // Create empty tab shell if no data found
            const emptyTab = createDefaultTab(tabId, workspaceId, 'New Request', true);
            emptyTab.isDirty = false; // Empty shell, not dirty
            state.tabs.byId[tabId] = emptyTab;
          }
        }
      });
    }
  }
});

// Selectors
// export const selectAllTabs = (state: { rest: RestProtocolState }) => state.rest.tabs.allIds.map(id => state.rest.tabs.byId[id]);

export const selectActiveTab = (state: { rest: RestProtocolState }) => {
  const activeId = state.rest.tabs.activeTabId;
  return activeId ? state.rest.tabs.byId[activeId] : null;
};

export const selectTabById = (state: { rest: RestProtocolState }, tabId: string) => state.rest.tabs.byId[tabId];

export const selectVisibleTabs = (state: { rest: RestProtocolState }) => {
  return state.rest.ui.visibleTabIds.map(id => state.rest.tabs.byId[id]).filter(Boolean);
};

export const selectMaxVisibleTabs = (state: { rest: RestProtocolState }) => state.rest.ui.maxVisibleTabs;

export const selectCanAddMoreTabs = (state: { rest: RestProtocolState }) => {
  return state.rest.ui.visibleTabIds.length < state.rest.ui.maxVisibleTabs;
};

export const selectCollection = (state: { rest: RestProtocolState }) => state.rest.collection;

export const {
  // Tab management
  createTab,
  createTabFromImport,
  openCollectionRequest,
  closeTab,
  setActiveTab,
  restoreWorkspaceSession,

  // Request actions
  updateTabUrl,
  updateTabMethod,
  updateTabParams,
  updateTabHeaders,
  updateTabBody,
  updateTabBodyType,
  updateTabBodyContent,
  updateTabBodyRaw,
  updateTabName,

  // UI actions
  toggleTabBulkEditMode,

  // Response actions
  addTabResponse,
  setTabLoading,
  setTabError,
  clearTabResponses,

  // Collection actions
  addCollectionFolder,
  addCollectionRequest,
  renameCollectionItem,
  deleteCollectionItem,
  setCollection,
} = restSlice.actions;

export default restSlice.reducer;