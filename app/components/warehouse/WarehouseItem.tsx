/**
 * WarehouseItem Component
 * This component represents a single warehouse in the warehouse selection interface.
 * It displays warehouse information, utilization status, and last modification time.
 */

'use client';

// Import necessary types and utilities
import { Warehouse } from "../../types/database";
import { cn } from "@/lib/utils";
import { statusColors } from '@/utils/warehouse-utils';

/**
 * Props interface for the WarehouseItem component
 * @interface WarehouseItemProps
 * @property {Warehouse} warehouse - The warehouse data to display
 * @property {() => void} onClick - Callback function when the item is clicked
 * @property {boolean} isSelected - Whether this warehouse is currently selected
 * @property {number} utilization - The utilization percentage of the warehouse
 * @property {string} lastModified - The timestamp of the last modification
 */
interface WarehouseItemProps {
  warehouse: Warehouse;
  onClick: () => void;
  isSelected: boolean;
  utilization: number;
  lastModified: string;
}

/**
 * WarehouseItem Component
 * 
 * @param {WarehouseItemProps} props - Component props
 * @returns {JSX.Element} A clickable warehouse item with utilization information
 * 
 * This component:
 * 1. Displays warehouse name and last modification time
 * 2. Shows utilization percentage with a visual progress bar
 * 3. Changes appearance based on selection state
 * 4. Provides visual feedback for warehouse status
 */
export function WarehouseItem({
  warehouse,
  onClick,
  isSelected,
  utilization,
  lastModified,
}: WarehouseItemProps) {
  /**
   * Determines the background color based on utilization percentage
   * @param {number} percentage - The utilization percentage
   * @returns {string} The appropriate CSS class for the background color
   */
  const getUtilizationColor = (percentage: number) => {
    const status = percentage === 100 ? 'red' : 'green';
    return statusColors[status]?.color || 'bg-green-500';
  }

  /**
   * Determines the text color based on utilization percentage
   * @param {number} percentage - The utilization percentage
   * @returns {string} The appropriate CSS class for the text color
   */
  const getTextColor = (percentage: number) => {
    return percentage === 100
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-emerald-600 dark:text-emerald-400'
  }

  /**
   * Determines the ring color for the utilization indicator
   * @param {number} percentage - The utilization percentage
   * @returns {string} The appropriate CSS class for the ring color
   */
  const getRingColor = (percentage: number) => {
    return percentage === 100
      ? 'ring-rose-500/30 dark:ring-rose-400/30'
      : 'ring-emerald-500/30 dark:ring-emerald-400/30'
  }

  /**
   * Formats the last modified timestamp into a readable string
   * @param {string} dateString - The timestamp string
   * @returns {string} Formatted date string or 'Unknown' if invalid
   */
  const formatLastModified = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/40 cursor-pointer border-b border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200",
        isSelected && "bg-blue-50/50 dark:bg-blue-900/20"
      )}
      onClick={onClick}
    >
      {/* Warehouse name and last modified time */}
      <div className="flex flex-col">
        <span className="font-medium">{warehouse.name}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Last modified: {formatLastModified(lastModified)}
        </span>
      </div>
      
      {/* Utilization indicator */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium">{utilization}% utilized</span>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 