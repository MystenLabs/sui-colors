import React from "react";

interface ColorGridProps {
  colors: string[][];
  localColorGrid: string[][];
  setIsDragging: (isDragging: boolean) => void;
  onMouseMove: (event: React.MouseEvent, x: number, y: number) => void;
  isDragging: boolean;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  colors,
  localColorGrid,
  onMouseMove,
  isDragging,
  setIsDragging,
}) => {
  return (
    <div
        onMouseDown={() => setIsDragging(!isDragging)}
        onMouseLeave={() => setIsDragging(false)}
        style={{
          cursor: isDragging ? 'crosshair' : 'pointer',
        }}
    >
      {colors.map((row, rowIndex) => (
        <div key={rowIndex} style={{ display: "flex" }}>
          {row.map((color, colIndex) => (
            <div
              key={colIndex}
              style={{
                backgroundColor:
                  localColorGrid[rowIndex][colIndex] !== "0"
                    ? localColorGrid[rowIndex][colIndex]
                    : color,
                width: "10px",
                height: "10px",
              }}
              onMouseMove={(e) => onMouseMove(e, rowIndex, colIndex)}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ColorGrid;
