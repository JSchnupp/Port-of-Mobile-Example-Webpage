'use client';

import React from 'react';
import type { WarehouseStatus } from '../../types/database';

interface Position {
  x: number;
  y: number;
}

interface SectionState {
  id: string;
  position: Position;
  status: WarehouseStatus;
  number: string;
}

interface StaticGridProps {
  sections: Array<{
    key: string;
    status: WarehouseStatus;
    sectionNumber: string;
    position?: { x: number, y: number };
  }>;
  onStatusChange: (sectionId: string, status: WarehouseStatus) => void;
  currentWarehouse?: string;
  onClose?: () => void;
  colorBlindMode?: boolean;
  onAddSections?: (count: number) => Promise<void>;
  onDeleteSection?: (sectionId: string) => Promise<void>;
  onDeleteRow?: () => Promise<void>;
}

const StaticSection: React.FC<{
  section: SectionState;
  onStatusChange: (id: string, status: WarehouseStatus) => void;
  onDelete?: (id: string) => void;
  gridSize: number;
  colorBlindMode: boolean;
  xPosition: number;
  yPosition: number;
  isDeleting?: boolean;
}> = ({ 
  section, 
  onStatusChange,
  onDelete,
  gridSize,
  colorBlindMode,
  xPosition,
  yPosition,
  isDeleting = false
}) => {
  const sectionSize = gridSize - 4;

  return (
    <div
      data-testid={`section-${section.id}`}
      className={`absolute transition-opacity duration-300 z-10 group ${
        isDeleting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        left: `${xPosition}px`,
        top: `${yPosition}px`,
        width: `${sectionSize}px`,
        height: `${sectionSize}px`,
        pointerEvents: isDeleting ? 'none' : 'all',
      }}
    >
      <button
        className={`w-full h-full rounded-2xl flex items-center justify-center shadow-lg 
                   transition-colors duration-300 backdrop-blur-sm border border-white/10
                   ${section.status === 'green' 
                     ? 'bg-emerald-500/90 hover:bg-emerald-500/95' 
                     : 'bg-red-500/90 hover:bg-red-500/95'
                   } ${colorBlindMode ? (section.status === 'green' ? 'pattern-diagonal-lines' : 'pattern-dots') : ''}`}
        onClick={() => onStatusChange(section.id, section.status === 'green' ? 'red' : 'green')}
      />
      {onDelete && !isDeleting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(section.id);
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg border border-white/20"
          aria-label="Delete section"
        >
          <svg 
            className="w-3 h-3 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const AisleNumbers: React.FC<{
  numRows: number;
  gridSize: number;
  rowGap: number;
  isSecondAisle?: boolean;
}> = ({ numRows, gridSize, rowGap, isSecondAisle = false }) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between py-4">
      {Array.from({ length: numRows }, (_, index) => (
        <div
          key={index}
          className="flex items-center justify-center text-white/90 font-mono text-sm"
          style={{
            height: `${gridSize}px`,
            transform: 'translateY(4px)',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <div className="w-6 h-6 rounded-full bg-gray-600/50 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-lg">
            {(index + 1).toString().padStart(2, '0')}
          </div>
        </div>
      ))}
    </div>
  );
};

export const StaticGrid: React.FC<StaticGridProps> = ({
  sections,
  onStatusChange,
  currentWarehouse,
  onClose,
  colorBlindMode = false,
  onAddSections,
  onDeleteSection,
  onDeleteRow
}) => {
  const [gridSize, setGridSize] = React.useState(70);
  const [isAddingRow, setIsAddingRow] = React.useState(false);
  const [isDeletingRow, setIsDeletingRow] = React.useState(false);
  const [deletingRowIndex, setDeletingRowIndex] = React.useState<number | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);

  // Constants for layout
  const columnGap = 24;
  const rowGap = 20;
  const aisleWidth = 50;
  const SECTIONS_PER_ROW = 3;
  const boxPadding = 4;

  const handleAddRow = async () => {
    if (!onAddSections || isAddingRow) return;
    
    setIsAddingRow(true);
    try {
      await onAddSections(3);
    } catch (error) {
      console.error('Error adding row:', error);
    } finally {
      setIsAddingRow(false);
    }
  };

  const handleDeleteRow = async () => {
    if (!onDeleteRow || isDeletingRow || sections.length === 0) return;
    
    setIsDeletingRow(true);
    setDeletingRowIndex(sections.length - 1); // Mark the last section for deletion animation
    
    try {
      await onDeleteRow();
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error('Error deleting row:', error);
    } finally {
      setIsDeletingRow(false);
      setDeletingRowIndex(null);
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      // Set a fixed size of 70px for the grid boxes
      setGridSize(70);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert sections to internal state format and organize them into rows
  const sectionStates: SectionState[] = sections
    .sort((a, b) => parseInt(a.sectionNumber) - parseInt(b.sectionNumber))
    .map((section) => {
      const sectionNumber = parseInt(section.sectionNumber);
      // Calculate row and column positions from top to bottom
      const rowIndex = Math.floor((sectionNumber - 1) / 3);
      const colIndex = (sectionNumber - 1) % 3;
      
      return {
        id: section.key,
        position: {
          x: colIndex,
          y: rowIndex
        },
        status: section.status,
        number: section.sectionNumber
      };
    });

  // Calculate number of complete rows
  const numRows = Math.ceil(sections.length / SECTIONS_PER_ROW);

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="w-full max-w-lg mx-auto px-4 pt-4">
          <div className="bg-gradient-to-r from-blue-600/60 to-cyan-500/60 dark:from-blue-600/10 dark:to-cyan-500/10 backdrop-blur-sm rounded-lg border border-white/5 overflow-hidden">
            <div className="flex items-center justify-between p-4 relative">
              <h2 className="text-white/90 text-2xl font-semibold w-full text-center font-[family-name:var(--font-geist-mono)] tracking-tight">
                {currentWarehouse}
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="absolute right-4 p-1 hover:bg-white/5 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 text-white/70" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Row Management Buttons */}
      <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4 mb-8">
        {onAddSections && (
          <button
            onClick={handleAddRow}
            disabled={isAddingRow}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Row
          </button>
        )}
        {onDeleteRow && (
          <button
            onClick={handleDeleteRow}
            disabled={isDeletingRow || sections.length === 0}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Row
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-start justify-center mt-40 z-0 max-h-[calc(100vh-12rem)] overflow-y-auto">
        <div className="relative p-8">
          <div
            ref={gridRef}
            style={{
              width: `${(3 * 70) + (2 * columnGap) + (2 * aisleWidth)}px`,
              minHeight: `${(numRows * 70) + ((numRows - 1) * rowGap)}px`,
              position: 'relative',
              margin: '0 auto',
            }}
            className="transform perspective-1000"
          >
            {/* First Aisle */}
            <div
              className="absolute backdrop-blur-sm"
              style={{
                left: `${70 + (columnGap / 2)}px`,
                top: 0,
                width: `${aisleWidth}px`,
                height: '100%',
                zIndex: 5,
                backgroundColor: 'rgba(75, 85, 99, 0.3)',
              }}
            >
              <div className="h-full backdrop-blur-sm relative">
                <AisleNumbers
                  numRows={numRows}
                  gridSize={70}
                  rowGap={rowGap}
                />
              </div>
            </div>

            {/* Second Aisle */}
            <div
              className="absolute backdrop-blur-sm"
              style={{
                left: `${(2 * 70) + columnGap + aisleWidth + (columnGap / 2)}px`,
                top: 0,
                width: `${aisleWidth}px`,
                height: '100%',
                zIndex: 5,
                backgroundColor: 'rgba(75, 85, 99, 0.3)',
              }}
            >
              <div className="h-full backdrop-blur-sm relative">
                <AisleNumbers
                  numRows={numRows}
                  gridSize={70}
                  rowGap={rowGap}
                  isSecondAisle
                />
              </div>
            </div>

            {/* Sections */}
            {sectionStates.map((section) => {
              let xPosition = section.position.x * (70 + columnGap);
              if (section.position.x >= 1) xPosition += aisleWidth;
              if (section.position.x >= 2) xPosition += aisleWidth;
              
              const yPosition = section.position.y * (70 + rowGap);
              const isInDeletingRow = deletingRowIndex !== null && 
                section.position.y === deletingRowIndex;

              return (
                <StaticSection
                  key={section.id}
                  section={section}
                  onStatusChange={onStatusChange}
                  onDelete={onDeleteSection}
                  gridSize={70}
                  colorBlindMode={colorBlindMode}
                  xPosition={xPosition}
                  yPosition={yPosition}
                  isDeleting={isInDeletingRow}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 