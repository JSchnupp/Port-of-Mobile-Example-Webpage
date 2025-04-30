'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  xAxisKey: string;
  yAxisKey: string;
  tooltipFormatter?: (value: number) => string;
  colorBlindMode?: boolean;
  timeRange?: "day" | "week" | "month" | "year" | "custom";
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  tooltipFormatter = (value) => value.toString(),
  colorBlindMode = false,
  timeRange = "day",
}) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    if (timeRange === "day") {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === "week") {
      return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    } else if (timeRange === "month") {
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } else if (timeRange === "year") {
      return d.toLocaleDateString([], { month: 'short' });
    }
    return d.toLocaleDateString();
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickFormatter={formatDate}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${Math.round(value)}%`}
          domain={[0, 100]}
        />
        <Tooltip
          formatter={(value) => tooltipFormatter(Math.round(value as number))}
          labelFormatter={(label) => formatDate(label as string)}
        />
        <Line
          type="monotone"
          dataKey={yAxisKey}
          stroke={colorBlindMode ? "#2563eb" : "#22c55e"}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 8 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}; 