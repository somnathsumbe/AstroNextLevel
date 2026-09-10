import amavasyaData from '@/data/amavasya.json';
import purnimaData from '@/data/purnima.json';
import marchEquinox from '@/data/march-equinox.json';
import bhadraData from '@/data/bhadra-dosh.json';
import panchakData from '@/data/panchak.json';
import mangalData from '@/data/mangal-gochar.json';
import shukraData from '@/data/shukra-gochar.json';
import weeklyData from '@/data/weekly-market-tracking.json';
import { buildDegreeResults, dateInputValue, formatDate, parseUtcDate } from '@/lib/degree-utils';
import { buildBhadraRecord } from '@/lib/bhadra-utils';
import { buildPanchakRow } from '@/lib/panchak-utils';
import { buildMangalRow } from '@/lib/mangal-utils';
import { buildShukraRow } from '@/lib/shukra-utils';
import { buildMarketRow } from '@/lib/weekly-market-utils';

function eventDateFromAmavasya(value) {
  return String(value).slice(0, 10);
}

function purnimaDateKey(value) {
  const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return '';
  return dateInputValue(new Date(Date.UTC(Number(match[3]), new Date(`${match[1]} 1, 2000`).getUTCMonth(), Number(match[2]))));
}

function getDefaultZeroDate() {
  const supplied = marchEquinox.entries.find((entry) => entry.year === 2026) || marchEquinox.entries[0];
  const [day, month] = supplied.date.split(' ');
  const monthNumber = new Date(`${month} 1, ${supplied.year} UTC`).getUTCMonth() + 1;
  return `${supplied.year}-${String(monthNumber).padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export function getPurnimaEvents() {
  return Object.entries(purnimaData.years || {}).flatMap(([year, entries]) => entries.map((entry, index) => {
    const eventDate = purnimaDateKey(entry.date);
    return {
      id: `purnima-${year}-${eventDate}-${index}`,
      type: 'PURNIMA',
      title: entry.name,
      shortTitle: 'Purnima Today',
      eventDate,
      displayDate: eventDate,
      description: `${entry.name} calendar event`,
      sourcePage: 'Purnima',
      route: '/purnima',
      icon: 'bi-moon-stars',
      priority: 'MEDIUM',
    };
  }));
}

export function getAmavasyaEvents() {
  return (amavasyaData.years || []).flatMap((yearData) => (yearData.entries || []).map((entry, index) => {
    const eventDate = eventDateFromAmavasya(entry.start);
    return {
      id: `amavasya-${yearData.year}-${eventDate}-${index}`,
      type: 'AMAVASYA',
      title: 'Amavasya',
      shortTitle: 'Amavasya Today',
      eventDate,
      displayDate: eventDate,
      description: entry.festival ? `Amavasya · ${Array.isArray(entry.festival) ? entry.festival.join(', ') : entry.festival}` : 'Amavasya calendar event',
      sourcePage: 'Amavasya',
      route: '/amavasya',
      icon: 'bi-moon',
      priority: 'MEDIUM',
    };
  }));
}

export function getDegreeEvents() {
  const zeroDate = parseUtcDate(getDefaultZeroDate());
  return buildDegreeResults(zeroDate).map((row) => ({
    id: `degree-${row.targetDegree}-${dateInputValue(row.calendarDate)}`,
    type: 'DEGREE',
    title: `${row.targetDegree}° Degree`,
    shortTitle: `${row.targetDegree}°`,
    eventDate: dateInputValue(row.calendarDate),
    displayDate: formatDate(row.calendarDate),
    description: 'Calculated Degree Date',
    degree: row.targetDegree,
    actualDegree: row.actualDegree,
    marketStatus: row.marketStatus,
    sourcePage: 'Degree Calculator',
    route: '/degree-calculator',
    icon: 'bi-bullseye',
    priority: 'HIGH',
  }));
}

export function getBhadraEvents() {
  return (bhadraData.records || []).map((record, index) => {
    const parsed = buildBhadraRecord(record, index);
    return {
      id: parsed.id,
      type: 'BHADRA',
      title: 'Bhadra Kaal',
      shortTitle: 'Bhadra Kaal Today',
      eventDate: parsed.eventDate,
      displayDate: parsed.startDate,
      description: `Start: ${parsed.startTime} · End: ${parsed.endTime}`,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      sourcePage: 'Bhadra Kaal',
      route: '/bhadra-kaal',
      icon: 'bi-fire',
      priority: 'HIGH',
    };
  });
}

export function getPanchakEvents() {
  return panchakData.map((entry, index) => {
    const row = buildPanchakRow(entry, index);
    return {
      id: `panchak-${entry.year}-${row.startDateKey}-${index}`,
      type: 'PANCHAK',
      title: 'Panchak',
      shortTitle: 'Panchak Today',
      eventDate: row.startDateKey,
      displayDate: row.startDateFormatted,
      description: `Start: ${row.startTimeFormatted} · End: ${row.endTimeFormatted}`,
      startTime: row.startTimeFormatted,
      endTime: row.endTimeFormatted,
      sourcePage: 'Panchak',
      route: '/panchak',
      icon: 'bi-calendar2-event',
      priority: 'HIGH',
    };
  });
}

export function getMangalEvents() {
  return mangalData.flatMap((yearData) => yearData.events.map((event, index) => {
    const row = buildMangalRow(yearData.year, event, index);
    return {
      id: `mangal-${yearData.year}-${event.date}-${index}`,
      type: 'MANGAL_GOCHAR',
      title: 'Mangal Gochar',
      shortTitle: 'Mangal Gochar Today',
      eventDate: event.date,
      displayDate: row.dateLabel,
      description: `${row.eventLabel} ${row.rashi} · ${row.time}`,
      startTime: row.time,
      endTime: row.time,
      sourcePage: 'Mangal Gochar',
      route: '/mangal-gochar',
      icon: 'bi-fire',
      priority: 'MEDIUM',
    };
  }));
}

export function getShukraEvents() {
  return Object.entries(shukraData.gochar || {}).flatMap(([year, events]) => events.map((event, index) => {
    const row = buildShukraRow(Number(year), event, index);
    return {
      id: `shukra-${year}-${event.date}-${index}`,
      type: 'CUSTOM',
      title: 'Shukra Gochar',
      shortTitle: 'Shukra Gochar Today',
      eventDate: event.date,
      displayDate: row.dateLabel,
      description: `${row.eventLabel} ${row.rashi} · ${row.time}`,
      startTime: row.time,
      endTime: row.time,
      sourcePage: 'Shukra Gochar',
      route: '/shukra-gochar',
      icon: 'bi-gem',
      priority: 'MEDIUM',
    };
  }));
}

export function getWeeklyMarketEvents() {
  return weeklyData.flatMap((yearData) => yearData.events.map((event, index) => {
    const row = buildMarketRow(yearData.year, event, index);
    return {
      id: `weekly-degree-${yearData.year}-${event.crossingDate}-${index}`,
      type: 'DEGREE',
      title: `${event.targetDegree}° Degree Crossing`,
      shortTitle: `${event.targetDegree}° Crossing Today`,
      eventDate: event.crossingDate,
      displayDate: row.dateLabel,
      description: 'Jupiter/Venus degree crossing observation',
      degree: event.targetDegree,
      actualDegree: event.observedDegree,
      sourcePage: 'Jupiter Venus Tracking',
      route: '/jupiter-venus-tracking',
      icon: 'bi-bullseye',
      priority: 'HIGH',
    };
  }));
}

export function getAstroEvents() {
  return [...getPurnimaEvents(), ...getAmavasyaEvents(), ...getDegreeEvents(), ...getBhadraEvents(), ...getPanchakEvents(), ...getMangalEvents(), ...getShukraEvents(), ...getWeeklyMarketEvents()];
}
