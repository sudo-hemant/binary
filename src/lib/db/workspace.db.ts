import Dexie, { Table } from 'dexie';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number; // epoch timestamp
  updatedAt: number; // epoch timestamp
}

export class WorkspaceDatabase extends Dexie {
  workspaces!: Table<Workspace>;

  constructor() {
    super('ApiTesting_Workspaces');
    
    this.version(1).stores({
      workspaces: 'id, name, createdAt'
    });
  }
}

export const workspaceDb = new WorkspaceDatabase();