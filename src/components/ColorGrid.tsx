import React from "react";

interface ColorGridProps {
  colors: string[][];
  selectedColor: string;
  onColorChange: (x: string[][]) => void;
}

const ColorGrid: React.FC<ColorGridProps> = ({
  colors,
  selectedColor,
  onColorChange,
}) => {
  const handleSquareClick = (rowIndex: number, colIndex: number) => {
    console.log(rowIndex, colIndex, selectedColor);
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
                backgroundColor: "#" + color,
                width: "10px",
                height: "10px",
                cursor: "pointer",
              }}
              onClick={() => handleSquareClick(rowIndex, colIndex)}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default ColorGrid;
