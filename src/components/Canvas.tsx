import React, { useState } from "react";
import { Button, Container } from "@radix-ui/themes";
import { HexColorPicker } from "react-colorful";
import {
  useSignAndExecuteTransactionBlock,
  useCurrentAccount,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import ColorGrid from "./ColorGrid";

// {currentAccount && (
//     <>
//         <div>
//             <button
//                 onClick={() => {
//                     signAndExecuteTransactionBlock(
//                         {
//                             transactionBlock: new TransactionBlock(),
//                             chain: 'sui:devnet',
//                         },
//                         {
//                             onSuccess: (result) => {
//                                 console.log('executed transaction block', result);
//                                 setDigest(result.digest);
//                             },
//                         },
//                     );
//                 }}
//             >
//                 Sign and execute transaction block
//             </button>
//         </div>

const Canvas: React.FC = () => {
  //   const initialCanvas = Array.from({ length: 100 }, () =>
  //     Array(100).fill("#ffffff"),
  //   );

  const [color, setColor] = useState("#aabbcc");
  const { mutate: signAndExecuteTransactionBlock } =
    useSignAndExecuteTransactionBlock();
  const currentAccount = useCurrentAccount();

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

  const initialCanvas = data.data?.content?.fields?.pixels;
  //   const initialCanvas: string[][] = data.data?.content?.fields?.pixels;

  const [gridColors, setGridColors] = useState<string[][]>(initialCanvas);

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

  const handleSubmitColors = () => {
    // todo fill in programmable txn block here
    const delta = getDelta(initialCanvas, gridColors);
    console.log(delta);
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
