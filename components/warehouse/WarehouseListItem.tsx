import { StatusColor } from "@/types/warehouse";

interface WarehouseListItemProps {
  warehouse: string;
  getWarehouseAverageStatus: (warehouse: string) => StatusColor;
  onWarehouseClick: (warehouse: string) => void;
  onDeleteWarehouse: (warehouse: string) => void;
  statusColors: {
    [key in StatusColor]: {
      color: string;
      percentage: string;
    };
  };
}

export function WarehouseListItem({
  warehouse,
  getWarehouseAverageStatus,
  onWarehouseClick,
  onDeleteWarehouse,
  statusColors,
}: WarehouseListItemProps) {
  return (
    <div className="group flex items-center justify-between px-4 py-3 hover:bg-gray-700/50 cursor-pointer border-b border-gray-700/50 last:border-b-0">
      <div
        className="flex items-center gap-3"
        onClick={() => onWarehouseClick(warehouse)}
      >
        <div
          className={`w-3 h-3 rounded-full ${
            statusColors[getWarehouseAverageStatus(warehouse)].color
          } shadow-lg shadow-${statusColors[getWarehouseAverageStatus(warehouse)].color}/50`}
        />
        <span className="text-gray-100 font-medium text-lg tracking-wide">
          Warehouse {warehouse}
        </span>
        <span className="text-sm text-gray-400">
          ({statusColors[getWarehouseAverageStatus(warehouse)].percentage} Utilization)
        </span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteWarehouse(warehouse);
        }}
        className="opacity-0 group-hover:opacity-100 px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-all duration-300 text-sm font-medium"
      >
        Delete
      </button>
    </div>
  );
} 