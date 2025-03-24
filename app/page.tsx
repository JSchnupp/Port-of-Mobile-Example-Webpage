"use client";
import { useState } from "react";
import { useTheme } from 'next-themes'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { WarehouseItem } from "@/components/WarehouseItem";
import { WarehouseForm } from "@/components/WarehouseForm";
import { useWarehouses } from "@/app/hooks/useWarehouses";
import { calculateTotalPercentage, calculateIndoorPercentage, calculateOutdoorPercentage, statusColors } from "@/utils/warehouse-utils";
import type { WarehouseStatus } from '@/types/database';
import { PieChartComponent } from "@/components/ui/pie-chart";

export default function Home() {
  const [indoorOpen, setIndoorOpen] = useState(false);
  const [outdoorOpen, setOutdoorOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [showIndoorForm, setShowIndoorForm] = useState(false);
  const [showOutdoorForm, setShowOutdoorForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'indoor' | 'outdoor' | null }>({ type: null });
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [warehousesToDelete, setWarehousesToDelete] = useState<Set<string>>(new Set());
  
  const {
    indoorWarehouses,
    outdoorWarehouses,
    buttonStatus,
    loading,
    createWarehouse,
    updateSectionStatus,
    removeWarehouse,
    downloadWarehouseData
  } = useWarehouses();

  const { theme, setTheme } = useTheme()

  const handleWarehouseClick = (warehouse: string) => {
    const allWarehouses = [...indoorWarehouses, ...outdoorWarehouses];
    const selectedWarehouseData = allWarehouses.find(w => w.letter === warehouse);
    if (selectedWarehouseData) {
      setSelectedWarehouse(warehouse);
      setIndoorOpen(false);
      setOutdoorOpen(false);
    }
  };

  const handleRemoveWarehouse = async (letter: string) => {
    const success = await removeWarehouse(letter);
    if (success) {
      if (selectedWarehouse === letter) {
        setSelectedWarehouse(null);
      }
      setWarehousesToDelete(prev => {
        const newSet = new Set(prev);
        newSet.delete(letter);
        return newSet;
      });
    }
  };

  const handleRemoveSelectedWarehouses = async () => {
    setShowDeleteConfirm({ type: null });
    setShowFinalConfirm(true);
  };

  const handleFinalConfirm = async () => {
    const promises = Array.from(warehousesToDelete).map(letter => handleRemoveWarehouse(letter));
    await Promise.all(promises);
    setShowFinalConfirm(false);
    setWarehousesToDelete(new Set());
  };

  const toggleWarehouseSelection = (letter: string) => {
    setWarehousesToDelete(prev => {
      const newSet = new Set(prev);
      if (newSet.has(letter)) {
        newSet.delete(letter);
      } else {
        newSet.add(letter);
      }
      return newSet;
    });
  };

  const handleButtonClick = async (warehouse: string, sectionNumber: number) => {
    const buttonKey = `${warehouse}${sectionNumber}`;
    const statusOrder: WarehouseStatus[] = ["green", "yellow", "orange", "red"];
    const currentStatus = buttonStatus[buttonKey];
    const currentIndex = currentStatus ? statusOrder.indexOf(currentStatus) : -1;
    const nextIndex = (currentIndex + 1) % statusOrder.length;
    const nextStatus = statusOrder[nextIndex];

    await updateSectionStatus(warehouse, sectionNumber, nextStatus);
  };

  const handleCreateWarehouse = async (type: 'indoor' | 'outdoor', data: { name: string; sections: number }) => {
    const success = await createWarehouse(type, data.name, data.sections);
    if (success) {
      setShowIndoorForm(false);
      setShowOutdoorForm(false);
    }
  };

  // Calculate percentages using the utility functions
  const totalPercentage = calculateTotalPercentage(buttonStatus);
  const indoorPercentage = calculateIndoorPercentage(buttonStatus, indoorWarehouses.map(w => w.letter));
  const outdoorPercentage = calculateOutdoorPercentage(buttonStatus, outdoorWarehouses.map(w => w.letter));

  // Prepare data for pie chart
  const pieChartData = [
    {
      name: "Indoor",
      value: indoorPercentage,
      fill: "hsl(221, 83%, 53%)", // blue-600
    },
    {
      name: "Outdoor",
      value: outdoorPercentage,
      fill: "hsl(265, 89%, 78%)", // purple-400
    },
  ];

  // Custom tooltip formatter for the pie chart
  const tooltipFormatter = (
    value: number | string | Array<number | string>
  ) => {
    if (Array.isArray(value)) {
      return `${value.join(", ")}% Utilization`;
    }
    return `${value}% Utilization`;
  };

  if (loading) {
    return <div className="min-h-screen p-8 flex items-center justify-center">
      <div className="text-xl">Loading warehouses...</div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Add theme toggle button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <SunIcon className="h-6 w-6 text-yellow-500" />
        ) : (
          <MoonIcon className="h-6 w-6 text-gray-700" />
        )}
      </button>

      <div className="min-h-screen p-8 flex flex-col items-center justify-center">
        <h1 className="text-[32pt] font-[family-name:var(--font-geist-mono)] mb-12 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent tracking-tight">
          Port of Mobile Test
        </h1>

        <div className="flex justify-center mb-4">
          <button
            onClick={downloadWarehouseData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download Report
          </button>
        </div>

        <div className="mb-8 w-full max-w-md">
          <PieChartComponent
            data={pieChartData}
            title="Port Utilization"
            description="Indoor and Outdoor Warehouses"
            centerLabel="Total Utilization"
            centerValue={totalPercentage}
            innerRadius={60}
            outerRadius={100}
            className="shadow-lg"
            tooltipFormatter={tooltipFormatter}
            footer={
              <div className="flex justify-around w-full pt-2">
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                    {indoorPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">Indoor</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-purple-600 dark:text-purple-400 text-lg">
                    {outdoorPercentage}%
                  </span>
                  <span className="text-sm text-muted-foreground">Outdoor</span>
                </div>
              </div>
            }
          />
        </div>

        <div className="flex gap-8">
          <div className="relative">
            <button
              onClick={() => setIndoorOpen(!indoorOpen)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-[family-name:var(--font-geist-sans)] text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Indoor Warehouse
            </button>
            {indoorOpen && (
              <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                {indoorWarehouses.map((warehouse) => (
                  <WarehouseItem
                    key={warehouse.letter}
                    warehouse={warehouse}
                    onSelect={handleWarehouseClick}
                    buttonStatus={buttonStatus}
                  />
                ))}
                <div
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-t border-gray-200 dark:border-gray-700"
                  onClick={() => setShowIndoorForm(true)}
                >
                  <span className="text-blue-500">+ Create Warehouse</span>
                </div>
                {indoorWarehouses.length > 0 && (
                  <div
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-t border-gray-200 dark:border-gray-700"
                    onClick={() => setShowDeleteConfirm({ type: 'indoor' })}
                  >
                    <span className="text-red-500">- Remove Warehouse</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setOutdoorOpen(!outdoorOpen)}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-400 text-white font-[family-name:var(--font-geist-sans)] text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Outdoor Warehouse
            </button>
            {outdoorOpen && (
              <div className="absolute mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                {outdoorWarehouses.map((warehouse) => (
                  <WarehouseItem
                    key={warehouse.letter}
                    warehouse={warehouse}
                    onSelect={handleWarehouseClick}
                    buttonStatus={buttonStatus}
                  />
                ))}
                <div
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-t border-gray-200 dark:border-gray-700"
                  onClick={() => setShowOutdoorForm(true)}
                >
                  <span className="text-purple-500">+ Create Warehouse</span>
                </div>
                {outdoorWarehouses.length > 0 && (
                  <div
                    className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-t border-gray-200 dark:border-gray-700"
                    onClick={() => setShowDeleteConfirm({ type: 'outdoor' })}
                  >
                    <span className="text-red-500">- Remove Warehouse</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Warehouse Forms */}
        {showIndoorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <WarehouseForm
              type="indoor"
              onClose={() => setShowIndoorForm(false)}
              onSubmit={(data) => handleCreateWarehouse('indoor', data)}
            />
          </div>
        )}

        {showOutdoorForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <WarehouseForm
              type="outdoor"
              onClose={() => setShowOutdoorForm(false)}
              onSubmit={(data) => handleCreateWarehouse('outdoor', data)}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm.type && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Select Warehouses to Remove</h3>
              <div className="mb-6 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {showDeleteConfirm.type === 'indoor' 
                    ? indoorWarehouses.map((warehouse) => (
                        <label key={warehouse.letter} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={warehousesToDelete.has(warehouse.letter)}
                            onChange={() => toggleWarehouseSelection(warehouse.letter)}
                            className="h-4 w-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                          />
                          <span>{warehouse.name}</span>
                        </label>
                      ))
                    : outdoorWarehouses.map((warehouse) => (
                        <label key={warehouse.letter} className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={warehousesToDelete.has(warehouse.letter)}
                            onChange={() => toggleWarehouseSelection(warehouse.letter)}
                            className="h-4 w-4 text-red-500 rounded border-gray-300 focus:ring-red-500"
                          />
                          <span>{warehouse.name}</span>
                        </label>
                      ))
                  }
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {warehousesToDelete.size} warehouse{warehousesToDelete.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm({ type: null });
                    setWarehousesToDelete(new Set());
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRemoveSelectedWarehouses}
                  disabled={warehousesToDelete.size === 0}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Confirmation Modal */}
        {showFinalConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Confirm Warehouse Removal</h3>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Are you sure you want to remove the following warehouse{warehousesToDelete.size !== 1 ? 's' : ''}?
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Array.from(warehousesToDelete).map((letter) => {
                    const warehouse = [...indoorWarehouses, ...outdoorWarehouses].find(w => w.letter === letter);
                    return (
                      <div key={letter} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                        {warehouse?.name}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowFinalConfirm(false);
                    setWarehousesToDelete(new Set());
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalConfirm}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove Warehouses
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedWarehouse && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">
              {[...indoorWarehouses, ...outdoorWarehouses].find(w => w.letter === selectedWarehouse)?.name || `Warehouse ${selectedWarehouse}`}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(buttonStatus)
                .filter(([key]) => key.startsWith(selectedWarehouse))
                .map(([key, status]) => {
                  const sectionNumber = parseInt(key.slice(1));
                  return (
                    <button
                      key={sectionNumber}
                      onClick={() =>
                        handleButtonClick(selectedWarehouse, sectionNumber)
                      }
                      className={`px-8 py-6 text-white rounded-lg transition-colors text-2xl font-semibold ${
                        status
                          ? statusColors[status].color
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      Section {String.fromCharCode(64 + sectionNumber)}
                      {status && (
                        <span className="ml-2">
                          ({statusColors[status].percentage})
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
