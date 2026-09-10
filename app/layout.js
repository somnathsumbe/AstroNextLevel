import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import './theme.css';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Footer from '@/components/layout/Footer';
import AuthGate from '@/components/AuthGate';

export const metadata = {
  title: 'AstroNextLevel | Astro Market Analysis',
  description: 'Astrology and market analysis application for studying planetary cycles and market movements.',
  icons: {
    icon: '/AstroNextLevel/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthGate>
          <Header />
          <div className="app-shell">
            <Sidebar />
            <main className="main-content">{children}</main>
          </div>
          <Footer />
        </AuthGate>
      </body>
    </html>
  );
}
