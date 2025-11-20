'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-neutral-200">
        <p className="text-sm font-semibold text-neutral-950">{payload[0].name}</p>
        <p className="text-sm text-neutral-600">{payload[0].value} responses</p>
      </div>
    );
  }
  return null;
};

// Sentiment Distribution Donut Chart
export function SentimentChart({ data }: { data: { sentiment: string; count: number }[] }) {
  const COLORS = {
    POSITIVE: '#059669',
    NEUTRAL: '#eab308', 
    NEGATIVE: '#dc2626',
  };

  const chartData = data.map((item) => ({
    name: item.sentiment.charAt(0) + item.sentiment.slice(1).toLowerCase(),
    value: item.count,
    color: COLORS[item.sentiment as keyof typeof COLORS],
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-3xl font-semibold text-neutral-950">{total}</div>
          <div className="text-xs text-neutral-500">Total</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-neutral-600">{item.name}</span>
            <span className="text-sm font-semibold text-neutral-950">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Theme Distribution Bar Chart
export function ThemeChart({ data }: { data: { theme: string; count: number; percentage: number }[] }) {
  const chartData = data.map((item) => ({
    name: item.theme.length > 30 ? item.theme.substring(0, 30) + '...' : item.theme,
    fullName: item.theme,
    responses: item.count,
    percentage: item.percentage,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 60)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" horizontal={true} vertical={false} />
        <XAxis type="number" stroke="#a3a3a3" tick={{ fontSize: 12 }} />
        <YAxis 
          dataKey="name" 
          type="category" 
          width={200} 
          stroke="#a3a3a3" 
          tick={{ fontSize: 13 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-neutral-200">
                  <p className="text-sm font-semibold text-neutral-950 mb-1">{payload[0].payload.fullName}</p>
                  <p className="text-sm text-neutral-600">{payload[0].value} responses ({payload[0].payload.percentage}%)</p>
                </div>
              );
            }
            return null;
          }}
        />
        <Bar dataKey="responses" fill="#2563eb" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Quality Gauge Component
export function QualityGauge({ score, context }: { score: number; context: string }) {
  // Calculate percentage for the gauge (0-100)
  const percentage = (score / 10) * 100;
  
  // Determine color based on score
  const getColor = () => {
    if (score >= 7) return '#059669'; // Green
    if (score >= 5) return '#eab308'; // Yellow
    return '#dc2626'; // Red
  };

  const color = getColor();
  
  // SVG arc calculation for semi-circle
  const radius = 90;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-64 h-32">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#f5f5f5"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <div className="text-4xl font-semibold text-neutral-950">{score.toFixed(1)}</div>
          <div className="text-sm text-neutral-500">out of 10</div>
        </div>
      </div>
      <p className="text-sm text-neutral-600 mt-4 text-center max-w-xs">{context}</p>
    </div>
  );
}


