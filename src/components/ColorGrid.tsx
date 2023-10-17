import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";

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
  // const [currColor, setSelectedColor] = useState<string | null>(selectedColor);

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
                backgroundColor: color,
                width: "10px",
                height: "10px",
                // margin: "1px",
                cursor: "pointer",
                // border: `1px solid ${
                //   color === selectedColor ? "black" : "transparent"
                // }`,
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
