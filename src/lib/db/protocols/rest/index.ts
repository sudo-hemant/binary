import Dexie, { Table } from 'dexie';
import type { CollectionItem, ApiRequest } from '../../../../modules/protocols/rest/store/restSlice';

export interface WorkspaceSession {
  workspaceId: string;
  activeTabId: string | null;
  visibleTabIds: string[];
  lastUpdated: number;
}

export interface WorkspaceCollection {
  workspaceId: string;
  collection: CollectionItem[];
  lastUpdated: number;
}

export class RestDatabase extends Dexie {
  workspaceSessions!: Table<WorkspaceSession>;
  workspaceCollections!: Table<WorkspaceCollection>;
  requests!: Table<ApiRequest>;

  constructor() {
    super('ApiTesting_REST');
    
    this.version(1).stores({
      workspaceSessions: 'workspaceId',
      workspaceCollections: 'workspaceId',
      requests: 'id, workspaceId, updatedAt'
    });
  }
}

export const restDb = new RestDatabase();