import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

test.describe('Universal Mandate CRUD API', () => {
  test('should create, read, update and delete a mandate', async ({ request }) => {
    const createRes = await request.post(`${API_BASE_URL}/api/rules/mandates`, {
      data: { title: 'E2E Mandate', content: 'Created via test', priority: 5 },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    const id = created.id || created.data?.id;
    expect(id).toBeTruthy();

    const listRes = await request.get(`${API_BASE_URL}/api/rules/mandates`);
    expect(listRes.ok()).toBeTruthy();

    const updateRes = await request.put(`${API_BASE_URL}/api/rules/mandates/${id}`, {
      data: { title: 'Updated E2E Mandate' },
    });
    expect(updateRes.ok()).toBeTruthy();

    const deleteRes = await request.delete(`${API_BASE_URL}/api/rules/mandates/${id}`);
    expect(deleteRes.status()).toBe(204);
  });
});
