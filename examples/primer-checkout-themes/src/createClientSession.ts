// The API key is exposed to the browser, so this is for local sandbox testing
// only. In production, create the client session on your server.

const session = {
  customerId: 'Customer-Examples',
  currencyCode: 'EUR',
  order: {
    shipping: {
      amount: 50,
      methodId: 'Regular',
      methodName: 'Regular 50',
      methodDescription: 'Regular',
    },
    countryCode: 'FR',
    lineItems: [
      {
        itemId: 'primer-hoodie-gray',
        description: 'Primer Hoodie',
        amount: 950,
        quantity: 1,
      },
    ],
  },
  customer: {
    billingAddress: { countryCode: 'FR' },
    shippingAddress: {},
    nationalDocumentId: '9011211234567',
  },
  paymentMethod: {
    vaultOnSuccess: false,
    vaultOn3DS: false,
    vaultOnAgreement: false,
    orderedAllowedCardNetworks: [
      'MASTERCARD',
      'CARTES_BANCAIRES',
      'VISA',
      'AMEX',
      'MAESTRO',
      'UNIONPAY',
      'DANKORT',
      'DINERS_CLUB',
      'DISCOVER',
      'ENROUTE',
      'ELO',
      'HIPER',
      'INTERAC',
      'JCB',
      'MIR',
      'OTHER',
    ],
  },
};

export async function createClientSession(): Promise<string> {
  const apiKey = import.meta.env.VITE_PRIMER_API_KEY;
  if (!apiKey) {
    throw new Error('Set VITE_PRIMER_API_KEY in .env. See README.md.');
  }

  const apiUrl =
    import.meta.env.VITE_PRIMER_API_URL || 'https://api.sandbox.primer.io';

  const response = await fetch(`${apiUrl}/client-session`, {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'X-Api-Version': '2.4',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...session, orderId: crypto.randomUUID() }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Each validation error lists its field errors under `errors`.
    const details = (data?.error?.validationErrors ?? [])
      .flatMap(
        (v: { errors?: { path?: string; description?: string }[] }) =>
          v.errors ?? [],
      )
      .map((e: { path?: string; description?: string }) =>
        [e.path, e.description].filter(Boolean).join(': '),
      )
      .join(' ');
    throw new Error(
      [data?.error?.description ?? `HTTP ${response.status}`, details]
        .filter(Boolean)
        .join(' '),
    );
  }

  if (typeof data.clientToken !== 'string') {
    throw new Error('The client session response has no clientToken.');
  }
  return data.clientToken;
}
