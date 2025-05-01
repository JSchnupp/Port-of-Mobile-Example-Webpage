import { WarehouseStatus } from '../types/database';

export interface UtilizationStats {
  totalSpace: number;
  utilizedSpace: number;
  utilizationPercent: number;
}

export function calculateUtilizationStats(buttonStatus: Record<string, WarehouseStatus>): UtilizationStats {
  const totalSpace = Object.keys(buttonStatus).length;
  // Count red sections as utilized space
  const utilizedSpace = Object.values(buttonStatus).filter(status => status === 'red').length;
  const utilizationPercent = totalSpace > 0 ? Math.round((utilizedSpace / totalSpace) * 100) : 0;

  console.log('Utilization calculation:', {
    totalSpace,
    utilizedSpace,
    utilizationPercent,
    buttonStatus: Object.entries(buttonStatus).map(([key, value]) => `${key}: ${value}`).join(', ')
  });

  return {
    totalSpace,
    utilizedSpace,
    utilizationPercent
  };
}

export function calculateWarehouseUtilization(
  buttonStatus: Record<string, WarehouseStatus>,
  warehouseLetters: string[]
): UtilizationStats {
  const warehouseSections = Object.entries(buttonStatus)
    .filter(([key]) => warehouseLetters.includes(key[0]))
    .map(([, status]) => status);

  return calculateUtilizationStats(
    Object.fromEntries(
      warehouseSections.map((status, index) => [`section${index}`, status])
    )
  );
}

export function calculateIndoorUtilization(buttonStatus: Record<string, WarehouseStatus>, indoorLetters: string[]): UtilizationStats {
  const indoorStatus = Object.entries(buttonStatus)
    .filter(([key]) => indoorLetters.some(letter => key.startsWith(letter)))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return calculateUtilizationStats(indoorStatus);
}

export function calculateOutdoorUtilization(buttonStatus: Record<string, WarehouseStatus>, outdoorLetters: string[]): UtilizationStats {
  const outdoorStatus = Object.entries(buttonStatus)
    .filter(([key]) => outdoorLetters.some(letter => key.startsWith(letter)))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return calculateUtilizationStats(outdoorStatus);
} 