import { Button, Collapsible, Dialog, Icon } from '@primer-io/goat';
import { ChevronDown, ChevronUp } from '@primer-io/goat-icons';
import Form from '@rjsf/core';
import ObjectField from '@rjsf/core/lib/components/fields/ObjectField';
import {
  FieldProps,
  RegistryFieldsType,
  RJSFSchema,
  UiSchema,
} from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useRef, useState } from 'react';
import styles from './ConfigForm.module.scss';

const CustomObjectField = ({ name, ...props }: FieldProps) => {
  const [open, setOpen] = useState(false);

  if (!name) {
    return <ObjectField {...props} name='' />;
  }
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger variant='outlined'>
        <Icon as={open ? ChevronUp : ChevronDown} />
        {name}
      </Collapsible.Trigger>
      <Collapsible.Content className={styles.collapsibleContent}>
        <ObjectField {...props} name='' />
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
const customFields: RegistryFieldsType = { ObjectField: CustomObjectField };

interface ConfigFormProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  value?: T;
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  onSubmit: (value: T) => void;
  strings: {
    trigger: string;
    header: string;
  };
}

export function ConfigForm<T extends Record<string, unknown>>({
  value,
  schema,
  onSubmit,
  uiSchema = {},
  strings,
}: ConfigFormProps<T>) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<Form<T>>(null);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>{strings.trigger}</Dialog.Trigger>
      <Dialog.Content closeLabel='Close' size='large'>
        <Dialog.Header>{strings.header}</Dialog.Header>
        <Dialog.Body>
          <Form
            formData={value}
            ref={formRef}
            schema={schema}
            validator={validator}
            experimental_defaultFormStateBehavior={{
              arrayMinItems: { populate: 'requiredOnly' },
            }}
            uiSchema={uiSchema}
            liveValidate
            fields={customFields}
            onSubmit={({ formData }) => {
              onSubmit(formData);
              setOpen(false);
            }}
          >
            <div />
          </Form>
        </Dialog.Body>
        <Dialog.Footer>
          <Button
            onClick={() => {
              formRef.current?.submit();
            }}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
            }}
            variant='outlined'
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              formRef.current?.reset();
            }}
            variant='danger'
          >
            Reset
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}
