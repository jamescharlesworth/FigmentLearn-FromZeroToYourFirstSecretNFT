<script lang="ts">
	import Agent from '../components/agent.svelte';
	import { onMount } from 'svelte';
	import { getClient, login, isLoggedIn, logout } from '../utils/keplr';
	import { getTokens } from '../actions/get-tokens';
	import { mint } from '../actions/mint';
	import { setViewingKey } from '../actions/set-viewingkey';
	import { instantiate } from '../actions/instantiate';
	import { contractInfo } from '../actions/contract-info';
	import Error from '../components/error.svelte';
	import Code from '../components/code.svelte';
	import { Wallet } from 'secretjs';


	let contractAddress = ''
	const codeHash = import.meta.env.VITE_SECRET_CONTRACT_HASH as string;
	const codeId = import.meta.env.VITE_SECRET_CODE_ID;
	const defaultContractAddress = import.meta.env.VITE_SECRET_DEFAULT_CONTRACT_ADDRESS;
	let viewingKey = 'your_viewing_key';
	let newAgentName = 'AgentMcSecret';
	let contractInfoData;
	let tokens = [];

	let secretjs;
	let walletAddress;
	let loggedIn = isLoggedIn();


	const getContractData = async (addr = contractAddress) => {
		if (addr) {
			const resp = await contractInfo(addr);
			contractInfoData = resp.ContractInfo;
		}
	}

	// $: contractAddress && getContractData()

	onMount(async () => {
		contractAddress = window.localStorage.getItem('contractAddress');
		const vk = window.localStorage.getItem('viewingKey');
		if (vk) viewingKey = vk;
		walletAddress = window.localStorage.getItem('walletAddress');
		if (walletAddress) {
			secretjs = await login();
			loggedIn = true;
			if (contractAddress) {
				const resp = await getTokens({
					contractAddress,
					codeHash
				});
				tokens = resp.token_list.tokens;
			}
			// 
			if (contractAddress) {
				await getContractData(contractAddress);
			}
			walletAddress = secretjs.address;
			updatedCreator();
		
		}



	});
	console.log('wal', walletAddress);

	const handleLogin = async () => {
		secretjs = await login();
		loggedIn = true;
		window.localStorage.setItem('walletAddress', secretjs.address);
		walletAddress = secretjs.address;
		if (contractAddress) {
			try {
				const resp = await getTokens({
					contractAddress,
					codeHash
				});
				tokens = resp.token_list.tokens;
				await getContractData()
				updatedCreator();
			} catch(ex) {
				console.log(ex);
				tokens = [];
			}
		}

	};

	let isCreator;

	const updatedCreator = () => {
		isCreator = walletAddress
		&& contractInfoData?.creator
		&& contractInfoData?.creator === walletAddress;
	}
	
	const handleLogout = async () => {
		logout()
		loggedIn = false;
		window.localStorage.setItem('walletAddress', '');
		walletAddress = ''
	};

	let minting = false;
	let mintError;

	const mintAgent = async () => {
		minting = true;

		try {
			const resp = await mint({ agentName: newAgentName, contractAddress, codeHash });
			if (resp.error) {
				mintError = resp.error;
			} else {
				mintError = null;
			}
		} catch(ex) {
			console.log(ex);
		}
		
		const resp = await getTokens({
			contractAddress,
			codeHash
		});
		tokens = resp.token_list.tokens;
		minting = false;
		updatedCreator();
	};

	const handleClickSetViewingKey = async () => {
		minting = true;
		try {
			await setViewingKey({
				contractAddress,
				codeHash,
				viewingKey,
			});
			const resp = await getTokens({
				contractAddress,
				codeHash
			});
			tokens = resp.token_list.tokens;
		} catch(ex) {
			console.log(ex);
		}
		

		minting = false;
	};

	const handleDeleteContract = () => {
		window.localStorage.setItem('contractAddress', '');
		window.localStorage.setItem('viewingKey', 'your_viewing_key');
		contractAddress = ''
		tokens = [];
		updatedCreator();
		viewingKey = 'your_viewing_key';
	}
	const handleCreateNewContract = async () => {
		try {
			const address = await instantiate({
				codeId,
				codeHash,
				label: `MyNewContract-${Math.random() * 10000000}`
			});
			console.log('new address', address);
			window.localStorage.setItem('contractAddress', address);
			contractAddress = address;
			updatedCreator();
		} catch(ex) {
			console.log(ex);
		}
	}
	const saveContractAddress = async (evt) => {
		const address = evt.target.value
		console.log('new address', address);
		window.localStorage.setItem('contractAddress', address);
		contractAddress = address;
		try {
			const resp = await getTokens({
				contractAddress,
				codeHash
			});
			tokens = resp.token_list.tokens;
		} catch(ex) {
			console.log(ex);
			tokens = [];
		}

	}
	const onBurn = async () => {
		const resp = await getTokens({
			contractAddress,
			codeHash,
		});
		tokens = resp.token_list.tokens;
	}
