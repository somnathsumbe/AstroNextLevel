import ReversalDashboard from '@/components/reversal/ReversalDashboard';

export const metadata = {
  title: 'Reversal Time | Astro Market Analysis',
  description: 'Study historical planetary reversal times, degrees and trade times.',
};

export default function ReversalTimePage() {
  return <ReversalDashboard />;
}
