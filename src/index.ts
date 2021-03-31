export interface Configuration {
  url: string;
  params?: string;
}

export interface Credentials {
  client_id: string;
  client_secret: string;
}

export interface Encoded {
  access_token: string;
}

export interface Response<T> {
  encoded: Encoded;
  data: T;
}

export interface ResponseError {
  message: string;
}

export function extractDataFromJSON<T>(encoded: Encoded): T {
  const parts = encoded.access_token.split('.', 3);
  const payload = atob(parts[1]);
  return JSON.parse(payload);
}

export async function request<T>(configuration: Configuration, credentials: Credentials): Promise<Response<T>> {
  if (!configuration.url) return Promise.reject('JWTCLI: missing URL');
  if (!credentials.client_id) return Promise.reject('JWTCLI: missing client id');
  if (!credentials.client_secret) return Promise.reject('JWTCLI: missing client secret');
  let headers: HeadersInit = { 'Content-Type': 'application/json' };
  try {
    const response = await fetch(configuration.url + (configuration.params ? '?' + configuration.params : ''), {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials),
    });
    const content = await response.text();
    const json = JSON.parse(content);
    if (!response.ok) return Promise.reject(json);
    const encoded = json as Encoded;
    return { encoded, data: extractDataFromJSON<T>(encoded) };
  } catch (error) {
    return Promise.reject({ message: error.message } as ResponseError);
  }
}
