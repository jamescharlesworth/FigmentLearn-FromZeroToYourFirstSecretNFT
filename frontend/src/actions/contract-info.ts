import { getClient  } from "../utils/keplr";

type TokenResponse = {
    nft_dossier: {
        private_metadata: {
            extension: {
                description: string,
                name: string,
                image: string
            }
        },
        public_metadata: {
			extension: {
				name: string;
				description: string;
				image: string;
			}
		};
    }
}

type ContractInfoResponse = {
    ContractInfo: {
        codeId: string;
        creator: string;
        label: string;
    },
} 


export const contractInfo = async (contractAddress: string): Promise<ContractInfoResponse> => {
    const client = await getClient();
    const response: ContractInfoResponse = await client.query.compute.contractInfo(contractAddress);
    return response;
}