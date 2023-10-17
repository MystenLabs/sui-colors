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

  console.log("parents", gridColors);
  useEffect(() => {
    if (!isLoading && !error && data?.data?.content?.fields?.pixels) {
      const currentCanvas = getArrayFields(data.data);
      setGridColors(currentCanvas);
    }
  }, [data, isLoading, error]);

  const handleSubmitColors = async () => {
    // todo fill in programmable txn block here
    const original_canvas = getArrayFields(data.data)!;
    const deltas = getDelta(original_canvas, gridColors);

    let transactionBlock = new TransactionBlock();
    for (const idx in deltas) {
      console.log(deltas[idx]);
      transactionBlock.moveCall({
        target: `0x3c5f9f43eccf2648855c6febf1143966d87541d47775b2b90c03f875da03cc71::board::update_single_pixel`,
        arguments: [
          transactionBlock.object(
            "0xe3390ae6a360a076b708691b2a1c24981b931e009cbf4aa6531e559c93d1f28c",
          ),
          transactionBlock.pure(deltas[idx][0]),
          transactionBlock.pure(deltas[idx][1]),
          transactionBlock.pure(color.slice(1, 7)),
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

  const getDelta = (initial: string[][], grid: string[][]) => {
    const deltaIndices: [number, number][] = [];

    for (let row = 0; row < initial.length; row++) {
      for (let col = 0; col < initial[row].length; col++) {
        if (initial[row][col] !== grid[row][col]) {
          deltaIndices.push([row, col]);
        }
      }
    }

    return deltaIndices;
  };

  return (
    <div>
      <Container>
        <HexColorPicker color={color} onChange={setColor} />
        {/* <div>{getArrayFields(data.data)}</div> */}
        <Button onClick={handleSubmitColors}> Submit Txn </Button>
        <ColorGrid
          colors={gridColors}
          selectedColor={color}
          onColorChange={setGridColors}
        />
      </Container>
    </div>
  );
};

function getArrayFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") {
    return null;
  }

  const { pixels } = data.content.fields as { pixels: Array<Array<string>> };
  return pixels;
}
export default Canvas;
