// An error whose message is safe to show the browser, with the status to send.
// Any other error, except a 4xx from the body parser, becomes a generic 502.
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
