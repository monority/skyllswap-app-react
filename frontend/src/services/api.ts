const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

class ApiService {
  private baseUrl: string;
  private csrfToken: string | null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.csrfToken = null;
  }

  setCsrfToken(token: string | null): void {
    this.csrfToken = token;
  }

  clearCsrfToken(): void {
    this.csrfToken = null;
  }

  async request(path: string, options: RequestInit = {}): Promise<Response> {
    const method = options.method?.toUpperCase();
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(
      method || ''
    );

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (isMutation && this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken;
    }

    const config: RequestInit = {
      ...options,
      credentials: 'include',
      headers,
    };

    const response = await fetch(`${this.baseUrl}${path}`, config);
    return response;
  }

  async get(path: string): Promise<Response> {
    return this.request(path);
  }

  async post(
    path: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<Response> {
    return this.request(path, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
      body: JSON.stringify(body),
    });
  }

  async put(
    path: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<Response> {
    return this.request(path, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
      body: JSON.stringify(body),
    });
  }

  async delete(path: string, options: RequestInit = {}): Promise<Response> {
    return this.request(path, {
      ...options,
      method: 'DELETE',
    });
  }

  async json<T = unknown>(
    path: string,
    options: RequestInit = {}
  ): Promise<{ response: Response; data: T }> {
    const response = await this.request(path, options);
    const data = (await response.json()) as T;
    return { response, data };
  }

  async postJson<T = unknown>(
    path: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<{ response: Response; data: T }> {
    const response = await this.post(path, body, options);
    const data = (await response.json()) as T;
    return { response, data };
  }

  async putJson<T = unknown>(
    path: string,
    body: unknown,
    options: RequestInit = {}
  ): Promise<{ response: Response; data: T }> {
    const response = await this.put(path, body, options);
    const data = (await response.json()) as T;
    return { response, data };
  }
}

export const apiService = new ApiService(API_BASE_URL);
export { API_BASE_URL };
