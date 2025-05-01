'use client';

import Link from 'next/link';
import { WarehouseDashboard } from "../components/warehouse/WarehouseDashboard";
import { useWarehouses } from "../hooks/useWarehouses";
import { calculateIndoorUtilization, calculateOutdoorUtilization, calculateUtilizationStats } from "../../lib/warehouse-calculations";
import { useState, useEffect } from 'react';
import { WarehouseStatus } from '../../types/database';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDailyUtilization } from '../../lib/daily-utilization';

export default function DashboardPage() {
  const { indoorWarehouses, outdoorWarehouses, buttonStatus } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [historicalData, setHistoricalData] = useState<{ date: string; utilization: number }[]>([]);
  const { theme, setTheme } = useTheme();
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year" | "custom">("day");
  const [customDateRange, setCustomDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: undefined,
    endDate: undefined
  });

  // Filter button status based on selected warehouse
  const filteredButtonStatus = (() => {
    if (selectedWarehouse === 'all') {
      return buttonStatus;
    } else if (selectedWarehouse === 'indoor') {
      // Filter for all indoor warehouses
      return Object.fromEntries(
        Object.entries(buttonStatus).filter(([key]) => 
          indoorWarehouses.some(w => key.startsWith(w.letter))
        )
      );
    } else if (selectedWarehouse === 'outdoor') {
      // Filter for all outdoor warehouses
      return Object.fromEntries(
        Object.entries(buttonStatus).filter(([key]) => 
          outdoorWarehouses.some(w => key.startsWith(w.letter))
        )
      );
    } else {
      // Filter for specific warehouse
      return Object.fromEntries(
        Object.entries(buttonStatus).filter(([key]) => key.startsWith(selectedWarehouse))
      );
    }
  })();

  // Calculate utilization stats
  const stats = calculateUtilizationStats(filteredButtonStatus);
  const indoorStats = calculateIndoorUtilization(buttonStatus, indoorWarehouses.map(w => w.letter));
  const outdoorStats = calculateOutdoorUtilization(buttonStatus, outdoorWarehouses.map(w => w.letter));

  // Fetch historical data from Supabase
  useEffect(() => {
    const fetchHistoricalData = async () => {
      let startDate: Date;
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      if (timeRange === "custom" && customDateRange.startDate && customDateRange.endDate) {
        // Set start date to beginning of selected start date
        startDate = new Date(customDateRange.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        // Set end date to end of selected end date
        endDate = new Date(customDateRange.endDate);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date();
        // Calculate date range based on selected time range
        switch (timeRange) {
          case "day":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(endDate.getDate() - 6);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "month":
            startDate.setMonth(endDate.getMonth() - 1);
            startDate.setDate(endDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);
            break;
          case "year":
            startDate.setFullYear(endDate.getFullYear() - 1);
            startDate.setDate(endDate.getDate() + 1);
            startDate.setHours(0, 0, 0, 0);
            break;
          default:
            startDate.setHours(0, 0, 0, 0);
        }
      }

      // Format dates for Supabase query
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];

      console.log("Fetching data with date range:", {
        formattedStartDate,
        formattedEndDate,
        timeRange,
        selectedWarehouse
      });

      // Get warehouse ID if a specific warehouse is selected
      const warehouseId = selectedWarehouse === 'all' || selectedWarehouse === 'indoor' || selectedWarehouse === 'outdoor'
        ? undefined
        : selectedWarehouse;

      const data = await getDailyUtilization(warehouseId, formattedStartDate, formattedEndDate);

      if (!data || data.length === 0) {
        console.log("No data received from Supabase");
        setHistoricalData([]);
        return;
      }

      // Create a map of existing data points
      const dataMap = new Map(
        data.map(record => [record.date, record.utilization_percent])
      );

      // Generate all dates in the range
      const allDates: { date: string; utilization: number }[] = [];
      const currentDate = new Date(startDate);
      
      // Include data points up to and including the end date
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        
        // Use existing data or interpolate/default to previous value or 0
        const utilization = dataMap.get(dateStr) ?? 
          (allDates.length > 0 ? allDates[allDates.length - 1].utilization : 0);
        
        allDates.push({
          date: dateStr,
          utilization: utilization
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log("Processed historical data:", allDates);
      setHistoricalData(allDates);
    };

    fetchHistoricalData();
  }, [selectedWarehouse, timeRange, customDateRange]);

  const handleTimeRangeChange = (
    range: "day" | "week" | "month" | "year" | "custom",
    startDate?: Date,
    endDate?: Date
  ) => {
    console.log("Time range changed:", { range, startDate, endDate });
    setTimeRange(range);
    if (range === "custom" && startDate && endDate) {
      setCustomDateRange({ startDate, endDate });
    }
  };

  const dashboardStats = {
    totalSections: stats.totalSpace,
    occupiedSections: stats.utilizedSpace,
    availableSections: stats.totalSpace - stats.utilizedSpace,
    statusBreakdown: {
      green: stats.utilizedSpace,
      red: stats.totalSpace - stats.utilizedSpace
    },
    historicalData
  };

  // Combine indoor and outdoor warehouses for the dropdown
  const allWarehouses = [
    { letter: "all", name: "All Warehouses", type: 'all' as const },
    { letter: "indoor", name: "All Indoor Warehouses", type: 'indoor' as const },
    { letter: "outdoor", name: "All Outdoor Warehouses", type: 'outdoor' as const },
    ...indoorWarehouses.map(w => ({ letter: w.letter, name: w.name, type: 'indoor' as const })),
    ...outdoorWarehouses.map(w => ({ letter: w.letter, name: w.name, type: 'outdoor' as const }))
  ];

  return (
    <div className="container mx-auto p-4">
      {/* Back button */}
      <div className="mb-6">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
              clipRule="evenodd" 
            />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Overall</SelectLabel>
                  <SelectItem value="all">All Warehouses</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Indoor Warehouses</SelectLabel>
                  <SelectItem value="indoor">All Indoor Warehouses</SelectItem>
                  {indoorWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.letter} value={warehouse.letter}>
                      {warehouse.name} ({warehouse.letter})
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Outdoor Warehouses</SelectLabel>
                  <SelectItem value="outdoor">All Outdoor Warehouses</SelectItem>
                  {outdoorWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.letter} value={warehouse.letter}>
                      {warehouse.name} ({warehouse.letter})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-9 w-9"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setColorBlindMode(!colorBlindMode)}
                className={cn(
                  "h-9 w-9",
                  colorBlindMode && "bg-blue-100 dark:bg-blue-900"
                )}
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Toggle color blind mode</span>
              </Button>
            </div>
          </div>
        </div>

        <WarehouseDashboard
          stats={dashboardStats}
          currentWarehouse={selectedWarehouse}
          colorBlindMode={colorBlindMode}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>
    </div>
  );
} 