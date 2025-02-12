import { useContext, createContext } from "react";

import {
  useAddress,
  useContract,
  useContractWrite,
  useConnect,
  metamaskWallet,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { Campaign, DonateParams, Donation, Form } from "@/types/ICampaigns";

interface CampaignContextType {
  address: string;
  contract: any;
  connectWallet: () => Promise<void>;
  createCampaign: (form: Form) => Promise<void>;
  getCampaigns: () => Promise<Campaign[]>;
  getUserCampaigns: () => Promise<Campaign[]>;
  donate: (params: DonateParams) => Promise<any>;
  getDonations: (pId: number) => Promise<Donation[]>;
}

const CampaignContext = createContext<CampaignContextType>({
  address: "",
  contract: null,
  connectWallet: async () => {},
  createCampaign: async () => {},
  getCampaigns: async () => [],
  getUserCampaigns: async () => [],
  donate: async () => {},
  getDonations: async () => [],
});

export const CampaignContextProvider = ({ children }: any) => {
  const { contract } = useContract(
    import.meta.env.VITE_TEMPLATE_CONTRACT_ADDRESS as string
  );

  const { mutateAsync: createCampaign } = useContractWrite(
    contract,
    "createCampaign"
  );

  const address = useAddress() || "";
  const connect = useConnect();

  const connectWallet = async () => {
    try {
      const wallet = metamaskWallet();
      await connect(wallet);
      console.log("Wallet connected successfully");
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const publishCampaign = async (form: Form): Promise<void> => {
    try {
      const data = await createCampaign({
        args: [
          address, // owner
          form.title, // title
          form.description, // description
          form.target,
          new Date(form.deadline).getTime(), // deadline,
          form.image,
        ],
      });

      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async () => {
    if (!contract) return [];

    const campaigns: any[] = await contract.call("getCampaigns");

    const parsedCampaings: Campaign[] = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      pId: i,
    }));

    return parsedCampaings;
  };

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter(
      (campaign) => campaign.owner === address
    );

    return filteredCampaigns;
  };

  const donate = async ({ pId, amount }: DonateParams): Promise<any> => {
    if (!contract) throw new Error("Contract is not defined");
    const data = await contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });

    return data;
  };

  const getDonations = async (pId: number): Promise<Donation[]> => {
    if (!contract) throw new Error("Contract is not defined");
    const donations: [string[], ethers.BigNumber[]] = await contract.call(
      "getDonators",
      [pId]
    );
    const numberOfDonations = donations[0].length;

    const parsedDonations: Donation[] = [];

    for (let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString()),
      });
    }

    return parsedDonations;
  };

  return (
    <CampaignContext.Provider
      value={{
        address,
        contract,
        connectWallet,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => useContext(CampaignContext);
