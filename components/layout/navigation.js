export const navigation = [
  {
    title: 'Main',
    icon: 'bi-grid-1x2',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: 'bi-grid-1x2-fill' },
      { label: 'Profile', href: '/profile', icon: 'bi-person-circle' },
    ],
  },
  {
    title: 'Lunar & Calendar',
    icon: 'bi-calendar3',
    items: [
      { label: 'Amavasya', href: '/amavasya', icon: 'bi-moon' },
      { label: 'Purnima', href: '/purnima', icon: 'bi-moon-stars' },
      { label: 'Bhadra Kaal', href: '/bhadra-kaal', icon: 'bi-exclamation-triangle' },
    ],
  },
  {
    title: 'Planetary Analysis',
    icon: 'bi-stars',
    items: [
      { label: 'Mangal Gochar', href: '/mangal-gochar', icon: 'bi-fire' },
      { label: 'Panchak', href: '/panchak', icon: 'bi-calendar2-event' },
      { label: 'Pushya Nakshatra', href: '/pushya-nakshatra', icon: 'bi-star' },
      { label: 'Shukra Gochar', href: '/shukra-gochar', icon: 'bi-gem' },
      { label: 'Sun-Jupiter Tracking', href: '/sun-jupiter-tracking', icon: 'bi-sun' },
      { label: 'Jupiter Venus Tracking', href: '/jupiter-venus-tracking', icon: 'bi-circle' },
      { label: 'Grah Past Records', href: '/grah-past-records', icon: 'bi-clock-history' },
      { label: 'Reversal Time', href: '/reversal-time', icon: 'bi-arrow-repeat' },
      { label: 'Rashi Nakshatra', href: '/rashi-nakshatra', icon: 'bi-diagram-3' },
    ],
  },
  {
    title: 'Market Analysis',
    icon: 'bi-graph-up-arrow',
    items: [
      { label: 'Degree Calculator', href: '/degree-calculator', icon: 'bi-bullseye' },
      { label: 'Gann Pressure Generator', href: '/market-analysis/stock-gann-pressure', icon: 'bi-lightning-charge' },
      { label: 'Today Stock', href: '/today-stock', icon: 'bi-bar-chart-line' },
      { label: 'Stocks Times', href: '/stocks-times', icon: 'bi-clock' },
      { label: 'Stock Backtesting', href: '/stock-backtesting', icon: 'bi-clipboard-data' },
    ],
  },
];

export function getActiveNavigationSection(pathname) {
  return navigation.find((section) => section.items.some((item) => item.href === pathname))?.title || null;
}