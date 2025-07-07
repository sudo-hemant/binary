'use client';

import { CollectionHeader } from './CollectionHeader';
import { CollectionTree } from './CollectionTree';

export function CollectionsSection() {
  return (
    <div className="space-y-2">
      <CollectionHeader />
      <CollectionTree />
    </div>
  );
}