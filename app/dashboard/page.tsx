'use client';

import Link from 'next/link';
import { WarehouseDashboard } from "../components/warehouse/WarehouseDashboard";
import { useWarehouses } from "../hooks/useWarehouses";
import { calculateTotalPercentage, calculateIndoorPercentage, calculateOutdoorPercentage } from "../utils/warehouse-utils";
import { useState, useEffect } from 'react';
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

export default function DashboardPage() {
  const { indoorWarehouses, outdoorWarehouses, buttonStatus } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [historicalData, setHistoricalData] = useState<{ date: string; utilization: number }[]>([]);
  const { theme, setTheme } = useTheme();
  const [colorBlindMode, setColorBlindMode] = useState(false);

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

  // Calculate actual utilization stats
  const totalSections = Object.keys(filteredButtonStatus).length;
  const occupiedSections = Object.values(filteredButtonStatus).filter(status => status === 'green').length;
  const availableSections = Object.values(filteredButtonStatus).filter(status => status === 'red').length;

  // Calculate percentages
  const totalPercentage = calculateTotalPercentage(filteredButtonStatus);
  const indoorPercentage = calculateIndoorPercentage(filteredButtonStatus, indoorWarehouses.map(w => w.letter));
  const outdoorPercentage = calculateOutdoorPercentage(filteredButtonStatus, outdoorWarehouses.map(w => w.letter));

  // Generate historical data based on the actual warehouse data
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();
    
    // Generate data for the past 7 days, starting from today
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      let dayUtilization = 0;
      if (selectedWarehouse === "all") {
        // For "all", use the overall utilization
        dayUtilization = totalPercentage;
      } else if (selectedWarehouse === "indoor") {
        // For indoor warehouses
        dayUtilization = indoorPercentage;
      } else if (selectedWarehouse === "outdoor") {
        // For outdoor warehouses
        dayUtilization = outdoorPercentage;
      } else {
        // For a specific warehouse
        const warehouseSections = Object.entries(buttonStatus)
          .filter(([key]) => key.startsWith(selectedWarehouse));
        if (warehouseSections.length > 0) {
          const greenSections = warehouseSections.filter(([, status]) => status === 'green').length;
          dayUtilization = (greenSections / warehouseSections.length) * 100;
        }
      }
      
      // Add minimal random variation (±2%) to make the graph more realistic
      const variation = (Math.random() - 0.5) * 4;
      const historicalUtilization = Math.max(0, Math.min(100, dayUtilization + variation));
      
      data.unshift({
        date: date.toISOString(),
        utilization: historicalUtilization
      });
    }
    
    return data;
  };

  // Update historical data when dependencies change
  useEffect(() => {
    setHistoricalData(generateHistoricalData());
  }, [selectedWarehouse, buttonStatus, totalPercentage, indoorPercentage, outdoorPercentage]);

  const stats = {
    totalSections,
    occupiedSections,
    availableSections,
    statusBreakdown: {
      green: occupiedSections,
      red: availableSections,
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
                  <SelectItem value="all">Total Port Utilization</SelectItem>
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
          stats={stats}
          currentWarehouse={selectedWarehouse === 'all' 
            ? 'Total Port Utilization' 
            : allWarehouses.find(w => w.letter === selectedWarehouse)?.name || selectedWarehouse}
          colorBlindMode={colorBlindMode}
          warehouses={allWarehouses}
        />
      </div>
    </div>
  );
} 