import React, { useState, useEffect } from "react";
import { Button, Container, Flex, RadioGroup, Text } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  useSignAndExecuteTransactionBlock,
  useSuiClient,
} from "@mysten/dapp-kit";
import ColorGrid from "./ColorGrid";
import { useGetCanvas } from "../useGetCanvas";
import { SuiObjectData } from "@mysten/sui.js/client";

const cursorSizes = {
  Small: 1,
  Medium: 2,
  Large: 3,
};

enum CursorSizes {
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
}

const cursorSelection: CursorSizes[] = [
  CursorSizes.Small,
  CursorSizes.Medium,
  CursorSizes.Large,
];

function getCoords(size: CursorSizes, [x, y]: [number, number]) {
  if (size === CursorSizes.Small) {
    return [[x, y]];
  }

  const sizeToNum = cursorSizes[size];

  const coords = [];
  const gridSize = sizeToNum * 2 - 1;
  const halfGridSize = Math.floor(gridSize / 2);

  for (let i = -halfGridSize; i <= halfGridSize; i++) {
    for (let j = -halfGridSize; j <= halfGridSize; j++) {
      coords.push([x + i, y + j]);
    }
  }

  return coords;
}

const Canvas: React.FC = () => {
  const client = useSuiClient();

  const [deltas, setDeltas] = useState<Set<string>>(new Set());
  const [cursorSize, setCursorSize] = useState(CursorSizes.Small);
  const [color, setColor] = useState("#aabbcc");
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const { handleGetCanvas } = useGetCanvas();
  const { data, isLoading, error, refetch } = handleGetCanvas();

  const [gridColors, setGridColors] = useState<string[][]>([]);
  const [localGrid, setLocalGrid] = useState<string[][]>([]);
  const [length, setLength] = useState<number>(0);

  // Dragging Mouse
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (
    _e: React.MouseEvent,
    rowIndex: number,
    colIndex: number,
  ) => {
    if (isDragging) {
      const coords = getCoords(cursorSize, [rowIndex, colIndex]);
      const newColors = [];
      for (let row = 0; row < localGrid.length; row++) {
        newColors.push(localGrid[row].slice());
      }
      for (const [x, y] of coords) {
        newColors[x][y] = color;
      }

      setDeltas(new Set([...deltas, ...coords.map(([x, y]) => `${x},${y}`)]));
      setLocalGrid(newColors);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      console.log(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && !error && data?.data) {
      const currentCanvas = getArrayFields(data.data);
      setGridColors(currentCanvas);
      if (length !== currentCanvas.length) {
        setLength(currentCanvas.length);
        if (currentCanvas) {
          // Create a new grid with the same dimensions as currentCanvas
          const newLocalGrid = Array.from(
            { length: currentCanvas.length },
            () => Array(currentCanvas[0].length).fill("0"),
          );

          setLocalGrid(newLocalGrid);
        }
      }
    }
  }, [data, isLoading, error]);

  const handleSubmitColors = async () => {
    const newDeltas = Array.from(deltas).map((delta) => {
      const [x, y] = delta.split(",").map((x) => parseInt(x));
      return [x, y];
    });

    let transactionBlock = new TransactionBlock();
    for (const idx in newDeltas) {
      transactionBlock.moveCall({
        target: `0x3c5f9f43eccf2648855c6febf1143966d87541d47775b2b90c03f875da03cc71::board::update_single_pixel`,
        arguments: [
          transactionBlock.object(
            "0xe3390ae6a360a076b708691b2a1c24981b931e009cbf4aa6531e559c93d1f28c",
          ),
          transactionBlock.pure(newDeltas[idx][0]),
          transactionBlock.pure(newDeltas[idx][1]),
          transactionBlock.pure(
            localGrid[newDeltas[idx][0]][newDeltas[idx][1]],
          ),
        ],
      });
    }

    signAndExecuteTransactionBlock(
      {
        transactionBlock,
        chain: "sui:testnet",
      },
      {
        onSuccess: (tx) => {
          console.log(tx);
          setDeltas(new Set());
          client.waitForTransactionBlock({ digest: tx.digest }).then(() => {
            refetch();
          });
        },
        onError: (err) => {
          console.log(err);
        },
      },
    );
  };

  // const getLocalDelta = (localState: string[][]) => {
  //   const deltaIndices: [number, number][] = [];
  //   for (let row = 0; row < localState.length; row++) {
  //     for (let col = 0; col < localState[row].length; col++) {
  //       if (localState[row][col] !== "0") {
  //         deltaIndices.push([row, col]);
  //       }
  //     }
  //   }
  //   return deltaIndices;
  // };

  //   const getDelta = (initial: string[][], grid: string[][]) => {
  //     const deltaIndices: [number, number][] = [];

  //     for (let row = 0; row < initial.length; row++) {
  //       for (let col = 0; col < initial[row].length; col++) {
  //         if (initial[row][col] !== grid[row][col]) {
  //           deltaIndices.push([row, col]);
  //         }
  //       }
  //     }

  //     return deltaIndices;
  //   };

  return (
    <div>
      <Container>
        <HexColorPicker
          color={color}
          onChange={(color) => {
            setColor(color);
            setCursorSize(CursorSizes.Small);
          }}
        />
        <Flex gap="2" direction="row">
          <Button onClick={handleSubmitColors}> Submit Txn </Button>
          <Button
            onClick={() => {
              setColor("#ffffff");
              setCursorSize(CursorSizes.Medium);
            }}
          >
            Eraser &#9003;
          </Button>
          <RadioGroup.Root
            defaultValue={cursorSize}
            value={cursorSize}
            onValueChange={(value) => {
              setCursorSize(value as CursorSizes);
            }}
          >
            <Flex gap="2" direction="column">
              {cursorSelection.map((cursorSize) => {
                return (
                  <Text as="label" size="2" key={cursorSize}>
                    <Flex gap="2">
                      <RadioGroup.Item value={cursorSize} /> {cursorSize}
                    </Flex>
                  </Text>
                );
              })}
            </Flex>
          </RadioGroup.Root>
        </Flex>
        <ColorGrid
          colors={gridColors}
          localColorGrid={localGrid}
          setIsDragging={setIsDragging}
          onMouseMove={handleMouseMove}
          isDragging={isDragging}
        />
      </Container>
    </div>
  );
};

function getArrayFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") {
    throw new Error("Content not found");
  }

  const { pixels } = data.content.fields as { pixels: Array<Array<string>> };
  return pixels;
}
export default Canvas;
