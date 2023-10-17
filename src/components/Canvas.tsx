import React, { useState } from "react";
import { Button, Container } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import {
  useSignAndExecuteTransactionBlock,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import ColorGrid from "./ColorGrid";

const Canvas: React.FC = () => {
  const [color, setColor] = useState("#aabbcc");
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  //   const currentAccount = useCurrentAccount();

  const handleSubmitColors = async () => {
    // todo fill in programmable txn block here
    // const delta = getDelta(stringArray, gridColors);
    let transactionBlock = new TransactionBlock();
    console.log(color);
    transactionBlock.moveCall({
      target: `0x24ddd1885289fef34b2c7c5516bce3e684519edbb9383476a033cb8252e5fda7::board::add_or_update_board`,
      arguments: [
        transactionBlock.object(
          "0x5454237f232a31874fc5fd2d2128d46cd43f12146b7af2ccc6615e16e56409c0",
        ),
        transactionBlock.pure(0),
        transactionBlock.pure(0),
        transactionBlock.pure(color.slice(1, 6)),
      ],
    });

    signAndExecuteTransactionBlock(
      {
        transactionBlock,
        chain: "sui:testnet",
      },
      {
        onSuccess: (res) => {
          console.log(res);
        },
        onError: (err) => {
          console.log(err);
        },
      },
    );

    // console.log(delta);
  };

  const id: string =
    "0x5454237f232a31874fc5fd2d2128d46cd43f12146b7af2ccc6615e16e56409c0";

  const { data, isLoading, error, refetch } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
      showOwner: true,
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  if (!data.data) return <div>Not found</div>;

  const dataObject = data.data?.content?.fields?.pixels;

  const stringArray: string[][] = dataObject.map((row) =>
    row.map((color: string) => "#" + color.toString()),
  );

  console.log(stringArray);

  //   const whiteSquares = Array.from({ length: 100 }, () =>
  //     Array(100).fill("#ffffff"),
  //   );

  const [gridColors, setGridColors] = useState<string[][]>(stringArray);

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

export default Canvas;
