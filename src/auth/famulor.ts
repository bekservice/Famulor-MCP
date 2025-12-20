/**
 * Famulor API Client
 *
 * Handles authentication and HTTP requests to the Famulor API
 *
 * IMPORTANT: Each user must provide their own API key.
 * The API key should be obtained from the user via MCP config,
 * not from environment variables.
 */

export class FamulorClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = 'https://app.famulor.de') {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Famulor API key is required. Please configure your API key in the app settings.');
    }
    this.apiKey = apiKey.trim();
    this.baseUrl = baseUrl;
  }

  /**
   * Make an authenticated request to the Famulor API
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Famulor API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

