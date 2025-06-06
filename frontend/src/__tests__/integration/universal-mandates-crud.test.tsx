import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import UniversalMandatesTable from '@/components/mandate/UniversalMandatesTable';
import {
  createMockUniversalMandate,
  createMockUniversalMandates,
} from '@/__tests__/factories';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

describe('Universal Mandates CRUD flows', () => {
  it('handles create, update, and delete operations', async () => {
    const mandates = createMockUniversalMandates(1);
    const [first] = mandates;

    server.use(
      http.get(new RegExp(`${API_BASE_URL}/api/rules/mandates.*`), () =>
        HttpResponse.json({ data: mandates, total: mandates.length, page: 1, pageSize: mandates.length })
      ),
      http.post(`${API_BASE_URL}/api/rules/mandates`, async ({ request }) => {
        const body = await request.json();
        const newMandate = createMockUniversalMandate({ ...body, id: 'new-id' });
        mandates.push(newMandate);
        return HttpResponse.json({ data: newMandate });
      }),
      http.put(`${API_BASE_URL}/api/rules/mandates/${first.id}`, async ({ request }) => {
        const body = await request.json();
        Object.assign(first, body);
        return HttpResponse.json({ data: first });
      }),
      http.delete(`${API_BASE_URL}/api/rules/mandates/${first.id}`, () => new HttpResponse(null, { status: 204 }))
    );

    render(<UniversalMandatesTable />);

    await screen.findByText(first.title);

    fireEvent.click(screen.getByRole('button', { name: /new mandate/i }));
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Created' } });
    fireEvent.change(screen.getByLabelText(/content/i), { target: { value: 'Content' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await screen.findByText('Created');

    fireEvent.click(screen.getAllByRole('button', { name: /edit/i })[0]);
    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: 'Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    await screen.findByText('Updated');

    fireEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /^delete$/i }));
    await waitFor(() => expect(screen.queryByText('Updated')).not.toBeInTheDocument());
  });
});
