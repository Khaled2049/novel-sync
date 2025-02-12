import { useState, useEffect } from "react";

import { DisplayCampaigns } from "@/components/campaigns";
import { useCampaignContext } from "@/contexts/campaignContext";
import { Campaign } from "@/types/ICampaigns";

const Campaigns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const { address, contract, getCampaigns } = useCampaignContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (contract) fetchCampaigns();
  }, [address, contract]);

  return (
    <DisplayCampaigns
      title="All Campaigns"
      isLoading={isLoading}
      campaigns={campaigns}
    />
  );
};

export default Campaigns;
