import { useState, useEffect } from "react";

import { DisplayCampaigns } from "@/components/campaigns";
import { useCampaignContext } from "@/contexts/campaignContext";
import { CampaignSummary } from "@/types/ICampaigns";

const Campaigns = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

  const { address, contract, getCampaigns } = useCampaignContext();

  const fetchCampaigns = async () => {
    setIsLoading(true);
    const data = await getCampaigns(0, 10);
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
