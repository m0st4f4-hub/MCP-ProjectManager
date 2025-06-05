import dynamic from 'next/dynamic';
const MCPMetrics = dynamic(() => import('@/components/MCPMetrics'));

export default function MCPMetricsPage() {
  return <MCPMetrics />;
}
