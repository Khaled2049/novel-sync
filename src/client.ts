import { createThirdwebClient, defineChain, getContract } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
const clientId = import.meta.env.VITE_TEMPLATE_CLIENT_ID;

export const client = createThirdwebClient({
  clientId: clientId,
});

// connect to your contract
export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: import.meta.env.VITE_TEMPLATE_CONTRACT_ADDRESS,
});
