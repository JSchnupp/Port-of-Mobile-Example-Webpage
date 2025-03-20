"use client";
import { useState } from "react";
import { PieChartComponent } from "@/components/ui/pie-chart";
import { WarehouseForm } from "./components/WarehouseForm";
import { WarehouseListItem } from "@/components/warehouse/WarehouseListItem";

export default function Home() {
  const [indoorOpen, setIndoorOpen] = useState(false);
  const [outdoorOpen, setOutdoorOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null
  );
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [warehouseType, setWarehouseType] = useState<'indoor' | 'outdoor' | null>(null);
  const [buttonStatus, setButtonStatus] = useState<{
    [key: string]: keyof typeof statusColors;
  }>({
    // Indoor warehouses
    A1: "green",
    A2: "green",
    A3: "green",
    A4: "green",
    B1: "green",
    B2: "green",
    B3: "green",
    B4: "green",
    C1: "green",
    C2: "green",
    C3: "green",
    C4: "green",
    D1: "green",
    D2: "green",
    D3: "green",
    D4: "green",
    // Outdoor warehouses
    E1: "green",
    E2: "green",
    E3: "green",
    E4: "green",
    F1: "green",
    F2: "green",
    F3: "green",
    F4: "green",
    G1: "green",
    G2: "green",
    G3: "green",
    G4: "green",
    H1: "green",
    H2: "green",
    H3: "green",
    H4: "green",
  });

  const [indoorWarehouses, setIndoorWarehouses] = useState(["A", "B", "C", "D"]);
  const [outdoorWarehouses, setOutdoorWarehouses] = useState(["E", "F", "G", "H"]);
  const statusColors = {
    green: { color: "bg-green-500", percentage: "0%" },
    yellow: { color: "bg-yellow-500", percentage: "25%" },
    orange: { color: "bg-orange-500", percentage: "50%" },
    red: { color: "bg-red-500", percentage: "100%" },
  };

  const handleWarehouseClick = (warehouse: string) => {
    setSelectedWarehouse(warehouse);
    setIndoorOpen(false);
    setOutdoorOpen(false);
  };

  const handleButtonClick = (warehouse: string, sectionNumber: number) => {
    const buttonKey = `${warehouse}${sectionNumber}`;

    // Cycle through status colors
    const statusOrder: (keyof typeof statusColors)[] = [
      "green",
      "yellow",
      "orange",
      "red",
    ];
    const currentStatus = buttonStatus[buttonKey];
    const currentIndex = currentStatus
      ? statusOrder.indexOf(currentStatus)
      : -1;
    const nextIndex = (currentIndex + 1) % statusOrder.length;

    setButtonStatus((prev) => ({
      ...prev,
      [buttonKey]: statusOrder[nextIndex],
    }));
  };

  const calculatePercentage = (statuses: string[]) => {
    if (statuses.length === 0) return 0;

    let total = 0;
    let count = 0;
    statuses.forEach((status) => {
      if (status) {
        total += parseInt(
          statusColors[status as keyof typeof statusColors].percentage
        );
        count++;
      }
    });
    return count > 0 ? Math.round(total / count) : 0;
  };

  const calculateTotalPercentage = () => {
    return calculatePercentage(Object.values(buttonStatus));
  };

  const calculateIndoorPercentage = () => {
    const indoorStatuses = indoorWarehouses
      .flatMap((warehouse) =>
        Object.keys(buttonStatus)
          .filter(key => key.startsWith(warehouse))
          .map(key => buttonStatus[key])
      )
      .filter(Boolean);
    return calculatePercentage(indoorStatuses);
  };

  const calculateOutdoorPercentage = () => {
    const outdoorStatuses = outdoorWarehouses
      .flatMap((warehouse) =>
        Object.keys(buttonStatus)
          .filter(key => key.startsWith(warehouse))
          .map(key => buttonStatus[key])
      )
      .filter(Boolean);
    return calculatePercentage(outdoorStatuses);
  };

  const getWarehouseAverageStatus = (warehouse: string): keyof typeof statusColors => {
    const sections = Object.keys(buttonStatus)
      .filter(key => key.startsWith(warehouse))
      .map(key => buttonStatus[key]);
    const percentage = calculatePercentage(sections);
    if (percentage >= 100) return "red";
    if (percentage >= 50) return "orange";
    if (percentage >= 25) return "yellow";
    return "green";
  };

  // Prepare data for pie chart
  const totalPercentage = calculateTotalPercentage();
  const indoorPercentage = calculateIndoorPercentage();
  const outdoorPercentage = calculateOutdoorPercentage();

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

  const handleCreateWarehouse = (type: 'indoor' | 'outdoor') => {
    setWarehouseType(type);
    setShowWarehouseForm(true);
    if (type === 'indoor') {
      setIndoorOpen(false);
    } else {
      setOutdoorOpen(false);
    }
  };

  const handleWarehouseSubmit = (data: { name: string; sections: number }) => {
    if (!warehouseType) return;

    // Add the new warehouse to the appropriate list
    if (warehouseType === 'indoor') {
      setIndoorWarehouses(prev => [...prev, data.name]);
    } else {
      setOutdoorWarehouses(prev => [...prev, data.name]);
    }

    // Initialize all sections of the new warehouse to "green" (0%)
    const newSections: Record<string, keyof typeof statusColors> = {};
    for (let i = 1; i <= 4; i++) {
      newSections[`${data.name}${i}`] = "green"; // green represents 0% utilization
    }

    // Add the new sections to buttonStatus
    setButtonStatus(prev => ({
      ...prev,
      ...newSections
    }));

    // Close the form
    setShowWarehouseForm(false);
    setWarehouseType(null);
  };

  const handleDeleteWarehouse = (warehouse: string) => {
    // Remove the warehouse from the appropriate list
    const isIndoor = indoorWarehouses.includes(warehouse);
    if (isIndoor) {
      setIndoorWarehouses(indoorWarehouses.filter(w => w !== warehouse));
    } else {
      setOutdoorWarehouses(outdoorWarehouses.filter(w => w !== warehouse));
    }

    // Clear the status for all sections of this warehouse
    const updatedButtonStatus = { ...buttonStatus };
    [1, 2, 3, 4].forEach(section => {
      delete updatedButtonStatus[`${warehouse}${section}`];
    });
    setButtonStatus(updatedButtonStatus);

    // If the deleted warehouse was selected, clear the selection
    if (selectedWarehouse === warehouse) {
      setSelectedWarehouse(null);
    }
  };

  const handleAddSection = (warehouse: string) => {
    const existingSections = Object.keys(buttonStatus)
      .filter(key => key.startsWith(warehouse))
      .length;
    
    const newSectionNumber = existingSections + 1;
    const newSectionKey = `${warehouse}${newSectionNumber}`;
    
    setButtonStatus(prev => ({
      ...prev,
      [newSectionKey]: "green"
    }));
  };

  const handleDeleteSection = (warehouse: string) => {
    const sectionKeys = Object.keys(buttonStatus)
      .filter(key => key.startsWith(warehouse))
      .sort((a, b) => b.localeCompare(a)); // Sort in reverse to get the last section

    if (sectionKeys.length > 1) { // Prevent deleting the last section
      const lastSection = sectionKeys[0];
      setButtonStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[lastSection];
        return newStatus;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8 flex flex-col items-center">
      <h1 className="text-[40pt] font-[family-name:var(--font-geist-mono)] mb-12 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-tight drop-shadow-lg">
        Port of Mobile
      </h1>

      <div className="mb-12 w-full max-w-md bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl hover:shadow-cyan-500/10 transition-all duration-300">
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
            <div className="flex justify-around w-full pt-4 border-t border-gray-700/50 mt-4">
              <div className="flex flex-col items-center">
                <span className="font-semibold text-blue-400 text-lg">
                  {indoorPercentage}%
                </span>
                <span className="text-sm text-gray-400">Indoor</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-purple-400 text-lg">
                  {outdoorPercentage}%
                </span>
                <span className="text-sm text-gray-400">Outdoor</span>
              </div>
            </div>
          }
        />
      </div>

      <div className="flex flex-col gap-8 items-center w-full max-w-4xl">
        <div className="flex gap-8 justify-center w-full">
          <div className="relative flex-1 max-w-sm">
            <button
              onClick={() => setIndoorOpen(!indoorOpen)}
              className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-[family-name:var(--font-geist-sans)] text-lg shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 border border-blue-400/20"
            >
              Indoor Warehouse
            </button>
            {indoorOpen && (
              <div className="absolute mt-4 w-full bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-blue-500/20 overflow-hidden z-50">
                {indoorWarehouses.map((warehouse) => (
                  <WarehouseListItem
                    key={warehouse}
                    warehouse={warehouse}
                    getWarehouseAverageStatus={getWarehouseAverageStatus}
                    onWarehouseClick={handleWarehouseClick}
                    onDeleteWarehouse={handleDeleteWarehouse}
                    statusColors={statusColors}
                  />
                ))}
                <div
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-500/10 cursor-pointer border-t border-blue-500/20 transition-colors"
                  onClick={() => handleCreateWarehouse('indoor')}
                >
                  <span className="text-blue-400 font-medium">+ Create Warehouse</span>
                </div>
              </div>
            )}
          </div>

          <div className="relative flex-1 max-w-sm">
            <button
              onClick={() => setOutdoorOpen(!outdoorOpen)}
              className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-[family-name:var(--font-geist-sans)] text-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 border border-purple-400/20"
            >
              Outdoor Warehouse
            </button>
            {outdoorOpen && (
              <div className="absolute mt-4 w-full bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/20 overflow-hidden z-50">
                {outdoorWarehouses.map((warehouse) => (
                  <WarehouseListItem
                    key={warehouse}
                    warehouse={warehouse}
                    getWarehouseAverageStatus={getWarehouseAverageStatus}
                    onWarehouseClick={handleWarehouseClick}
                    onDeleteWarehouse={handleDeleteWarehouse}
                    statusColors={statusColors}
                  />
                ))}
                <div
                  className="flex items-center justify-between px-4 py-3 hover:bg-purple-500/10 cursor-pointer border-t border-purple-500/20 transition-colors"
                  onClick={() => handleCreateWarehouse('outdoor')}
                >
                  <span className="text-purple-400 font-medium">+ Create Warehouse</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedWarehouse && (
          <div className="w-full bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Warehouse {selectedWarehouse}
              </h2>
              <div className="space-x-3">
                <button
                  onClick={() => handleAddSection(selectedWarehouse)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 border border-green-400/20"
                >
                  Add Section
                </button>
                <button
                  onClick={() => handleDeleteSection(selectedWarehouse)}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300 border border-red-400/20"
                >
                  Delete Section
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(buttonStatus)
                .filter(key => key.startsWith(selectedWarehouse))
                .sort((a, b) => a.localeCompare(b))
                .map((buttonKey) => {
                  const sectionNumber = parseInt(buttonKey.slice(selectedWarehouse.length));
                  return (
                    <button
                      key={buttonKey}
                      onClick={() => handleButtonClick(selectedWarehouse, sectionNumber)}
                      className={`px-8 py-6 rounded-xl transition-all duration-300 text-2xl font-semibold backdrop-blur-sm border ${
                        buttonStatus[buttonKey]
                          ? `${statusColors[buttonStatus[buttonKey]].color} border-${statusColors[buttonStatus[buttonKey]].color.split('-')[1]}-400/20`
                          : "bg-blue-500 hover:bg-blue-600 border-blue-400/20"
                      } hover:shadow-lg hover:scale-[1.02]`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <span>Section {String.fromCharCode(64 + sectionNumber)}</span>
                        {buttonStatus[buttonKey] && (
                          <span className="text-sm font-normal">
                            {statusColors[buttonStatus[buttonKey]].percentage} Utilization
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {showWarehouseForm && warehouseType && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <WarehouseForm
            type={warehouseType}
            onClose={() => setShowWarehouseForm(false)}
            onSubmit={handleWarehouseSubmit}
          />
        </div>
      )}
    </div>
  );
}
