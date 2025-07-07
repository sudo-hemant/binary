'use client';

import { useAppSelector } from '@/store/hooks/redux';
import { selectCollection } from '../../store/restSlice';
import { CollectionTreeItem } from './CollectionTreeItem';

export function CollectionTree() {
  const collection = useAppSelector(selectCollection);

  if (collection.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground">
        No collections yet
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {collection.map((item) => (
        <CollectionTreeItem key={item.id} item={item} />
      ))}
    </div>
  );
}