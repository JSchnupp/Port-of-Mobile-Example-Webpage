import { useColorBlindMode } from '@/app/context/ColorBlindModeContext';

interface Cell {
  isStart: boolean;
  isEnd: boolean;
  isWall: boolean;
  isPath: boolean;
}

const getCellClassName = (cell: Cell) => {
  const baseClasses = 'w-8 h-8 border border-gray-300 flex items-center justify-center';
  const colorBlindClasses = useColorBlindMode ? 'pattern-opacity-30' : '';
  
  if (cell.isStart) {
    return `${baseClasses} ${colorBlindClasses} pattern-diagonal-lines`;
  }
  if (cell.isEnd) {
    return `${baseClasses} ${colorBlindClasses} pattern-dots`;
  }
  if (cell.isWall) {
    return `${baseClasses} bg-gray-900`;
  }
  if (cell.isPath) {
    return `${baseClasses} bg-blue-500`;
  }
  return `${baseClasses} bg-white`;
}; 