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
      className={`absolute transition-all duration-300 z-10 group ${
        isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        left: `${xPosition}px`,
        top: `${yPosition}px`,
        width: `${sectionSize}px`,
        height: `${sectionSize}px`,
        pointerEvents: isDeleting ? 'none' : 'all',
        transitionProperty: 'all',
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        transitionDuration: '300ms',
      }}
    >
      <button
        className={`w-full h-full rounded-2xl flex items-center justify-center shadow-lg 
                   transition-all duration-300 backdrop-blur-sm border border-white/10
                   ${section.status === 'green' 
                     ? 'bg-emerald-500/90 hover:bg-emerald-500/95' 
                     : 'bg-red-500/90 hover:bg-red-500/95'
                   } ${colorBlindMode ? 'pattern-diagonal-lines' : ''}`}
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

  // Calculate number of complete rows only
  const numRows = Math.floor(sections.length / SECTIONS_PER_ROW);

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
    if (!onDeleteRow || isDeletingRow || numRows === 0) return;
    
    setIsDeletingRow(true);
    setDeletingRowIndex(numRows - 1); // Mark the last row for deletion animation
    
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
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const minSize = Math.min(
        Math.floor((vw - 64 - (2 * aisleWidth)) / 6),
        Math.floor((vh - 120) / numRows) // Adjust for dynamic number of rows
      );
      setGridSize(Math.min(minSize, 70));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [numRows]);

  // Convert sections to internal state format and organize them into rows
  const sectionStates: SectionState[] = sections.map((section, index) => ({
    id: section.key,
    position: {
      x: index % SECTIONS_PER_ROW, // Position within row (0, 1, or 2)
      y: Math.floor(index / SECTIONS_PER_ROW) // Row number
    },
    status: section.status,
    number: section.sectionNumber
  }));

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Header with Add/Delete Row Buttons */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="w-full max-w-lg mx-auto px-4 pt-4">
          <div className="bg-gradient-to-r from-blue-600/10 to-cyan-500/10 backdrop-blur-sm rounded-lg border border-white/5 overflow-hidden">
            <div className="flex flex-col">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-white/90 text-xl font-semibold">
                    {currentWarehouse}
                  </h2>
                  <div className="flex gap-2">
                    {onAddSections && (
                      <button
                        onClick={handleAddRow}
                        disabled={isAddingRow}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isAddingRow ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Adding...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Row
                          </>
                        )}
                      </button>
                    )}
                    {onDeleteRow && numRows > 0 && (
                      <button
                        onClick={handleDeleteRow}
                        disabled={isDeletingRow}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isDeletingRow ? (
                          <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Row
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/5 rounded-md transition-colors"
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
      </div>

      {/* Grid */}
      <div className="flex-1 flex items-center justify-center mt-32 z-0">
        <div className="relative p-8">
          <div
            ref={gridRef}
            style={{
              width: `${(3 * gridSize) + (2 * columnGap) + (2 * aisleWidth)}px`,
              height: `${(numRows * gridSize) + ((numRows - 1) * rowGap)}px`,
              position: 'relative',
              margin: '0 auto',
              transition: 'height 0.3s ease-in-out',
            }}
            className="transform perspective-1000"
          >
            {/* First Aisle */}
            <div
              className="absolute backdrop-blur-sm"
              style={{
                left: `${gridSize + (columnGap / 2)}px`,
                top: 0,
                width: `${aisleWidth}px`,
                height: '100%',
                zIndex: 5,
                backgroundColor: 'rgba(75, 85, 99, 0.3)',
                transition: 'height 0.3s ease-in-out',
              }}
            >
              <div className="h-full backdrop-blur-sm relative">
                <AisleNumbers
                  numRows={numRows}
                  gridSize={gridSize}
                  rowGap={rowGap}
                />
              </div>
            </div>

            {/* Second Aisle */}
            <div
              className="absolute backdrop-blur-sm"
              style={{
                left: `${(2 * gridSize) + columnGap + aisleWidth + (columnGap / 2)}px`,
                top: 0,
                width: `${aisleWidth}px`,
                height: '100%',
                zIndex: 5,
                backgroundColor: 'rgba(75, 85, 99, 0.3)',
                transition: 'height 0.3s ease-in-out',
              }}
            >
              <div className="h-full backdrop-blur-sm relative">
                <AisleNumbers
                  numRows={numRows}
                  gridSize={gridSize}
                  rowGap={rowGap}
                  isSecondAisle
                />
              </div>
            </div>

            {/* Sections */}
            {sectionStates.map((section) => {
              let xPosition = section.position.x * (gridSize + columnGap);
              if (section.position.x >= 1) xPosition += aisleWidth;
              if (section.position.x >= 2) xPosition += aisleWidth;
              
              const yPosition = section.position.y * (gridSize + rowGap);
              const isInDeletingRow = deletingRowIndex !== null && 
                Math.floor(section.position.y) === deletingRowIndex;

              return (
                <StaticSection
                  key={section.id}
                  section={{
                    ...section,
                    position: { x: xPosition, y: yPosition }
                  }}
                  onStatusChange={onStatusChange}
                  onDelete={onDeleteSection}
                  gridSize={gridSize}
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