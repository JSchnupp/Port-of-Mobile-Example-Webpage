'use client';

import Link from 'next/link';
import { WarehouseDashboard } from "../components/warehouse/WarehouseDashboard";
import { WarehouseSelector } from "../components/warehouse/WarehouseSelector";
import { useWarehouses } from "../hooks/useWarehouses";
import { calculateTotalPercentage, calculateIndoorPercentage, calculateOutdoorPercentage } from "../utils/warehouse-utils";
import { useState } from 'react';

export default function DashboardPage() {
  const { indoorWarehouses, outdoorWarehouses, buttonStatus } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year" | "custom">("day");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const allWarehouses = [...indoorWarehouses, ...outdoorWarehouses];

  // Filter button status based on selected warehouse
  const filteredButtonStatus = selectedWarehouse === 'all' 
    ? buttonStatus 
    : Object.fromEntries(
        Object.entries(buttonStatus).filter(([key]) => key.startsWith(selectedWarehouse))
      );

  // Calculate actual utilization stats
  const totalSections = Object.keys(filteredButtonStatus).length;
  const occupiedSections = Object.values(filteredButtonStatus).filter(status => status === 'green').length;
  const availableSections = totalSections - occupiedSections;

  // Calculate percentages
  const totalPercentage = calculateTotalPercentage(filteredButtonStatus);
  const indoorPercentage = calculateIndoorPercentage(filteredButtonStatus, indoorWarehouses.map(w => w.letter));
  const outdoorPercentage = calculateOutdoorPercentage(filteredButtonStatus, outdoorWarehouses.map(w => w.letter));

  // Generate historical data based on time range
  const generateHistoricalData = (range: "day" | "week" | "month" | "year" | "custom"): Array<{ date: string; utilization: number }> => {
    const data: Array<{ date: string; utilization: number }> = [];
    const now = new Date();
    
    switch (range) {
      case "day":
        // Generate hourly data for the last 24 hours
        for (let i = 23; i >= 0; i--) {
          const date = new Date(now);
          date.setHours(now.getHours() - i);
          data.push({
            date: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            utilization: Math.random() * 100
          });
        }
        break;
        
      case "week":
        // Generate daily data for the current week up to today
        const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
        for (let i = currentDay; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - i);
          data.push({
            date: date.toLocaleDateString([], { weekday: 'short' }),
            utilization: Math.random() * 100
          });
        }
        break;
        
      case "month":
        // Generate weekly data for the current month up to current week
        const currentDate = now.getDate();
        const currentWeek = Math.ceil(currentDate / 7);
        for (let i = currentWeek; i >= 1; i--) {
          const date = new Date(now);
          date.setDate(now.getDate() - ((currentWeek - i) * 7));
          data.push({
            date: `Week ${i}`,
            utilization: Math.random() * 100
          });
        }
        break;
        
      case "year":
        // Generate monthly data for the current year up to current month
        const currentMonth = now.getMonth(); // 0 = January, 1 = February, etc.
        for (let i = currentMonth; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(i);
          data.push({
            date: date.toLocaleDateString([], { month: 'short' }),
            utilization: Math.random() * 100
          });
        }
        break;
        
      case "custom":
        // For custom range, return existing data if available
        if (stats.historicalData) {
          return stats.historicalData;
        }
        break;
    }
    
    return data;
  };

  const handleTimeRangeChange = (range: "day" | "week" | "month" | "year" | "custom", start?: Date, end?: Date) => {
    setTimeRange(range);
    if (range === "custom" && start && end) {
      setStartDate(start);
      setEndDate(end);
    }
  };

  const stats: {
    totalSections: number;
    occupiedSections: number;
    availableSections: number;
    statusBreakdown: {
      green: number;
      red: number;
    };
    historicalData: Array<{ date: string; utilization: number }>;
  } = {
    totalSections,
    occupiedSections,
    availableSections,
    statusBreakdown: {
      green: occupiedSections,
      red: availableSections,
    },
    historicalData: generateHistoricalData(timeRange)
  };

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

      <WarehouseDashboard 
        stats={stats}
        currentWarehouse={selectedWarehouse === 'all' ? 'All Warehouses' : allWarehouses.find(w => w.letter === selectedWarehouse)?.name}
        warehouses={allWarehouses}
        onWarehouseChange={setSelectedWarehouse}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </div>
  );
} 