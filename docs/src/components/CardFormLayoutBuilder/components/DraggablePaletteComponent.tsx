import React from 'react';
import { Icon } from '@iconify/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';
import styles from './DraggablePaletteComponent.module.css';

interface Component {
  id: string;
  label: string;
  type: string;
}

interface Row {
  id: string;
  components: Component[];
}

interface DraggablePaletteComponentProps {
  component: Component;
  onAddToRow: (rowId: string, componentType: string) => void;
  availableRows: Row[];
}

export default function DraggablePaletteComponent({
  component,
  onAddToRow,
  availableRows,
}: DraggablePaletteComponentProps): ReactNode {
  const sortableProps = useSortable({
    id: `palette-${component.id}`,
    data: { type: 'palette-component', component },
  });
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
    transition: isDragging ? 'none' : transition || 'transform 200ms ease',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={dynamicStyle} {...attributes} {...listeners}>
      <div
        className={`${styles.component} ${isDragging ? styles.dragging : ''}`}
      >
        <div className={styles.dragHandle}>
          <Icon icon='mdi:drag-vertical' width='16' height='16' />
        </div>

        <div className={styles.title}>{component.label}</div>

        <div className={styles.description}>Drag to a row above</div>

        {availableRows.length > 0 && (
          <div className={styles.rowButtons}>
            {availableRows.map((row, index) => (
              <button
                key={row.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToRow(row.id, component.type);
                }}
                className={styles.rowButton}
              >
                <Icon icon='mdi:arrow-right' width='16' height='16' />
                Row {index + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
