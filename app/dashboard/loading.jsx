import Skeleton from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return <div className="dashboard-page astro-dashboard dashboard-loading" aria-label="Loading dashboard" role="status">
    <div className="dashboard-live-header"><div><Skeleton width="150px" height="10px" /><Skeleton className="mt-3" width="300px" height="32px" /><Skeleton className="mt-2" width="240px" height="12px" /></div><Skeleton width="145px" height="18px" /></div>
    <div className="dashboard-loading-grid"><Skeleton height="190px" /><Skeleton height="120px" /><Skeleton height="240px" /></div>
  </div>;
}