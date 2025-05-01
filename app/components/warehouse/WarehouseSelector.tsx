"use client"

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

interface Warehouse {
  letter: string
  name: string
  type: 'indoor' | 'outdoor'
}

interface WarehouseSelectorProps {
  warehouses: Warehouse[]
  onWarehouseChange: (warehouse: string) => void
}

export function WarehouseSelector({ warehouses, onWarehouseChange }: WarehouseSelectorProps) {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value)
    onWarehouseChange(value)
  }

  const indoorWarehouses = warehouses.filter(w => w.type === 'indoor')
  const outdoorWarehouses = warehouses.filter(w => w.type === 'outdoor')

  return (
    <div className="w-full">
      <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
        <SelectTrigger className="w-full">
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
            {indoorWarehouses.map((warehouse) => (
              <SelectItem key={warehouse.letter} value={warehouse.letter}>
                {warehouse.name}
              </SelectItem>
            ))}
          </SelectGroup>
          <SelectSeparator />
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