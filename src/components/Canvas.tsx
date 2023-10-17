import React, { useState, useEffect } from "react";
import { Button, Container } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  useSignAndExecuteTransactionBlock,
  useSuiClient,
} from "@mysten/dapp-kit";
import ColorGrid from "./ColorGrid";
import { useGetCanvas } from "../useGetCanvas";
import { SuiObjectData } from "@mysten/sui.js/client";

const Canvas: React.FC = () => {
  const client = useSuiClient();

  const [color, setColor] = useState("#aabbcc");
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();

  const { handleGetCanvas } = useGetCanvas();
  const { data, isLoading, error, refetch } = handleGetCanvas();

  const [gridColors, setGridColors] = useState<string[][]>([]);
  const [localGrid, setLocalGrid] = useState<string[][]>([]);

  // Dragging Mouse
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (_e: React.MouseEvent) => {
    if (!isDragging) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (
    _e: React.MouseEvent,
    rowIndex: number,
    colIndex: number,
  ) => {
    if (isDragging) {
      const newColors = localGrid.map((row, rIndex) =>
        row.map((old_color, cIndex) =>
          rIndex === rowIndex && cIndex === colIndex ? color : old_color,
        ),
      );
      setLocalGrid(newColors);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
      if (currentCanvas) {
        setGridColors(currentCanvas);
        // Create a new grid with the same dimensions as currentCanvas
        const newLocalGrid = Array.from({ length: currentCanvas.length }, () =>
          Array(currentCanvas[0].length).fill("0"),
        );
        setLocalGrid(newLocalGrid);
      }
    }
  }, [data, isLoading, error]);

  const handleSubmitColors = async () => {
    const deltas = getLocalDelta(localGrid);

    let transactionBlock = new TransactionBlock();
    for (const idx in deltas) {
      transactionBlock.moveCall({
        target: `0x3c5f9f43eccf2648855c6febf1143966d87541d47775b2b90c03f875da03cc71::board::update_single_pixel`,
        arguments: [
          transactionBlock.object(
            "0xe3390ae6a360a076b708691b2a1c24981b931e009cbf4aa6531e559c93d1f28c",
          ),
          transactionBlock.pure(deltas[idx][0]),
          transactionBlock.pure(deltas[idx][1]),
          transactionBlock.pure(localGrid[deltas[idx][0]][deltas[idx][1]]),
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

  const getLocalDelta = (localState: string[][]) => {
    const deltaIndices: [number, number][] = [];
    for (let row = 0; row < localState.length; row++) {
      for (let col = 0; col < localState[row].length; col++) {
        if (localState[row][col] !== "0") {
          deltaIndices.push([row, col]);
        }
      }
    }
    return deltaIndices;
  };

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
        <HexColorPicker color={color} onChange={setColor} />
        <Button onClick={handleSubmitColors}> Submit Txn </Button>
        <ColorGrid
          colors={gridColors}
          selectedColor={color}
          localColorGrid={localGrid}
          onColorChange={setLocalGrid}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          //   selectedArea={selectedArea}
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
