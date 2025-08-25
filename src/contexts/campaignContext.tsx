import { useContext, createContext } from "react";
import {
  useAddress,
  useContract,
  useContractWrite,
  useConnect,
  metamaskWallet,
  Proposal,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { Form, CampaignSummary } from "@/types/ICampaigns";

// Updated interfaces to match new contract structure

interface StateContextType {
  address: string;
  contract: any;
  connectWallet: () => Promise<void>;
  createCampaign: (form: Form) => Promise<void>;
  getCampaigns: (start: number, limit: number) => Promise<CampaignSummary[]>;
  getUserCampaigns: () => Promise<CampaignSummary[]>;
  donateToCampaign: (pId: number, amount: string) => Promise<any>;
  getDonation: (pId: number, donor: string) => Promise<string>;
  startVoting: (pId: number, votingDuration: number) => Promise<void>;
  createProposal: (pId: number, description: string) => Promise<void>;
  voteOnProposal: (pId: number, proposalIndex: number) => Promise<void>;
  getProposals: (pId: number) => Promise<Proposal[]>;
  finalizeCampaign: (pId: number) => Promise<void>;
  withdrawFunds: (pId: number) => Promise<void>;
}

const StateContext = createContext<StateContextType>({
  address: "",
  contract: null,
  connectWallet: async () => {},
  createCampaign: async () => {},
  getCampaigns: async () => [],
  getUserCampaigns: async () => [],
  donateToCampaign: async () => {},
  getDonation: async () => "0",
  startVoting: async () => {},
  createProposal: async () => {},
  voteOnProposal: async () => {},
  getProposals: async () => [],
  finalizeCampaign: async () => {},
  withdrawFunds: async () => {},
});

export const CampaignProvider = ({ children }: any) => {
  const { contract } = useContract(
    "0xb4300329dbDe259002E82574075B0BAB7DD01647"
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
          form.title,
          form.description,
          ethers.utils.parseEther(form.target),
          new Date(form.deadline).getTime(),
          form.image,
        ],
      });
      console.log("contract call success", data);
    } catch (error) {
      console.log("contract call failure", error);
    }
  };

  const getCampaigns = async (start: number, limit: number) => {
    if (!contract) return [];

    const campaigns = await contract.call("getCampaigns", [start, limit]);

    console.log("campaigns", campaigns);

    return campaigns.map((campaign: any, i: number) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(
        campaign.amountCollected.toString()
      ),
      image: campaign.image,
      phase: campaign.phase,
      votingDeadline: campaign.votingDeadline.toNumber(),
      winningProposalIndex: campaign.winningProposalIndex.toNumber(),
      proposalsCount: campaign.proposalsCount.toNumber(),
      pId: start + i,
    }));
  };

  const getUserCampaigns = async () => {
    if (!contract) return [];
    const numberOfCampaigns = await contract.call("numberOfCampaigns");
    const allCampaigns = await getCampaigns(0, numberOfCampaigns.toNumber());
    return allCampaigns.filter((campaign: any) => campaign.owner === address);
  };

  const donateToCampaign = async (
    pId: number,
    amount: string
  ): Promise<any> => {
    if (!contract) throw new Error("Contract is not defined");
    return contract.call("donateToCampaign", [pId], {
      value: ethers.utils.parseEther(amount),
    });
  };

  const getDonation = async (pId: number, donor: string): Promise<string> => {
    if (!contract) throw new Error("Contract is not defined");
    const donation = await contract.call("getDonation", [pId, donor]);
    return ethers.utils.formatEther(donation);
  };

  const startVoting = async (
    pId: number,
    votingDuration: number
  ): Promise<void> => {
    if (!contract) throw new Error("Contract is not defined");
    await contract.call("startVoting", [pId, votingDuration]);
  };

  const createProposal = async (
    pId: number,
    description: string
  ): Promise<void> => {
    if (!contract) throw new Error("Contract is not defined");
    await contract.call("createProposal", [pId, description]);
  };

  const voteOnProposal = async (
    pId: number,
    proposalIndex: number
  ): Promise<void> => {
    if (!contract) throw new Error("Contract is not defined");
    await contract.call("voteOnProposal", [pId, proposalIndex]);
  };

  const getProposals = async (pId: number): Promise<Proposal[]> => {
    if (!contract) throw new Error("Contract is not defined");
    const proposals = await contract.call("getProposals", [pId]);
    return proposals.map((proposal: any) => ({
      description: proposal.description,
      voteCount: ethers.utils.formatEther(proposal.voteCount.toString()),
    }));
  };

  const finalizeCampaign = async (pId: number): Promise<void> => {
    if (!contract) throw new Error("Contract is not defined");
    await contract.call("finalizeCampaign", [pId]);
  };

  const withdrawFunds = async (pId: number): Promise<void> => {
    if (!contract) throw new Error("Contract is not defined");
    await contract.call("withdrawFunds", [pId]);
  };

  return (
    <StateContext.Provider
      value={{
        address,
        contract,
        connectWallet,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donateToCampaign,
        getDonation,
        startVoting,
        createProposal,
        voteOnProposal,
        getProposals,
        finalizeCampaign,
        withdrawFunds,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useCampaignContext = () => useContext(StateContext);
