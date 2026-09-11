import rashiData from '@/data/rashi-nakshatra.json';
import RashiExplorer from '@/components/rashi-nakshatra/RashiExplorer';
import type { Rashi } from '@/types/astrology';

export const metadata = {
  title: 'Rashi • Nakshatra • Pada • Alphabet | Astro Study Tool',
  description: 'Study the relationship between 12 Rashis, 27 Nakshatras, 108 Padas and traditional name alphabets.',
};

export default function RashiNakshatraPage() {
  const data = rashiData.rashiData as Rashi[];

  return <main className="container-fluid tool-page rashi-nakshatra-page"><header className="rn-page-header"><div><div className="eyebrow">ASTRO STUDY / RASHI REFERENCE</div><h1 className="page-title">Rashi • Nakshatra • Pada • Alphabet</h1><p className="page-subtitle">12 राशी → 27 नक्षत्र → 108 पाद → Name Alphabet</p><p className="rn-description">राशीमध्ये कोणते नक्षत्र आणि कोणते पाद येतात हे एका स्क्रीनवर सहज समजेल.</p></div><nav className="breadcrumb-line" aria-label="Breadcrumb"><i className="bi bi-house" /> Astro Study <span>/</span> Rashi Nakshatra</nav></header><RashiExplorer data={data} /></main>;
}
