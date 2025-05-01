'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarehouseStatus } from "@/types/database";
import { TimeFilter } from "../filters/TimeFilter";
import { LineChart } from "../charts/LineChart";
import { cn } from "@/lib/utils";

interface UtilizationStats {
  totalSections: number;
  occupiedSections: number;
  availableSections: number;
  statusBreakdown: {
    [key in WarehouseStatus]: number;
  };
  historicalData?: {
    date: string;
    utilization: number;
  }[];
}

interface Warehouse {
  letter: string;
  name: string;
  type: 'all' | 'indoor' | 'outdoor';
}

interface WarehouseDashboardProps {
  stats: UtilizationStats;
  currentWarehouse?: string;
  colorBlindMode?: boolean;
}

const CustomProgress = ({ value, colorBlindMode }: { value: number; colorBlindMode?: boolean }) => {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={cn(
          "h-full transition-all duration-300",
          colorBlindMode ? "bg-blue-500" : "bg-blue-500"
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({
  stats,
  currentWarehouse,
  colorBlindMode = false,
}) => {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year" | "custom">("day");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [historicalData, setHistoricalData] = useState<{ date: string; utilization: number }[]>([]);

  const utilizationPercentage = stats.totalSections > 0
    ? ((stats.totalSections - stats.availableSections) / stats.totalSections) * 100
    : 0;

  const utilizationText = `${stats.totalSections - stats.availableSections} of ${stats.totalSections} sections utilized`;

  useEffect(() => {
    // Use the actual utilization data from stats
    if (stats.historicalData) {
      setHistoricalData(stats.historicalData);
    }
  }, [stats.historicalData]);

  const handleTimeRangeChange = (range: "day" | "week" | "month" | "year" | "custom", start?: Date, end?: Date) => {
    setTimeRange(range);
    if (range === "custom" && start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const getStatusColor = (status: string) => {
    if (colorBlindMode) {
      return status === 'green' ? '#2563eb' : '#dc2626'; // Blue for occupied, Red for available
    }
    return status === 'green' ? '#22c55e' : '#ef4444'; // Green for occupied, Red for available
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Warehouse Utilization</h2>
        <TimeFilter onRangeChange={handleTimeRangeChange} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sections Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSections}</div>
            <p className="text-xs text-muted-foreground">
              Total available sections
            </p>
          </CardContent>
        </Card>

        {/* Utilization Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationPercentage.toFixed(1)}%</div>
            <CustomProgress value={utilizationPercentage} colorBlindMode={colorBlindMode} />
            <p className="text-xs text-muted-foreground mt-2">
              {utilizationText}
            </p>
          </CardContent>
        </Card>

        {/* Available Sections Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Sections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableSections}</div>
            <p className="text-xs text-muted-foreground">
              Sections ready for use
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Historical Utilization Chart */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Historical Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <LineChart
              data={historicalData.map(d => ({
                date: new Date(d.date).toISOString(),
                value: d.utilization
              }))}
              xAxisKey="date"
              yAxisKey="value"
              tooltipFormatter={(value) => `${value.toFixed(1)}% utilization`}
              colorBlindMode={colorBlindMode}
              timeRange={timeRange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: getStatusColor(status)
                }} />
                <div className="flex-1">
                  <div className="text-sm font-medium capitalize">{status}</div>
                  <div className="text-sm text-muted-foreground">{count} sections</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 