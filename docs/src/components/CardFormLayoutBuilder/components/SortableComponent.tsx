import React from 'react';
import { Icon } from '@iconify/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import styles from './SortableComponent.module.css';

interface SortableComponentProps {
  component: {
    id: string;
    label: string;
    type: string;
  };
  onRemove: () => void;
  onConfigure: (component: any) => void;
  isJustAdded?: boolean;
}

export default function SortableComponent({
  component,
  onRemove,
  onConfigure,
  isJustAdded,
}: SortableComponentProps): ReactNode {
  const sortableProps = useSortable({ id: component.id });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortableProps;

  // Keep dynamic drag styles inline for performance
  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={dynamicStyle} {...attributes} {...listeners}>
      <div
        className={`${styles.component} ${isDragging ? styles.dragging : ''}`}
      >
        <div className={styles.dragHandle}>
          <Icon icon='mdi:drag-vertical' width='16' height='16' />
        </div>

        <div className={styles.actions}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfigure(component);
            }}
            className={`${styles.actionButton} ${styles.configureButton}`}
          >
            <Icon icon='mdi:cog' width='16' height='16' />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={`${styles.actionButton} ${styles.removeButton}`}
          >
            <Icon icon='mdi:close' width='16' height='16' />
          </button>
        </div>

        <span className={styles.label}>{component.label}</span>
      </div>
    </div>
  );
}
