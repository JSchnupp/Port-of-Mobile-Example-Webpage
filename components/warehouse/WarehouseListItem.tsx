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
    <div className="group flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
      <div
        className="flex items-center gap-2"
        onClick={() => onWarehouseClick(warehouse)}
      >
        <div
          className={`w-3 h-3 rounded-full ${
            statusColors[getWarehouseAverageStatus(warehouse)].color
          }`}
        />
        <span>Warehouse {warehouse}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteWarehouse(warehouse);
        }}
        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
      >
        Delete
      </button>
    </div>
  );
} 