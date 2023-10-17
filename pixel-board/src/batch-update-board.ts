import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

const phrase = process.env.ADMIN_PHRASE;
const fullnode = process.env.FULLNODE!;
const keypair = Ed25519Keypair.deriveKeypair(phrase!);
const client = new SuiClient({
  url: fullnode,
});

const packageId = process.env.PACKAGE_ID;

let transactionBlock = new TransactionBlock();

transactionBlock.moveCall({
  target: `${packageId}::board::batch_update_board`,
  arguments: [
    transactionBlock.object(
      "0x8f2aee48cb04aaf7987eb40699fd2504722607de924d3132bb3dad8ad3c77ab3"
    ),
    transactionBlock.pure(0),
    transactionBlock.pure(2),
    transactionBlock.pure(1),
    transactionBlock.pure(20),
    transactionBlock.pure("ffffff"),
  ],
});

transactionBlock.setGasBudget(50000000000);
client
  .signAndExecuteTransactionBlock({
    transactionBlock,
    requestType: "WaitForLocalExecution",
    options: {
      showObjectChanges: true,
      showEffects: true,
    },
    signer: keypair,
  })
  .then((result) => {
    console.log(result);
  });
