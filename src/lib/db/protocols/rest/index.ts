import Dexie, { Table } from 'dexie';
import type { CollectionItem, ApiRequest, Environment } from '../../../../modules/protocols/rest/store/restSlice';

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

export interface WorkspaceEnvironments {
  workspaceId: string;
  environments: Environment[];
  activeEnvironmentId: string | null;
  lastUpdated: number;
}

export class RestDatabase extends Dexie {
  workspaceSessions!: Table<WorkspaceSession>;
  workspaceCollections!: Table<WorkspaceCollection>;
  workspaceEnvironments!: Table<WorkspaceEnvironments>;
  requests!: Table<ApiRequest>;

  constructor() {
    super('ApiTesting_REST');

    // Version 1: Initial schema
    this.version(1).stores({
      workspaceSessions: 'workspaceId',
      workspaceCollections: 'workspaceId',
      requests: 'id, workspaceId, updatedAt'
    });

    // Version 2: Add environments table
    this.version(2).stores({
      workspaceSessions: 'workspaceId',
      workspaceCollections: 'workspaceId',
      workspaceEnvironments: 'workspaceId',
      requests: 'id, workspaceId, updatedAt'
    });
  }
}

export const restDb = new RestDatabase();
