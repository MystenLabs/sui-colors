import React, { useState } from "react";
import { Box, Container, Flex, Heading } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import ColorGrid from "./ColorGrid";

const Canvas: React.FC = () => {
  const initialCanvas = Array.from({ length: 100 }, () =>
    Array(100).fill("#ffffff"),
  );
  const [color, setColor] = useState("#aabbcc");
  const [gridColors, setGridColors] = useState<string[][]>(initialCanvas);

  return (
    <div>
      <Container>
        <HexColorPicker color={color} onChange={setColor} />
        <ColorGrid
          colors={gridColors}
          selectedColor={color}
          onColorChange={setGridColors}
        />
      </Container>
    </div>
  );
};

export default Canvas;
