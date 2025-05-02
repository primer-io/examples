export interface ClientTokenSuccessResponse {
  clientToken: string;
  success: true;
}

export interface ClientTokenErrorResponse {
  error: string;
  success: false;
}

export type ClientTokenResponse =
  | ClientTokenSuccessResponse
  | ClientTokenErrorResponse;

/**
 * Fetches a client token from the API
 * @param apiKey The API key to use for authorization
 * @param example Optional example parameter
 * @returns The client token response
 */
export async function fetchClientToken(
  apiKey: string,
  example?: string
): Promise<ClientTokenResponse> {
  try {
    // Build the URL with query parameters
    const url = new URL(
      'api/examples',
      'https://sdk-demo.primer.io'
    );

    // Add example parameter if provided
    if (example) {
      url.searchParams.append('example', example);
    }

    // Make the request
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Parse the response
    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to fetch client token',
        success: false,
      };
    }

    return data as ClientTokenResponse;
  } catch (error) {
    console.error('Error fetching client token:', error);

    return {
      error: 'An unexpected error occurred',
      success: false,
    };
  }
}
