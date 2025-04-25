'use client';

import Link from 'next/link';
import { WarehouseDashboard } from "../components/WarehouseDashboard";
import { useWarehouses } from "../hooks/useWarehouses";
import { calculateTotalPercentage, calculateIndoorPercentage, calculateOutdoorPercentage } from "../utils/warehouse-utils";

export default function DashboardPage() {
  const { indoorWarehouses, outdoorWarehouses, buttonStatus } = useWarehouses();

  // Calculate actual utilization stats
  const totalSections = Object.keys(buttonStatus).length;
  const occupiedSections = Object.values(buttonStatus).filter(status => status === 'green').length;
  const availableSections = totalSections - occupiedSections;

  // Calculate percentages
  const totalPercentage = calculateTotalPercentage(buttonStatus);
  const indoorPercentage = calculateIndoorPercentage(buttonStatus, indoorWarehouses.map(w => w.letter));
  const outdoorPercentage = calculateOutdoorPercentage(buttonStatus, outdoorWarehouses.map(w => w.letter));

  // Generate fake historical data for the past 7 days
  const generateHistoricalData = () => {
    const data = [];
    const today = new Date();
    
    // Generate data for the past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Generate a random variation around the current utilization
      const variation = (Math.random() - 0.5) * 20; // ±10% variation
      const historicalUtilization = Math.max(0, Math.min(100, totalPercentage + variation));
      
      data.push({
        date: date.toISOString(),
        utilization: historicalUtilization
      });
    }
    
    return data;
  };

  const stats = {
    totalSections,
    occupiedSections,
    availableSections,
    statusBreakdown: {
      green: occupiedSections,
      red: availableSections,
    },
    historicalData: generateHistoricalData()
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
        currentWarehouse="All Warehouses"
      />
    </div>
  );
} 