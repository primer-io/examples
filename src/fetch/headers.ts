interface HeadersParams {
  init?: RequestInit;
}

export function getHeaders({ init = {} }: HeadersParams): Headers {
  const headers = new Headers(init.headers);

  const isFormData = init.body instanceof FormData;
  if (!isFormData) {
    if (!headers.has('Content-Type')) {
      headers.append('Content-Type', 'application/json');
    }
    headers.append('accept', '*/*');
  }

  return headers;
}
