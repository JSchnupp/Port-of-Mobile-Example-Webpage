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
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  tooltipFormatter = (value) => value.toString(),
  colorBlindMode = false,
}) => {
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
          tickFormatter={(value) => {
            if (typeof value === "string") {
              return value;
            }
            return new Date(value).toLocaleDateString();
          }}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${Math.round(value)}%`}
          domain={[0, 100]}
        />
        <Tooltip
          formatter={(value) => tooltipFormatter(Math.round(value as number))}
          labelFormatter={(label) => {
            if (typeof label === "string") {
              return label;
            }
            return new Date(label).toLocaleDateString();
          }}
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