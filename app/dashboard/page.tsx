'use client';

import Link from 'next/link';
import { WarehouseDashboard } from "../components/WarehouseDashboard";
import { useWarehouses } from "../hooks/useWarehouses";
import { calculateTotalPercentage, calculateIndoorPercentage, calculateOutdoorPercentage } from "../utils/warehouse-utils";
import { useState, useEffect } from 'react';

export default function DashboardPage() {
  const { indoorWarehouses, outdoorWarehouses, buttonStatus } = useWarehouses();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [historicalData, setHistoricalData] = useState<{ date: string; utilization: number }[]>([]);

  // Filter button status based on selected warehouse
  const filteredButtonStatus = selectedWarehouse === "all"
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

  // Generate historical data based on the actual warehouse data
  useEffect(() => {
    const generateHistoricalData = () => {
      const data = [];
      const today = new Date();
      
      // Generate data for the past 7 days
      for (let i = 6; i >= 0; i--) {
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
        
        data.push({
          date: date.toISOString(),
          utilization: historicalUtilization
        });
      }
      
      return data;
    };

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
    { letter: "indoor", name: "All Indoor Warehouses" },
    { letter: "outdoor", name: "All Outdoor Warehouses" },
    ...indoorWarehouses.map(w => ({ letter: w.letter, name: w.name })),
    ...outdoorWarehouses.map(w => ({ letter: w.letter, name: w.name }))
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

      <WarehouseDashboard 
        stats={stats}
        currentWarehouse={selectedWarehouse}
        warehouses={allWarehouses}
        onWarehouseChange={setSelectedWarehouse}
      />
    </div>
  );
} 