</script>

<div class="container">
	
		<div><h1 class="text-center">Welcome to SecretAgents</h1></div>


		<div>
			<h1>Uploading the Contract</h1>

			<p>Deploying and executing a cosmwasm contract is a 3 step process rather than 2 like Ethereum.
				You can read more about the process in detail (uploading, instantiating and executing) on <a href="https://docs.scrt.network/dev/quickstart.html#create-initial-smart-contract">docs.srct.network</a>.
			</p>
			<p>For the purpose of this example the contract has already been uploaded to testnet and
				can be found at code id <code>{codeId}</code>. This utilizes the uploaded contract and allows
				the user to instantiate and execute 
			</p>
		</div>
		<hr class="break mt-20" />
		<div>
			<h1>Login</h1>
			<p>
				Before interacting with Secret Network you need to authenticate. You can do this using the <a href="https://www.keplr.app/">keplr wallet</a>.
				Once you have the <a href="https://chrome.google.com/webstore/detail/keplr/dmkamcknogkgcdfhhbddcghachkejeap">chrome extension installed</a>
				click the login button below.
			</p>
			{#if loggedIn}
				<button class="full-width p-15 border-solid text-center text-bold" on:click={handleLogout}>Logout (Logged in to {walletAddress})</button>
		
			{:else}
				<button class="full-width p-15 border-solid text-center text-bold" on:click={handleLogin}>1. Login</button>
			{/if}
			
			
		</div>

		<hr class="break mt-20" />
		<div>
			<h1>Instantiating the Contract</h1>
			<p>Instantiation can be done using the <a href="https://github.com/scrtlabs/secret.js">secretjs</a> library as done in <a href="https://github.com/scrtlabs/secret.js#secretjstxcomputeinstantiatecontract">this</a> example.</p>
			<p>Click the Instantiate button bellow to do so. (this app stores the contract address in localStorage to persist across reloads. Your contract will
				be different than other users unless you share the contract address with them).</p>
		
			<button class="full-width p-15 border-solid text-center text-bold" on:click={handleCreateNewContract}>1. Instantiate New Contract</button>
			{#if contractAddress}
			<div class="p-20 border-solid">
				<div><p class="mr-5">Contract: </p></div>
				<div class="flex h-50">
					<input type="text" value={contractAddress} disabled class="px-5 flex-grow mr-5" />
					<button on:click={handleDeleteContract}>Delete</button>
				</div>
				<div class="mt-20">
					<p>contract info for {contractAddress}</p>
				</div>
				{#if contractInfoData}
				<div>
					<ul>
						<li>codeId: {contractInfoData.codeId}</li>
						<li>creator: {contractInfoData.creator}
							- 
							<b>
							{#if isCreator}
								Hey, its you!
							{:else}
								Someone else
							{/if}
							</b>

						</li>
						<li>label: {contractInfoData.label}</li>
					</ul>
				</div>
				{/if}
			</div>
			{/if}
			<div class="mt-20">
				<h4>Or Use Existing Contract</h4>
				<p>Or set an existing the contract address to manually, try using contract address <code class="inline">{defaultContractAddress}</code></p>
				<p>This will allow you to view the NFT's using the viewing key.</p>
				<div>
					<input placeholder="Paste contract address" name="contractAddress" class="full-width border-box  border-solid p-15 box-box" on:blur={saveContractAddress}>
				</div>
			</div>
			

		</div>
		<hr class="break mt-20" />
		<div>
				<h1>Set Viewing Key</h1>
				<p>As the contact owner you dont need to set the viewing key.  It has been set to <code class="inline">your_private_key</code> for the contract example here.</p>
				<p>You can choose to provide someone else access to the private data on the contract through the viewing key.</p>
				
				<div class="p-15 border-solid">
					<input name="viewingKey" class="full-width border-box  border-solid p-15 box-box" bind:value={viewingKey}>
				</div>
				<button class="full-width p-15 border-solid text-center text-bold" disabled={minting || !isCreator}  on:click={handleClickSetViewingKey}>
					2. Set ViewingKey
					{#if !isCreator}
						(only the creator (not you) can set the viewing key)
					{/if}
				</button>	
			
		</div>
		<hr class="break mt-20" />
		<div>
			
			<h1>Mint the Agent</h1>
			<p>
				Minting the agent will generate the NFT. This is done by <a href="https://github.com/scrtlabs/secret.js#broadcasting-transactions">broadcasting a transaction</a>.
			</p>

			
			<div class="p-15 border-solid">
				<input name="newAgentName" class="full-width border-box  border-solid p-15 box-box" bind:value={newAgentName} />
			</div>
			<button disabled={minting || !isCreator}  class="full-width p-15 border-solid text-center text-bold"  on:click={mintAgent}>
				3. Recruit the Agent
				{#if !isCreator}
					(only the creator (not you) can recruit)
				{/if}
			</button>	
			{#if mintError} 
				<Error>{mintError}</Error>
			{/if}
			
		</div>
	<hr class="break mt-20" />

	{#if contractAddress}
		<div>
			<h2>
				My Agents
				
			</h2>

			<div class="flex md:flex-col">
				{#each tokens as token}
					<Agent
						id={token}
						viewingKey={viewingKey}
						contractAddress={contractAddress}
						codeHash={codeHash}
						onBurn={onBurn}
					/>
				{:else}
					<div class="loader" />
				{/each}
			</div>
		</div>
	{/if}

</div>

<style>
	button {
		cursor: pointer;
	}
	.container {
		max-width: 1200px;
		margin: 0 auto;
		font-family:Arial, Helvetica, sans-serif
	}
	.overflow-scroll {
		overflow: scroll;
	}
	.border-box {
		box-sizing: border-box;
	}
	.text-center {
		text-align: center;
	}
	.px-5 {
		padding: 0 5px;
	}
	.mr-5 {
		margin-right: 5px;
	}
	.mt-20 {
		margin-top:20px;
	}
	.h-50 {
		height: 50px;
	}

	.p-20 {
		padding:20px;
	}
	.p-15 {
		padding: 15px;
	}

	.border-solid {
		border: 1px solid #ccc;
	}
	.inline {
		display:inline;
	}

	.full-width {
		width: 100%;
	}
	.text-bold {
		font-weight: bold;
	}



	.flex {
		display: flex;
	}
	.flex-grow {
		flex: 1;
	}
	.loader {
		background-image: url('https://scrt.network/assets/img/logo-seal-outline-white.f9cad178.svg');
		background-size: contain;
		filter: brightness(0);
		width: 50px;
		height: 50px;
		animation: spin 2s linear infinite;
	}
	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media only screen and (max-width: 600px) {
		.md\:flex-col {
			flex-direction: column;
		}
	}
</style>
