/**
 * WarehouseSelector Component
 * This component provides a dropdown interface for selecting warehouses.
 * It organizes warehouses by type (indoor/outdoor) and includes an overall view option.
 */

"use client"

// Import necessary dependencies
import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select"

/**
 * Interface for warehouse information
 * @interface Warehouse
 * @property {string} letter - Warehouse identifier
 * @property {string} name - Warehouse name
 * @property {'indoor' | 'outdoor'} type - Warehouse type
 */
interface Warehouse {
  letter: string
  name: string
  type: 'indoor' | 'outdoor'
}

/**
 * Props interface for the WarehouseSelector component
 * @interface WarehouseSelectorProps
 * @property {Warehouse[]} warehouses - Array of warehouse objects
 * @property {(warehouse: string) => void} onWarehouseChange - Callback function when selection changes
 */
interface WarehouseSelectorProps {
  warehouses: Warehouse[]
  onWarehouseChange: (warehouse: string) => void
}

/**
 * WarehouseSelector Component
 * 
 * @param {WarehouseSelectorProps} props - Component props
 * @returns {JSX.Element} A dropdown selector for warehouse selection
 * 
 * This component:
 * 1. Provides a dropdown interface for warehouse selection
 * 2. Organizes warehouses by type (indoor/outdoor)
 * 3. Includes an overall view option
 * 4. Handles selection changes and updates parent component
 */
export function WarehouseSelector({ warehouses, onWarehouseChange }: WarehouseSelectorProps) {
  // State management for selected warehouse
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")

  /**
   * Handles warehouse selection changes
   * @param {string} value - The selected warehouse identifier
   */
  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value)
    onWarehouseChange(value)
  }

  // Filter warehouses by type
  const indoorWarehouses = warehouses.filter(w => w.type === 'indoor')
  const outdoorWarehouses = warehouses.filter(w => w.type === 'outdoor')

  return (
    <div className="w-full">
      <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select warehouse" />
        </SelectTrigger>
        <SelectContent>
          {/* Overall view option */}
          <SelectGroup>
            <SelectLabel>Overall</SelectLabel>
            <SelectItem value="all">Total Port Utilization</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          
          {/* Indoor warehouses section */}
          <SelectGroup>
            <SelectLabel>Indoor Warehouses</SelectLabel>
            {indoorWarehouses.map((warehouse) => (
              <SelectItem key={warehouse.letter} value={warehouse.letter}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
          
          {/* Outdoor warehouses section */}
          <SelectGroup>
            <SelectLabel>Outdoor Warehouses</SelectLabel>
            {outdoorWarehouses.map((warehouse) => (
              <SelectItem key={warehouse.letter} value={warehouse.letter}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
} 