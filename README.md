# FigmentLearn-FromZeroToYourFirstSecretNFT

This is fork of the <a href="https://learn.figment.io/tutorials/create-your-first-secret-nft">Figment Secret NFT tutorial</a> written by Florian Uhde. Some of the key differences in following that tutorial include:

 - Integration with Keplr wallet
 - No API routes - all transactions are broadcast from the dApp and clientside only
 - Each user instantiates their own contract based off of <a href="https://secretnodes.com/secret/chains/secret-4/blocks/3797609/transactions/9268F2D526B3012E71FAF60644A90E4C0E8B5FB3AF9B6BA9DDA49CF09F39520F">code ID 532 secret-4 (mainnet)</a> and  code ID <a href="https://secretnodes.com/secret/chains/pulsar-2/blocks/3219046/transactions/2617DBE2A896D39AD7ACDA2E3D1DA0ED56D92DD1629B32F747B53B23DFF8526A">9744 on testnet pulsar-2 (testnet)</a>.
 - There is a [scripts directory](https://github.com/jamescharlesworth/FigmentLearn-FromZeroToYourFirstSecretNFT/tree/main/contract/scripts) to execute commands in node.js serverside, invoked through command line
 - The [snip721 code](https://github.com/jamescharlesworth/FigmentLearn-FromZeroToYourFirstSecretNFT/tree/main/contract) is a github submodule. Since writing this repo and the tutorial the contract has changed a bit, including breaking changes such as metadata living under `private_metadata.extension.<key>` wheras in the older version of the contract it was `private_metadata.<key>`.
 - Integration with [localsecret](https://docs.scrt.network/dev/LocalSecret.html#secretcli) to interact and run the cosmwasm js/secret node locally. This is good if you intend on making changes to the contract itself.




secretecli production settings:

```bash
> secretecli config
{
	"chain-id": "secret-4",
	"keyring-backend": "os",
	"output": "json",
	"node": "https://secret-4.api.trivium.network:26657/",
	"broadcast-mode": "sync"
}
```

secretcli testnet settings:
```bash
> secretecli config
{
	"chain-id": "pulsar-2",
	"keyring-backend": "test",
	"output": "json",
	"node": "https://rpc.pulsar.griptapejs.com:443",
	"broadcast-mode": "sync"
}
```
You can set these configs via command one at a time (is there a way to have profiles?)
```bash
secretcli config node <node>
secretcli config chain-id <node>
secretcli config keyring-backend <os | test>
```