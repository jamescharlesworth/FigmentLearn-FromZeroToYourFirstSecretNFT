import { getClient } from "../utils/keplr";


type InstantiateProps = {
    name?: string,
    symbol?: string,
    entropy?: string,
    codeId: number,
    codeHash: string,
    label: string
}

export const instantiate = async (props: InstantiateProps): Promise<string> => {
    const {
        name = '',
        symbol = '',
        entropy = '',
        codeId,
        codeHash,
        label,
    } = props
    
    const client = await getClient();
    let hash = codeHash;
    if (!hash) {
        hash = await client.query.compute.codeHash(codeId);
    }

    const initMsg = {
        /// name of token contract
        name,
        /// token contract symbol
        symbol,
        /// entropy used for prng seed
        entropy,
        /// optional privacy configuration for the contract
        config: {
            public_owner: true,
            enable_burn: true
        },
    };
    const opts = {
        sender: client.address,
        codeId: codeId,
        codeHash: hash, // optional but way faster
        initMsg,
        label,
        initFunds: [], // optional
    };
    console.log('trying to instantiat with:')
    console.log(opts);
    const instantiateResponse = await client.tx.compute.instantiateContract(opts, {
        gasLimit: 100_000,
    });
  
      if (instantiateResponse?.arrayLog) {
        const contractAddress = instantiateResponse.arrayLog.find(
          (log) => log.type === "message" && log.key === "contract_address",
        ).value;
        if (contractAddress) {
            console.log(`contractAddress: ${contractAddress}`);  
            console.log('Created contract succesfully!');
            return contractAddress;
        }
      }

    console.log(instantiateResponse);
    throw new Error('could not instatiate contract');
}