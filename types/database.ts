export type WarehouseType = 'indoor' | 'outdoor'
export type WarehouseStatus = 'green' | 'red'

export interface Warehouse {
  id: string
  name: string
  type: WarehouseType
  letter: string
  created_at: string
  updated_at: string
  last_modified: string
}

export interface WarehouseSection {
  id: string
  warehouse_id: string
  warehouse_name: string
  section_number: number
  status: WarehouseStatus
  position_x: number
  position_y: number
  section_type: 'indoor' | 'outdoor'
  created_at: string
  updated_at: string
}

export interface DailyUtilization {
  id: string
  warehouse_id: string | null
  total_space: number
  utilized_space: number
  utilization_percent: number
  date: string
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      warehouses: {
        Row: Warehouse
        Insert: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Warehouse, 'id'>>
      }
      warehouse_sections: {
        Row: WarehouseSection
        Insert: Omit<WarehouseSection, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<WarehouseSection, 'id'>>
      }
      daily_utilization: {
        Row: DailyUtilization
        Insert: Omit<DailyUtilization, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<DailyUtilization, 'id'>>
      }
    }
  }
} 