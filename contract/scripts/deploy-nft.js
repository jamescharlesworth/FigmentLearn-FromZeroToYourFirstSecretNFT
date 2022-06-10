const {
  Wallet,
  SecretNetworkClient
} = require("secretjs");
const path = require('path');
const fs = require("fs");
const { program } = require('commander');

// Load environment variables
require("dotenv").config({ path: '../.env.production'});


const main = async ({ name = '', symbol = '', entropy ='', label = "sSCRT" } = {}) => {

  const mnemonic = process.env.VITE_MNEMONIC;
  const grpcWebUrl = process.env.VITE_SECRET_GRPC_URL;
  const chainId = process.env.VITE_SECRET_CHAIN_ID;
  const wallet = new Wallet(mnemonic);

  console.log(`Wallet address=${wallet.address}`);
  console.log("Uploading contract");

  const secretjs = await SecretNetworkClient.create({
    grpcWebUrl,
    chainId,
    wallet: wallet,
    walletAddress: wallet.address,
  });

  const wasmByteCode = fs.readFileSync(
    path.join(__dirname, '/../my-snip721/contract.wasm.gz')
  );
   try {
    const tx = await secretjs.tx.compute.storeCode(
      {
        sender: wallet.address,
        wasmByteCode,
        source: "",
        builder: "",
      },
      {
        gasLimit: 5_000_000,
      },
    );
    const codeId = Number(
      tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
        .value,
    );
    console.log(`codeId: ${codeId}`);
  
    const codeHash = await secretjs.query.compute.codeHash(codeId);
    console.log(`codeHash: ${codeHash}`)
  

    console.log('codeId', codeId);
   } catch(ex) {
     debugger;
     console.log(ex);
   }
  

   console.log('Created contract succesfully!');
}


program
  .option('-n, --name <string>', 'Contract Name', '')
  .option('-s, --symbol <string>', 'Contract Symbol', '')
  .option('-e, --entropy <string>', 'Entroy', '')
  .option('-l, --label <string>', 'Contract Label', 'sSCRT');

program.parse();
const options = program.opts();

main(options).catch((err) => {
  console.error(err);
});
