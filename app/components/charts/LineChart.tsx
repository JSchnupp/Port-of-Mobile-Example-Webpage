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
  console.log("LineChart rendering with data:", { data, timeRange });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    switch (timeRange) {
      case "week":
        return d.toLocaleDateString([], { 
          weekday: 'short',
          month: 'short', 
          day: 'numeric'
        });
      case "month":
        return d.toLocaleDateString([], { 
          month: 'short', 
          day: 'numeric'
        });
      case "year":
        return d.toLocaleDateString([], { 
          month: 'short',
          year: 'numeric'
        });
      case "custom":
        return d.toLocaleDateString([], { 
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      default:
        return d.toLocaleDateString();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 25,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey={xAxisKey}
          tick={(props) => {
            const { x, y, payload } = props;
            return (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="end"
                  fill="#666"
                  transform="rotate(-45)"
                  style={{ fontSize: '12px' }}
                >
                  {formatDate(payload.value)}
                </text>
              </g>
            );
          }}
          interval={Math.max(Math.floor(data.length / 10), 1)}
          height={60}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <Tooltip
          formatter={(value) => tooltipFormatter(Math.round(value as number))}
          labelFormatter={formatDate}
        />
        <Line
          type="monotone"
          dataKey={yAxisKey}
          stroke={colorBlindMode ? "#2563eb" : "#22c55e"}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 8 }}
          connectNulls={true}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}; 