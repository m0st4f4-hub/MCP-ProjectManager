export const metricsApi = {
  raw: async (): Promise<string> => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const res = await fetch(`${base}/metrics`);
    if (!res.ok) {
      throw new Error('Failed to fetch metrics');
    }
    return res.text();
  },
};
