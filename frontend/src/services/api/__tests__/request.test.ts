import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/__tests__/mocks/server';
import { request, ApiError, NetworkError } from '../request';

const API_URL = 'http://localhost:8000/test-endpoint';

describe('request helper', () => {
  it('throws NetworkError on fetch failure', async () => {
    server.use(
      http.get(API_URL, () => {
        throw new Error('connection lost');
      })
    );

    await expect(request(API_URL)).rejects.toMatchObject({
      name: 'NetworkError',
      message: 'connection lost',
      url: API_URL,
      status: 0,
    });
  });

  it('throws ApiError for non-JSON success response', async () => {
    server.use(
      http.get(API_URL, () =>
        new HttpResponse('plain text', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        })
      )
    );

    await expect(request(API_URL)).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid JSON response',
      status: 200,
      url: API_URL,
    });
  });
});
