import React, { useState, useEffect } from "react";
import { Button, Container, Text } from "@radix-ui/themes";
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
        target: `0x24ddd1885289fef34b2c7c5516bce3e684519edbb9383476a033cb8252e5fda7::board::add_or_update_board`,
        arguments: [
          transactionBlock.object(
            "0x5454237f232a31874fc5fd2d2128d46cd43f12146b7af2ccc6615e16e56409c0",
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
          client.waitForTransactionBlock({ digest: tx.digest }).then(() => {
            refetch();
          });
        },
        onError: (err) => {
          console.log(err);
        },
      },
    );

    // console.log(delta);
  };

  //   const whiteSquares = Array.from({ length: 100 }, () =>
  //     Array(100).fill("#ffffff"),
  //   );

  //   const [gridColors, setGridColors] = useState<string[][]>(currentCanvas!);

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
