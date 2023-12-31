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
  target: `${packageId}::board::update_single_pixel`,
  arguments: [
    transactionBlock.object(
      "0xdd118df8a84b5a9e0b4024b3d848c06ab46fc2c17a58cbed616f15a7938ab5db"
    ),
    transactionBlock.pure(50),
    transactionBlock.pure(50),
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
