/**
 * WarehouseDashboard Component
 * This component provides a comprehensive dashboard view of warehouse utilization statistics.
 * It displays current utilization, historical trends, and status breakdowns.
 */

'use client';

// Import necessary dependencies
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarehouseStatus } from "@/types/database";
import { TimeFilter } from "../filters/TimeFilter";
import { LineChart } from "../charts/LineChart";
import { cn } from "@/lib/utils";

/**
 * Interface for warehouse utilization statistics
 * @interface UtilizationStats
 * @property {number} totalSections - Total number of sections in the warehouse
 * @property {number} occupiedSections - Number of currently occupied sections
 * @property {number} availableSections - Number of available sections
 * @property {Object} statusBreakdown - Breakdown of sections by status
 * @property {Array} historicalData - Historical utilization data points
 */
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

/**
 * Interface for warehouse information
 * @interface Warehouse
 * @property {string} letter - Warehouse identifier
 * @property {string} name - Warehouse name
 * @property {string} type - Warehouse type (all/indoor/outdoor)
 */
interface Warehouse {
  letter: string;
  name: string;
  type: 'all' | 'indoor' | 'outdoor';
}

/**
 * Props interface for the WarehouseDashboard component
 * @interface WarehouseDashboardProps
 * @property {UtilizationStats} stats - Warehouse utilization statistics
 * @property {string} [currentWarehouse] - Currently selected warehouse
 * @property {boolean} [colorBlindMode] - Whether to use color-blind friendly colors
 * @property {Function} [onTimeRangeChange] - Callback for time range changes
 */
interface WarehouseDashboardProps {
  stats: UtilizationStats;
  currentWarehouse?: string;
  colorBlindMode?: boolean;
  onTimeRangeChange?: (range: "week" | "month" | "year" | "custom", startDate?: Date, endDate?: Date) => void;
}

/**
 * Custom progress bar component
 * @param {Object} props - Component props
 * @param {number} props.value - Current progress value (0-100)
 * @param {boolean} [props.colorBlindMode] - Whether to use color-blind friendly colors
 */
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

/**
 * WarehouseDashboard Component
 * 
 * @param {WarehouseDashboardProps} props - Component props
 * @returns {JSX.Element} A dashboard displaying warehouse utilization metrics
 * 
 * This component:
 * 1. Shows current warehouse view and time range
 * 2. Displays key metrics (total sections, utilization, available sections)
 * 3. Renders a historical utilization chart
 * 4. Provides a status breakdown of warehouse sections
 */
export const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({
  stats,
  currentWarehouse,
  colorBlindMode = false,
  onTimeRangeChange,
}) => {
  // State management
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year" | "custom">("week");
  const [historicalData, setHistoricalData] = useState<{ date: string; utilization: number }[]>([]);

  // Calculate utilization metrics
  const utilizationPercentage = stats.totalSections > 0
    ? (stats.occupiedSections / stats.totalSections) * 100
    : 0;

  const utilizationText = `${stats.occupiedSections} of ${stats.totalSections} sections utilized`;

  /**
   * Effect hook to update historical data when stats change
   */
  useEffect(() => {
    if (stats.historicalData) {
      console.log("Updating historical data in dashboard:", stats.historicalData);
      setHistoricalData(stats.historicalData);
    }
  }, [stats.historicalData]);

  /**
   * Handles time range changes and updates the dashboard
   * @param {string} range - The selected time range
   * @param {Date} [startDate] - Custom range start date
   * @param {Date} [endDate] - Custom range end date
   */
  const handleTimeRangeChange = (
    range: "week" | "month" | "year" | "custom",
    startDate?: Date,
    endDate?: Date
  ) => {
    console.log("Dashboard time range changing:", { range, startDate, endDate });
    setTimeRange(range);
    if (onTimeRangeChange) {
      onTimeRangeChange(range, startDate, endDate);
    }
  };

  /**
   * Determines the color for status indicators based on color blind mode
   * @param {string} status - The section status
   * @returns {string} The appropriate color code
   */
  const getStatusColor = (status: string) => {
    if (colorBlindMode) {
      return status === 'green' ? '#2563eb' : '#dc2626'; // Blue for occupied, Red for available
    }
    return status === 'green' ? '#22c55e' : '#ef4444'; // Green for occupied, Red for available
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Utilization Dashboard</h2>
        <TimeFilter onRangeChange={handleTimeRangeChange} />
      </div>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Current View Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentWarehouse}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange} view
            </p>
          </CardContent>
        </Card>

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
              Total storage sections
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
            {historicalData.length > 0 ? (
              <LineChart
                data={historicalData.map(d => ({
                  date: d.date,
                  value: Number(d.utilization)
                }))}
                xAxisKey="date"
                yAxisKey="value"
                tooltipFormatter={(value) => `${value.toFixed(1)}% utilization`}
                colorBlindMode={colorBlindMode}
                timeRange={timeRange}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available for the selected time range
              </div>
            )}
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