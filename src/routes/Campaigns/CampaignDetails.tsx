import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Target,
  Users,
  CheckCircle,
  Vote,
  Coins,
} from "lucide-react";
import { useCampaignContext } from "@/contexts/campaignContext";
import { CampaignSummary } from "@/types/ICampaigns";
import { daysLeft } from "@/lib/utils";
import ActionPanel from "@/components/campaigns/ActionPanel";

enum Phase {
  Funding = 0,
  Voting = 1,
  Finalized = 2,
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    getCampaignSummary,
    address,
    isLoading: contractLoading,
  } = useCampaignContext();

  const [campaign, setCampaign] = useState<CampaignSummary>(
    (location.state as CampaignSummary) || null
  );
  const [isLoading, setIsLoading] = useState(!campaign);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      // Wait for contract to load before attempting to fetch campaign
      if (campaign || !id || contractLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const campaignData = await getCampaignSummary(parseInt(id));
        setCampaign(campaignData);
      } catch (err) {
        setError("Failed to load campaign data");
        console.error("Error fetching campaign:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaign();
  }, [id, campaign, getCampaignSummary, contractLoading]);

  const isOwner = campaign?.owner === address;

  const getPhaseInfo = (phase: number) => {
    switch (phase) {
      case Phase.Funding:
        return {
          name: "Funding",
          icon: <Target className="w-4 h-4" />,
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
          textColor: "text-blue-700 dark:text-blue-300",
          borderColor: "border-blue-200 dark:border-blue-800",
        };
      case Phase.Voting:
        return {
          name: "Voting",
          icon: <Vote className="w-4 h-4" />,
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
          textColor: "text-orange-700 dark:text-orange-300",
          borderColor: "border-orange-200 dark:border-orange-800",
        };
      case Phase.Finalized:
        return {
          name: "Finalized",
          icon: <CheckCircle className="w-4 h-4" />,
          bgColor: "bg-green-100 dark:bg-green-900/30",
          textColor: "text-green-700 dark:text-green-300",
          borderColor: "border-green-200 dark:border-green-800",
        };
      default:
        return {
          name: "Unknown",
          icon: <Target className="w-4 h-4" />,
          bgColor: "bg-gray-100 dark:bg-gray-900/30",
          textColor: "text-gray-700 dark:text-gray-300",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };
  const remainingDays = daysLeft(campaign.deadline);
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleGoBack = () => {
    navigate("/campaigns");
  };

  if (isLoading || contractLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-green dark:border-light-green mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading campaign...
          </p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Campaign not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The campaign you're looking for doesn't exist.
          </p>
          <button
            onClick={handleGoBack}
            className="bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const phaseInfo = getPhaseInfo(campaign.phase);
  const progressPercentage = Math.min(
    (parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100,
    100
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pt-20">
      {/* Navigation */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={handleGoBack}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8 transition-colors duration-200">
          <div className="md:flex">
            {/* Campaign Image */}
            <div className="md:w-1/2">
              <img
                src={
                  campaign.image ||
                  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"
                }
                alt={campaign.title}
                className="w-full h-64 md:h-full object-cover"
              />
            </div>

            {/* Campaign Info */}
            <div className="md:w-1/2 p-8">
              {/* Phase Badge */}
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${phaseInfo.bgColor} ${phaseInfo.textColor} ${phaseInfo.borderColor}`}
                >
                  {phaseInfo.icon}
                  <span className="ml-1">{phaseInfo.name} Phase</span>
                </div>
                {isOwner && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Coins className="w-3 h-3 mr-1" />
                    Owner
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {campaign.title}
              </h1>

              {/* Owner */}
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  Created by {formatAddress(campaign.owner)}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {campaign.amountCollected} ETH
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    of {campaign.target} ETH raised
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {campaign.phase === Phase.Funding
                        ? "Funding"
                        : campaign.phase === Phase.Voting
                        ? "Voting"
                        : "Campaign"}{" "}
                      ends
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {remainingDays} days
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-dark-green dark:bg-light-green h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Description Preview */}
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {campaign.description.length > 150
                  ? `${campaign.description.slice(0, 150)}...`
                  : campaign.description}
              </p>
            </div>
          </div>
        </div>

        {/* TODO: Progress Section */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 transition-colors duration-200">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Campaign Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed funding progress, timeline, and milestones will be
            displayed here.
          </p>
          {/* TODO: Implement detailed progress tracking */}
        </div>

        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 transition-colors duration-200">
          {campaign && <ActionPanel campaign={campaign} isOwner={isOwner} />}
        </div>

        {/* TODO: Details Section */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8 transition-colors duration-200">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Campaign Details
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Full description, campaign owner information, and additional details
            will be displayed here.
          </p>
          {/* TODO: Implement detailed campaign information */}
        </div>

        {/* TODO: Activity Section */}
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-200">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Campaign Activity
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Proposals ({campaign.proposalsCount} total), voting results, and
            donation history will be displayed here.
          </p>
          {/* TODO: Implement proposals list, voting interface, and activity feed */}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
