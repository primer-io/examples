import { getHeaders } from './headers.ts';

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public url: RequestInfo | URL,
    public payload: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export const get = <T>(url: RequestInfo, init?: Omit<RequestInit, 'method'>) =>
  request<T>(url, init);

export const put = <T>(url: RequestInfo, init?: Omit<RequestInit, 'method'>) =>
  request<T>(url, {
    ...init,
    method: 'PUT',
  });

export const post = <T>(url: RequestInfo, init?: Omit<RequestInit, 'method'>) =>
  request<T>(url, {
    ...init,
    method: 'POST',
  });

export const del = <T>(url: RequestInfo, init?: Omit<RequestInit, 'method'>) =>
  request<T>(url, { ...init, method: 'DELETE' });

export const patch = <T>(
  url: RequestInfo,
  init?: Omit<RequestInit, 'method'>,
) =>
  request<T>(url, {
    ...init,
    method: 'PATCH',
  });

async function request<T>(url: RequestInfo, init?: RequestInit): Promise<T> {
  const requestUrl = typeof url === 'string' ? url : url.url;

  const results = await fetch(url, {
    ...init,
    headers: getHeaders({
      init,
    }),
  });

  /**
   * If we need to handle other content types, we can add them here or create new functions.
   */
  const contentType = results.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  const isBlob = contentType?.includes('application/octet-stream');
  const isText = contentType?.includes('text/');

  const data = isJson
    ? await results.json()
    : isText
      ? await results.text()
      : isBlob
        ? await results.blob()
        : results;

  if (!results.ok) {
    //Legacy error messages
    const errorObject = isJson ? data?.error ?? data : null;
    const message = errorObject
      ? JSON.stringify(errorObject)
      : `${requestUrl} ${init?.method ?? 'GET'} failed, ${results.statusText}`;

    throw new FetchError(message, results.status, requestUrl, data);
  }

  return data;
}
