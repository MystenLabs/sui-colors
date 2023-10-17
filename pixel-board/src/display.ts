import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const phrase = process.env.ADMIN_PHRASE;
const fullnode = process.env.FULLNODE!;
const keypair = Ed25519Keypair.deriveKeypair(phrase!);
const adminAddress = keypair.getPublicKey().toSuiAddress();
const client = new SuiClient({
  url: fullnode,
});

const packageId = process.env.PACKAGE_ID;
const publisherId = process.env.PUBLISHER_ID!;
const WEATHER_NFT_TYPE = `${packageId}::weather::WeatherNFT`;
const CITY_WEATHER_ORACLE_TYPE = `${packageId}::weather::CityWeatherOracle`;

type DisplayFieldsType = {
  keys: string[];
  values: string[];
};

function getWeatherNFTDisplayFields(): DisplayFieldsType {
  return {
    keys: ["name", "image_url"],
    values: [
      "{weather.name}, {weather.country}",
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Winkel_triple_projection_SW.jpg/1920px-Winkel_triple_projection_SW.jpg",
    ],
  };
}

function getCityWeatherOracleDisplayFields(): DisplayFieldsType {
  return {
    keys: ["image_url"],
    values: ["https://weather-sui.digkas.nl/weather-icon/{weather_id}"],
  };
}

let transactionBlock = new TransactionBlock();
const weatherNFTdisplayFields = getWeatherNFTDisplayFields();
const weatherNFTdisplay = transactionBlock.moveCall({
  target: "0x2::display::new_with_fields",
  arguments: [
    transactionBlock.object(publisherId),
    transactionBlock.pure(weatherNFTdisplayFields.keys),
    transactionBlock.pure(weatherNFTdisplayFields.values),
  ],

  typeArguments: [WEATHER_NFT_TYPE],
});
transactionBlock.moveCall({
  target: "0x2::display::update_version",
  arguments: [weatherNFTdisplay],
  typeArguments: [WEATHER_NFT_TYPE],
});

const cityWeatherOracleDisplayFields = getCityWeatherOracleDisplayFields();
const cityWeatherOracleDisplay = transactionBlock.moveCall({
  target: "0x2::display::new_with_fields",
  arguments: [
    transactionBlock.object(publisherId),
    transactionBlock.pure(cityWeatherOracleDisplayFields.keys),
    transactionBlock.pure(cityWeatherOracleDisplayFields.values),
  ],

  typeArguments: [CITY_WEATHER_ORACLE_TYPE],
});
transactionBlock.moveCall({
  target: "0x2::display::update_version",
  arguments: [cityWeatherOracleDisplay],
  typeArguments: [CITY_WEATHER_ORACLE_TYPE],
});

transactionBlock.transferObjects(
  [weatherNFTdisplay, cityWeatherOracleDisplay],
  transactionBlock.pure(adminAddress)
);

transactionBlock.setGasBudget(10000000);
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
