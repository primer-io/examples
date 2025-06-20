import React from 'react';
import { Icon } from '@iconify/react';
import {
  useSortable,
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import SortableComponent from './SortableComponent';
import styles from './DroppableRow.module.css';

interface Component {
  id: string;
  label: string;
  type: string;
}

interface Row {
  id: string;
  components: Component[];
}

interface DroppableRowProps {
  row: Row;
  onRemove: () => void;
  onRemoveComponent: (rowId: string, componentId: string) => void;
  onConfigureComponent: (component: Component) => void;
  justAdded?: string;
}

export default function DroppableRow({
  row,
  onRemove,
  onRemoveComponent,
  onConfigureComponent,
  justAdded,
}: DroppableRowProps): ReactNode {
  const sortableProps = useSortable({ id: row.id });
  const {
    attributes,
    listeners,
    setNodeRef: sortableRef,
    transform,
    transition,
    isDragging,
  } = sortableProps;

  const droppableProps = useDroppable({ id: row.id });
  const { setNodeRef: droppableRef, isOver } = droppableProps;

  // Keep dynamic drag styles inline for performance
  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  // Combine refs
  const setNodeRef = (node: HTMLElement | null) => {
    sortableRef(node);
    droppableRef(node);
  };

  const isEmpty = row.components.length === 0;

  return (
    <div ref={setNodeRef} style={dynamicStyle}>
      <div
        className={`${styles.row} ${isDragging ? styles.dragging : ''} ${isOver ? styles.isOver : ''}`}
      >
        <div
          className={`${styles.dragHandle} ${isOver ? styles.isOver : ''}`}
          {...attributes}
          {...listeners}
        >
          <Icon icon='mdi:drag-vertical' width='16' height='16' />
          <span>{isOver ? 'Drop Here!' : 'Drag Row'}</span>
        </div>

        <button onClick={onRemove} className={styles.removeButton}>
          <Icon icon='mdi:close' width='18' height='18' />
        </button>

        <div
          className={`${styles.content} ${isEmpty ? styles.empty : styles.filled} ${isOver && isEmpty ? styles.isOver : ''}`}
        >
          {isEmpty ? (
            <div
              className={`${styles.emptyState} ${isOver ? styles.isOver : ''}`}
            >
              <div className={styles.emptyStateIcon}>
                <Icon
                  icon={isOver ? 'mdi:target' : 'mdi:package-variant'}
                  width='24'
                  height='24'
                />
              </div>
              <div
                className={`${styles.emptyStateText} ${isOver ? styles.isOver : ''}`}
              >
                {isOver
                  ? 'Release to add component!'
                  : 'Drag card form components here'}
              </div>
              {!isOver && (
                <div className={styles.emptyStateHint}>
                  or use the buttons on the right
                </div>
              )}
            </div>
          ) : (
            <SortableContext
              items={row.components.map((c) => c.id)}
              strategy={horizontalListSortingStrategy}
            >
              {row.components.map((component) => (
                <SortableComponent
                  key={component.id}
                  component={component}
                  onRemove={() => onRemoveComponent(row.id, component.id)}
                  onConfigure={onConfigureComponent}
                  isJustAdded={justAdded === component.id}
                />
              ))}
            </SortableContext>
          )}
        </div>
      </div>
    </div>
  );
}
