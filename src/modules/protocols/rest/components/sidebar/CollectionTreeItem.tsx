'use client';

import { useState } from 'react';
import type { CollectionItem } from '../../store/restSlice';
import { CollectionItemContent } from './CollectionItemContent';

interface CollectionTreeItemProps {
  item: CollectionItem;
  level?: number;
}

export function CollectionTreeItem({ item, level = 0 }: CollectionTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = (item.type === 'folder' && item.children && item.children.length > 0) ?? false;
  
  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div>
      <CollectionItemContent
        item={item}
        level={level}
        hasChildren={hasChildren}
        isExpanded={isExpanded}
        onToggleExpanded={handleToggleExpanded}
      />
      
      {/* Render children if expanded */}
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <CollectionTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}