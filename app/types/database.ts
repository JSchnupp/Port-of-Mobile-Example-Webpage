export type WarehouseStatus = 'green' | 'red';
export type WarehouseType = 'indoor' | 'outdoor';

export interface Warehouse {
  letter: string;
  name: string;
  type: WarehouseType;
  sections?: WarehouseSection[];
}

export interface WarehouseSection {
  number: string;
  status: WarehouseStatus;
  position?: { x: number; y: number };
}

export interface ButtonStatus {
  [key: string]: WarehouseStatus;
}

export interface SectionPositions {
  [key: string]: { x: number; y: number };
} 