import React, { useState, useEffect } from 'react';
import CodeBlock from '@theme/CodeBlock';
import { Icon } from '@iconify/react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { ReactNode } from 'react';
import DroppableRow from './components/DroppableRow';
import DraggablePaletteComponent from './components/DraggablePaletteComponent';
import ComponentConfigModal from './components/ComponentConfigModal';
import styles from './CardFormLayoutBuilder.module.css';

interface Component {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  ariaLabel?: string;
  buttonText?: string;
}

interface Row {
  id: string;
  components: Component[];
}

export default function CardFormLayoutBuilder(): ReactNode {
  // Define default values based on actual component configs
  const getDefaultValues = (type: string) => {
    switch (type) {
      case 'card-number':
        return {
          label: 'Card Number',
          placeholder: '4111 1111 1111 1111',
          ariaLabel: 'Card Number',
        };
      case 'card-expiry':
        return {
          label: 'Expiry Date',
          placeholder: 'MM/YY',
          ariaLabel: 'Expiry Date',
        };
      case 'cvv':
        return { label: 'CVV', placeholder: '123', ariaLabel: 'CVV' };
      case 'cardholder-name':
        return {
          label: 'Cardholder Name',
          placeholder: 'Name on card',
          ariaLabel: 'Cardholder Name',
        };
      case 'submit':
        return { label: 'Submit Button', buttonText: 'Pay' };
      default:
        return {};
    }
  };

  const [components] = useState<Component[]>([
    {
      type: 'card-number',
      ...getDefaultValues('card-number'),
      id: 'card-number',
    } as Component,
    {
      type: 'card-expiry',
      ...getDefaultValues('card-expiry'),
      id: 'card-expiry',
    } as Component,
    { type: 'cvv', ...getDefaultValues('cvv'), id: 'cvv' } as Component,
    {
      type: 'cardholder-name',
      ...getDefaultValues('cardholder-name'),
      id: 'cardholder-name',
    } as Component,
    {
      type: 'submit',
      ...getDefaultValues('submit'),
      id: 'submit',
    } as Component,
  ]);
  const [layout, setLayout] = useState<Row[]>([]);
  const [availableComponents, setAvailableComponents] =
    useState<Component[]>(components);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [successfulDrop, setSuccessfulDrop] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null,
  );
  const [configuring, setConfiguring] = useState(false);
  const [isWideScreen, setIsWideScreen] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideScreen(window.innerWidth > 1024);
    };

    checkScreenSize();

    const resizeObserver = new ResizeObserver(() => {
      checkScreenSize();
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addRow = () => {
    setLayout([...layout, { id: `row-${Date.now()}`, components: [] }]);
  };

  const addComponentToRow = (rowId: string, componentType: string) => {
    const component = availableComponents.find((c) => c.type === componentType);
    if (!component) return;

    const newComponent: Component = {
      ...component,
      id: `${component.type}-${Date.now()}`,
    };

    setLayout(
      layout.map((row) =>
        row.id === rowId
          ? { ...row, components: [...row.components, newComponent] }
          : row,
      ),
    );

    setAvailableComponents(
      availableComponents.filter((c) => c.type !== componentType),
    );
  };

  const removeComponentFromRow = (rowId: string, componentId: string) => {
    const row = layout.find((r) => r.id === rowId);
    const component = row?.components.find((c) => c.id === componentId);

    if (component) {
      const baseComponent = components.find((c) => c.type === component.type);
      if (
        baseComponent &&
        !availableComponents.some((c) => c.type === component.type)
      ) {
        setAvailableComponents([...availableComponents, { ...baseComponent }]);
      }
    }

    setLayout(
      layout.map((row) =>
        row.id === rowId
          ? {
              ...row,
              components: row.components.filter((c) => c.id !== componentId),
            }
          : row,
      ),
    );
  };

  const removeRow = (rowId: string) => {
    const row = layout.find((r) => r.id === rowId);
    if (row) {
      row.components.forEach((component) => {
        const baseComponent = components.find((c) => c.type === component.type);
        if (
          baseComponent &&
          !availableComponents.some((c) => c.type === component.type)
        ) {
          setAvailableComponents((prev) => [...prev, { ...baseComponent }]);
        }
      });
    }
    setLayout(layout.filter((row) => row.id !== rowId));
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: any) => {
    // Just for visual feedback, no state changes here
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setSuccessfulDrop(false);
      return;
    }

    const activeData = active.data.current;

    // Handle dragging from palette to row
    if (
      activeData?.type === 'palette-component' &&
      over.id.startsWith('row-')
    ) {
      const componentType = activeData.component.type;
      // Immediately clear activeId to prevent return animation
      setActiveId(null);
      setSuccessfulDrop(true);
      addComponentToRow(over.id, componentType);
      // Reset success state after a short delay
      setTimeout(() => {
        setSuccessfulDrop(false);
      }, 100);
      return;
    }

    setActiveId(null);
    setSuccessfulDrop(false);

    // Handle row reordering
    if (active.id.startsWith('row-') && over.id.startsWith('row-')) {
      const oldIndex = layout.findIndex((row) => row.id === active.id);
      const newIndex = layout.findIndex((row) => row.id === over.id);

      if (oldIndex !== newIndex) {
        setLayout(arrayMove(layout, oldIndex, newIndex));
      }
      return;
    }

    // Handle component reordering within rows
    const activeRow = layout.find((row) =>
      row.components.some((comp) => comp.id === active.id),
    );
    const overRow = layout.find(
      (row) =>
        row.components.some((comp) => comp.id === over.id) ||
        row.id === over.id,
    );

    if (activeRow && overRow && activeRow.id === overRow.id) {
      const oldIndex = activeRow.components.findIndex(
        (comp) => comp.id === active.id,
      );
      const newIndex = activeRow.components.findIndex(
        (comp) => comp.id === over.id,
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const newComponents = arrayMove(
          activeRow.components,
          oldIndex,
          newIndex,
        );
        setLayout(
          layout.map((row) =>
            row.id === activeRow.id
              ? { ...row, components: newComponents }
              : row,
          ),
        );
      }
    }
  };

  const generateCode = () => {
    if (layout.length === 0) {
      return `<primer-card-form>
  <!-- Default layout with all components -->
</primer-card-form>`;
    }

    let cardFormContent = '';

    layout.forEach((row) => {
      if (row.components.length === 0) return;

      if (row.components.length === 1) {
        const component = row.components[0];
        cardFormContent += `    ${componentToHtml(component)}\n`;
      } else {
        cardFormContent +=
          '    <div style="display: flex; gap: 8px; flex-wrap: wrap;">\n';
        row.components.forEach((component) => {
          cardFormContent += `      ${componentToHtml(component)}\n`;
        });
        cardFormContent += '    </div>\n';
      }
    });

    return `<primer-card-form>
  <div slot="card-form-content">
${cardFormContent}  </div>
</primer-card-form>`;
  };

  const configureComponent = (component: Component) => {
    setSelectedComponent(component);
    setConfiguring(true);
  };

  const updateComponent = (updatedComponent: Component) => {
    setLayout(
      layout.map((row) => ({
        ...row,
        components: row.components.map((c) =>
          c.id === updatedComponent.id ? updatedComponent : c,
        ),
      })),
    );
    setConfiguring(false);
    setSelectedComponent(null);
  };

  const componentToHtml = (component: Component) => {
    const defaults = getDefaultValues(component.type);

    const buildAttributes = (attributeMappings: any, defaults: any) => {
      return Object.entries(attributeMappings)
        .filter(([attrName, { value, defaultKey }]: [string, any]) => {
          // Only include if value exists and is different from default
          return value && value.trim() !== '' && value !== defaults[defaultKey];
        })
        .map(([attrName, { value }]: [string, any]) => `${attrName}="${value}"`)
        .join(' ');
    };

    switch (component.type) {
      case 'card-number':
        const cardNumberAttrs = buildAttributes(
          {
            'label': { value: component.label, defaultKey: 'label' },
            'placeholder': {
              value: component.placeholder,
              defaultKey: 'placeholder',
            },
            'aria-label': {
              value: component.ariaLabel,
              defaultKey: 'ariaLabel',
            },
          },
          defaults,
        );
        return `<primer-input-card-number${cardNumberAttrs ? ' ' + cardNumberAttrs : ''}></primer-input-card-number>`;

      case 'card-expiry':
        const cardExpiryAttrs = buildAttributes(
          {
            'label': { value: component.label, defaultKey: 'label' },
            'placeholder': {
              value: component.placeholder,
              defaultKey: 'placeholder',
            },
            'aria-label': {
              value: component.ariaLabel,
              defaultKey: 'ariaLabel',
            },
          },
          defaults,
        );
        return `<primer-input-card-expiry${cardExpiryAttrs ? ' ' + cardExpiryAttrs : ''}></primer-input-card-expiry>`;

      case 'cvv':
        const cvvAttrs = buildAttributes(
          {
            'label': { value: component.label, defaultKey: 'label' },
            'placeholder': {
              value: component.placeholder,
              defaultKey: 'placeholder',
            },
            'aria-label': {
              value: component.ariaLabel,
              defaultKey: 'ariaLabel',
            },
          },
          defaults,
        );
        return `<primer-input-cvv${cvvAttrs ? ' ' + cvvAttrs : ''}></primer-input-cvv>`;

      case 'cardholder-name':
        const cardholderAttrs = buildAttributes(
          {
            'label': { value: component.label, defaultKey: 'label' },
            'placeholder': {
              value: component.placeholder,
              defaultKey: 'placeholder',
            },
            'aria-label': {
              value: component.ariaLabel,
              defaultKey: 'ariaLabel',
            },
          },
          defaults,
        );
        return `<primer-input-card-holder-name${cardholderAttrs ? ' ' + cardholderAttrs : ''}></primer-input-card-holder-name>`;

      case 'submit':
        const submitAttrs = buildAttributes(
          {
            buttonText: {
              value: component.buttonText,
              defaultKey: 'buttonText',
            },
          },
          defaults,
        );
        return `<primer-card-form-submit${submitAttrs ? ' ' + submitAttrs : ''}></primer-card-form-submit>`;

      default:
        return '<!-- Unknown component -->';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <Icon icon='mdi:target' width='20' height='20' />
          Interactive Card Form Layout Builder
        </h4>
        <p className={styles.description}>
          Drag components from the palette into rows, reorder them, and see the
          generated HTML code
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.layout}>
          {/* Top Section: Builder and Palette side by side */}
          <div
            className={`${styles.topSection} ${isWideScreen ? styles.wideScreen : styles.narrowScreen}`}
          >
            <div className={styles.builderSection}>
              <h4 className={styles.sectionTitle}>
                <Icon icon='mdi:hammer-wrench' width='20' height='20' />
                Layout Builder
              </h4>
              <div className={styles.builderArea}>
                {layout.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>
                      <Icon
                        icon='mdi:clipboard-outline'
                        width='48'
                        height='48'
                      />
                    </div>
                    <div>
                      <div className={styles.emptyStateTitle}>
                        Start Building Your Card Form
                      </div>
                      <div className={styles.emptyStateHint}>
                        Add a row below, then drag components from the palette
                      </div>
                    </div>
                  </div>
                ) : (
                  <SortableContext
                    items={layout.map((row) => row.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {layout.map((row) => (
                      <DroppableRow
                        key={row.id}
                        row={row}
                        onRemove={() => removeRow(row.id)}
                        onRemoveComponent={removeComponentFromRow}
                        onConfigureComponent={configureComponent}
                        justAdded={justAdded}
                      />
                    ))}
                  </SortableContext>
                )}
              </div>

              <div className={styles.actions}>
                <button onClick={addRow} className={styles.addButton}>
                  <Icon icon='mdi:plus' width='18' height='18' />
                  Add Row
                </button>
                {layout.length > 0 && (
                  <button
                    onClick={() => {
                      setLayout([]);
                      setAvailableComponents(components);
                    }}
                    className={styles.clearButton}
                  >
                    <Icon icon='mdi:delete' width='18' height='18' />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div className={styles.paletteSection}>
              <h4 className={styles.sectionTitle}>
                <Icon icon='mdi:puzzle' width='20' height='20' />
                Component Palette
              </h4>
              <div className={styles.paletteHint}>
                <Icon icon='mdi:lightbulb-outline' width='18' height='18' />
                Drag these components into the rows above
              </div>
              <SortableContext
                items={availableComponents.map((c) => `palette-${c.id}`)}
                strategy={verticalListSortingStrategy}
              >
                <div className={styles.paletteComponents}>
                  {availableComponents.map((component) => (
                    <DraggablePaletteComponent
                      key={component.id}
                      component={component}
                      onAddToRow={addComponentToRow}
                      availableRows={layout}
                    />
                  ))}
                </div>
              </SortableContext>

              {layout.length === 0 && (
                <div className={styles.warning}>
                  <Icon icon='mdi:alert' width='18' height='18' />
                  Add at least one row to start placing components
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: Generated Code (full width) */}
          <div className={styles.codeSection}>
            <h4 className={styles.sectionTitle}>
              <Icon icon='mdi:code-tags' width='20' height='20' />
              Generated HTML Code
            </h4>
            <div className={styles.codeBlock}>
              <CodeBlock language='html'>{generateCode()}</CodeBlock>
            </div>
          </div>
        </div>

        <DragOverlay dropAnimation={successfulDrop ? null : undefined}>
          {activeId && !successfulDrop ? (
            <div className={styles.dragOverlay}>
              {activeId.startsWith('palette-') ? (
                availableComponents.find((c) => `palette-${c.id}` === activeId)
                  ?.label
              ) : activeId.startsWith('row-') ? (
                <div className={styles.dragOverlayRow}>
                  <Icon icon='mdi:clipboard-outline' width='18' height='18' />
                  Row
                </div>
              ) : (
                layout
                  .find((row) => row.components.some((c) => c.id === activeId))
                  ?.components.find((c) => c.id === activeId)?.label
              )}
            </div>
          ) : null}
        </DragOverlay>

        {/* Configuration Modal */}
        {configuring && (
          <ComponentConfigModal
            component={selectedComponent}
            onUpdate={updateComponent}
            onClose={() => {
              setConfiguring(false);
              setSelectedComponent(null);
            }}
          />
        )}
      </DndContext>
    </div>
  );
}
