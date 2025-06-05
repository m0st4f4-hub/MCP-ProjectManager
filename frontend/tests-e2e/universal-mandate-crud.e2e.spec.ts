import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

test.describe('Universal Mandate CRUD', () => {
  let mandateId: string;

  test('should create, update and delete a universal mandate via API', async ({ request }) => {
    const createRes = await request.post(`${API_BASE_URL}/api/rules/mandates`, {
      data: { title: 'E2E Mandate', description: 'created by e2e', priority: 5 }
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    mandateId = created.data?.id || created.id;
    expect(mandateId).toBeTruthy();

    const updateRes = await request.put(`${API_BASE_URL}/api/rules/mandates/${mandateId}`, {
      data: { description: 'updated by e2e' }
    });
    expect(updateRes.ok()).toBeTruthy();

    const deleteRes = await request.delete(`${API_BASE_URL}/api/rules/mandates/${mandateId}`);
    expect(deleteRes.status()).toBeLessThan(300);
  });
});
