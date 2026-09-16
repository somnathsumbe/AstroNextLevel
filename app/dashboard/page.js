import { getDashboardData } from '@/lib/data/services/dashboard.service';
import TodayAstroEvents from '@/components/astrology/TodayAstroEvents';
import UpcomingAstroEvents from '@/components/astrology/UpcomingAstroEvents';
import AstroEventSummary from '@/components/astrology/AstroEventSummary';
import CurrentDayStock from '@/components/gann/CurrentDayStock';
import DashboardLunarSections from '@/components/dashboard/DashboardLunarSections';
import DashboardQuickActions from '@/components/dashboard/DashboardQuickActions';

export const dynamic = 'force-static';

function formatToday(date) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(date);
}

export default function DashboardPage() {
  const dashboard = getDashboardData(new Date());
  const currentMonthKey = `${dashboard.now.getFullYear()}-${String(dashboard.now.getMonth() + 1).padStart(2, '0')}`;
  const nextMonthDate = new Date(dashboard.now.getFullYear(), dashboard.now.getMonth() + 1, 1);
  const nextMonthKey = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`;

  return <div className="dashboard-page astro-dashboard">
    <section className="dashboard-live-header" aria-label="Live calendar status">
      <div className="dashboard-live-copy">
        <span className="dashboard-live-kicker"><span className="dashboard-live-dot" /> LIVE CALENDAR</span>
        <strong>ASIA-KOLKATA</strong>
        <h1>Astro Market Analytics</h1>
        <p>Astrology-based calendar &amp; market observation</p>
      </div>
      <div className="dashboard-live-date"><i className="bi bi-calendar3" /> <span>{formatToday(dashboard.now)}</span><small>India Standard Time</small></div>
    </section>

    <div className="dashboard-event-focus">
      <TodayAstroEvents events={dashboard.todayEvents} dateLabel={formatToday(dashboard.now)} />
      <AstroEventSummary events={dashboard.todayEvents} />
      <UpcomingAstroEvents events={dashboard.upcomingEvents} />
    </div>

    <section className="dashboard-secondary" aria-label="Market and lunar observations">
      <div className="dashboard-secondary-heading"><span className="eyebrow">REFERENCE DATA</span><span>Market &amp; lunar cycles</span></div>
      <DashboardLunarSections lunar={dashboard.lunar} currentMonthKey={currentMonthKey} nextMonthKey={nextMonthKey} />
      <CurrentDayStock />
      <DashboardQuickActions />
    </section>
  </div>;
}