export function formatValuesToString(value: unknown): string {
  switch (typeof value) {
    case 'string':
      return value;
    case 'number':
      return value.toString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'undefined':
      return 'N/A';
    case 'object':
      return value === null ? 'null' : JSON.stringify(value);
    case 'function':
      return 'Function';
    case 'symbol':
      return value.toString();
    case 'bigint':
      return value.toString() + 'n';
    default:
      return 'Invalid value';
  }
}
