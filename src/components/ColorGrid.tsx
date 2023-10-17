import React from "react";

interface ColorGridProps {
  colors: string[][];
  localColorGrid: string[][];
  selectedColor: string;
  onColorChange: (x: string[][]) => void;
  onMouseDown: (event: React.MouseEvent) => void;
  onMouseMove: (event: React.MouseEvent, x: number, y: number) => void;
  onMouseUp: () => void;
  isDragging: boolean;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  colors,
  selectedColor,
  localColorGrid,
  onColorChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  isDragging,
}) => {
  const handleSquareClick = (rowIndex: number, colIndex: number) => {
    const newColors = colors.map((row, rIndex) =>
      row.map((color, cIndex) =>
        rIndex === rowIndex && cIndex === colIndex ? selectedColor : color,
      ),
    );
    onColorChange(newColors);
  };

  return (
    <div>
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
                cursor: isDragging ? "grabbing" : "pointer",
              }}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
              onMouseDown={onMouseDown}
              onMouseMove={(e) => onMouseMove(e, rowIndex, colIndex)}
              onMouseUp={onMouseUp}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ColorGrid;
