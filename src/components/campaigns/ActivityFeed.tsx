// src/components/campaign/CampaignHeader.tsx

import React from "react";
import { ethers } from "ethers";
import { Clock, Target, Users, CheckCircle, Vote, Coins } from "lucide-react";

import { CampaignSummary, Phase } from "@/types/ICampaigns"; // Assuming types are in this path
import { daysLeft } from "@/lib/utils"; // Assuming utils are in this path

// Define the component's props interface for type safety
interface CampaignHeaderProps {
  campaign: CampaignSummary;
  isOwner: boolean;
}

// Helper to get phase-specific display properties
const getPhaseInfo = (phase: Phase) => {
  switch (phase) {
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
    case Phase.Funding:
    default:
      return {
        name: "Funding",
        icon: <Target className="w-4 h-4" />,
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
        textColor: "text-blue-700 dark:text-blue-300",
        borderColor: "border-blue-200 dark:border-blue-800",
      };
  }
};

// Helper to format wallet addresses
const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Helper to safely format Wei to ETH
const formatWeiToEth = (wei: string | bigint): string => {
  try {
    return parseFloat(ethers.utils.formatEther(wei)).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  } catch (error) {
    console.error("Error formatting Wei:", error);
    return "0.0";
  }
};

const CampaignHeader: React.FC<CampaignHeaderProps> = ({
  campaign,
  isOwner,
}) => {
  // --- Data Formatting ---
  const phaseInfo = getPhaseInfo(campaign.phase);
  const amountRaisedETH = formatWeiToEth(campaign.amountCollected);
  const targetETH = formatWeiToEth(campaign.target);

  // Use BigInt for accurate percentage calculation to avoid floating point issues
  const progressPercentage =
    BigInt(campaign.target) > 0
      ? Number(
          (BigInt(campaign.amountCollected) * 100n) / BigInt(campaign.target)
        )
      : 0;

  // --- Dynamic Deadline Logic ---
  const relevantDeadline =
    campaign.phase === Phase.Voting
      ? campaign.votingDeadline
      : campaign.deadline;
  const remainingDays = daysLeft(relevantDeadline);
  const deadlineText =
    campaign.phase === Phase.Funding
      ? "Funding ends"
      : campaign.phase === Phase.Voting
      ? "Voting ends"
      : "Campaign ended";

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden mb-8 transition-colors duration-200">
      <div className="md:flex">
        {/* Campaign Image */}
        <div className="md:w-1/2">
          <img
            src={campaign.image || "https://via.placeholder.com/800x600"}
            alt={campaign.title}
            className="w-full h-64 md:h-full object-cover"
          />
        </div>

        {/* Campaign Info */}
        <div className="md:w-1/2 p-8">
          {/* Phase Badge & Owner Tag */}
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

          {/* Owner Address */}
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
                {amountRaisedETH} ETH
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                of {targetETH} ETH raised
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-1">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">{deadlineText}</span>
              </div>
              <div className="text-lg font-medium text-gray-900 dark:text-white">
                {Number(remainingDays) > 0
                  ? `${remainingDays} days left`
                  : "Ended"}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.min(Math.round(progressPercentage), 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-dark-green dark:bg-light-green h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
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
  );
};

export default CampaignHeader;
