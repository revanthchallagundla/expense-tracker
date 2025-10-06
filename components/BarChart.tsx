'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Avoid colliding with TS utility type `Record`
interface ExpenseRecord {
  date: string;    // ISO date string
  amount: number;  // Amount spent
  category: string;// Expense category
}

type Props = { records: ExpenseRecord[] };

const BarChart = ({ records }: Props) => {
  // --- Dark mode detection without a theme provider ---
  const [isDark, setIsDark] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(1024);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    // 1) Detect dark via class or prefers-color-scheme
    const hasDarkClass =
      document.documentElement.classList.contains('dark');
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    setIsDark(hasDarkClass || mq?.matches === true);

    const onThemeChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq?.addEventListener?.('change', onThemeChange);

    // 2) Track width for mobile tweaks
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);

    return () => {
      mq?.removeEventListener?.('change', onThemeChange);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const isMobile = windowWidth < 640;

  // --- Aggregate by UTC date (YYYY-MM-DD) to avoid TZ issues ---
  const aggregated = useMemo(() => {
    const map = new Map<
      string,
      { total: number; categories: Set<string>; firstIso: string }
    >();

    for (const r of records) {
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) continue; // skip bad dates

      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const key = `${y}-${m}-${day}`;

      const existing = map.get(key);
      if (existing) {
        existing.total += r.amount;
        existing.categories.add(r.category || 'Uncategorized');
      } else {
        map.set(key, {
          total: r.amount,
          categories: new Set([r.category || 'Uncategorized']),
          firstIso: r.date,
        });
      }
    }

    // sort chronologically by the first ISO we saw for that day
    return Array.from(map.entries())
      .map(([dateKey, v]) => ({
        dateKey, // YYYY-MM-DD
        amount: v.total,
        categories: Array.from(v.categories),
        sortTs: new Date(v.firstIso).getTime(),
      }))
      .sort((a, b) => a.sortTs - b.sortTs);
  }, [records]);

  // --- Color by amount with light/dark variants ---
  const getAmountColor = (amount: number) => {
    if (amount > 200) {
      return {
        bg: isDark ? 'rgba(255, 99, 132, 0.3)' : 'rgba(255, 99, 132, 0.2)',
        border: isDark ? 'rgba(255, 99, 132, 0.8)' : 'rgba(255, 99, 132, 1)',
      };
    }
    if (amount > 100) {
      return {
        bg: isDark ? 'rgba(255, 206, 86, 0.3)' : 'rgba(255, 206, 86, 0.2)',
        border: isDark ? 'rgba(255, 206, 86, 0.8)' : 'rgba(255, 206, 86, 1)',
      };
    }
    if (amount > 50) {
      return {
        bg: isDark ? 'rgba(54, 162, 235, 0.3)' : 'rgba(54, 162, 235, 0.2)',
        border: isDark ? 'rgba(54, 162, 235, 0.8)' : 'rgba(54, 162, 235, 1)',
      };
    }
    return {
      bg: isDark ? 'rgba(75, 192, 192, 0.3)' : 'rgba(75, 192, 192, 0.2)',
      border: isDark ? 'rgba(75, 192, 192, 0.8)' : 'rgba(75, 192, 192, 1)',
    };
  };

  // --- Labels as local MM/DD (or any format you prefer) ---
  const labelFmt = new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
  });

  const data: ChartData<'bar'> = {
    labels: aggregated.map((it) => {
      // Convert YYYY-MM-DD to a Date at noon UTC for stable display
      const [y, m, d] = it.dateKey.split('-').map((n) => parseInt(n, 10));
      const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      return labelFmt.format(dt);
    }),
    datasets: [
      {
        data: aggregated.map((it) => it.amount),
        backgroundColor: aggregated.map((it) => getAmountColor(it.amount).bg),
        borderColor: aggregated.map((it) => getAmountColor(it.amount).border),
        borderWidth: 1,
        borderRadius: 2,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#f9fafb' : '#1f2937',
        bodyColor: isDark ? '#d1d5db' : '#374151',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<'bar'>) => {
            const i = ctx.dataIndex;
            const item = aggregated[i];
            const cats = item?.categories?.length
              ? item.categories.join(', ')
              : 'Uncategorized';
            // Return multiple lines
            return [`Total: $${item.amount.toFixed(2)}`, `Categories: ${cats}`];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
          font: { size: isMobile ? 12 : 14, weight: 'bold' },
          color: isDark ? '#d1d5db' : '#2c3e50',
        },
        ticks: {
          font: { size: isMobile ? 10 : 12 },
          color: isDark ? '#9ca3af' : '#7f8c8d',
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)',
          font: { size: isMobile ? 12 : 16, weight: 'bold' },
          color: isDark ? '#d1d5db' : '#2c3e50',
        },
        ticks: {
          font: { size: isMobile ? 10 : 12 },
          color: isDark ? '#9ca3af' : '#7f8c8d',
          callback: (value) => `$${value}`,
        },
        grid: {
          color: isDark ? '#374151' : '#e0e0e0',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
