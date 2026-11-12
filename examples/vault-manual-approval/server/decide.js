import { config } from './config.js';

// Your routing rule goes here. It receives only the attempt id and the token
// string. To route on card network, amount, currency or processor health, pass
// that data in (amount and currency are in config; the SDK event's
// paymentMethodToken.paymentInstrumentData has the card network). Return
// "stripe" or "primer"; the rest of the flow does not change.
export function decide({
  paymentAttemptId,
  paymentMethodToken,
  requestedRoute,
}) {
  if (
    config.routeOverrideAllowed &&
    (requestedRoute === 'stripe' || requestedRoute === 'primer')
  ) {
    return requestedRoute;
  }
  return config.route;
}
