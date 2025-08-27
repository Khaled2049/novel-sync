import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Grid,
  List,
  Loader2,
  Calendar,
  Target,
  TrendingUp,
} from "lucide-react";
import FundCard from "./FundCard";
import { CampaignSummary, Phase } from "@/types/ICampaigns";

interface DisplayCampaignsProps {
  title: string;
  isLoading: boolean;
  campaigns: CampaignSummary[];
}

export const phaseMap: { [key in Phase]: string } = {
  [Phase.Funding]: "funding",
  [Phase.Voting]: "voting",
  [Phase.Finalized]: "finalized",
};

const DisplayCampaigns: React.FC<DisplayCampaignsProps> = ({
  title,
  isLoading,
  campaigns,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<
    "all" | "funding" | "voting" | "finalized"
  >("all");
  const [sortBy, setSortBy] = useState<
    "recent" | "popular" | "target" | "progress"
  >("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const handleNavigate = (campaign: CampaignSummary) => {
    // Store in sessionStorage for the artifact demo
    // sessionStorage.setItem("campaignState", JSON.stringify(campaign));
    navigate(`/campaign-details/${campaign.pId}`, { state: campaign });
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterBy === "all" || phaseMap[campaign.phase] === filterBy;
    return matchesSearch && matchesFilter;
  });

  // Sort logic
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case "target":
        // Convert string ETH values to numbers before comparing
        return parseFloat(b.target) - parseFloat(a.target);
      case "progress":
        const progressA =
          (parseFloat(a.amountCollected) / parseFloat(a.target || "1")) * 100;
        const progressB =
          (parseFloat(b.amountCollected) / parseFloat(b.target || "1")) * 100;
        return progressB - progressA;
      default: // "recent"
        // Campaigns are already sorted by recent from the contract
        return 0;
    }
  });

  // Corrected stats calculations
  const totalFunded = campaigns.reduce(
    (sum, campaign) => sum + parseFloat(campaign.amountCollected),
    0
  );
  const activeCampaigns = campaigns.filter(
    (c) => c.phase === Phase.Funding
  ).length;
  // NOTE: totalBackers cannot be calculated as `donators` is not in CampaignSummary.
  // This stat should be removed or implemented differently.

  return (
    <div className="pt-24 min-h-screen bg-white  text-black dark:text-white p-6 dark:bg-black transition-colors duration-200">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        {/* Title and Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-black dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-black/70 dark:text-white/70 text-lg">
                Discover and support amazing story projects from creative
                writers
              </p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button className="bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 dark:focus:ring-offset-black">
                Start a Campaign
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-black/20 dark:border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black/70 dark:text-white/70 text-sm">
                    Total Campaigns
                  </p>
                  <p className="text-black dark:text-white text-2xl font-bold">
                    {campaigns.length}
                  </p>
                </div>
                <Target className="text-dark-green dark:text-light-green w-8 h-8" />
              </div>
            </div>
            <div className="bg-white dark:bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-black/20 dark:border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black/70 dark:text-white/70 text-sm">
                    Active Funding
                  </p>
                  <p className="text-black dark:text-white text-2xl font-bold">
                    {activeCampaigns}
                  </p>
                </div>
                <TrendingUp className="text-dark-green dark:text-light-green w-8 h-8" />
              </div>
            </div>
            <div className="bg-white dark:bg-black/10 backdrop-blur-sm rounded-xl p-4 border border-black/20 dark:border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black/70 dark:text-white/70 text-sm">
                    Total Funded
                  </p>
                  <p className="text-black dark:text-white text-2xl font-bold">
                    {totalFunded.toFixed(2)} ETH
                  </p>
                </div>
                <Calendar className="text-dark-green dark:text-light-green w-8 h-8" />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white dark:bg-black/10 backdrop-blur-sm rounded-xl p-6 border border-black/20 dark:border-white/20 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black/60 dark:text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-black/10 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white placeholder-black/60 dark:placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:border-transparent transition-colors duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3 flex-wrap lg:flex-nowrap">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-4 py-3 bg-white dark:bg-black/10 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green appearance-none cursor-pointer transition-colors duration-200"
                >
                  <option
                    value="all"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    All Phases
                  </option>
                  <option
                    value="funding"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Funding
                  </option>
                  <option
                    value="voting"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Voting
                  </option>
                  <option
                    value="finalized"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Finalized
                  </option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-3 bg-white dark:bg-black/10 border border-black/20 dark:border-white/20 rounded-lg text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green appearance-none cursor-pointer transition-colors duration-200"
                >
                  <option
                    value="recent"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Most Recent
                  </option>
                  <option
                    value="popular"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Most Popular
                  </option>
                  <option
                    value="target"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Highest Target
                  </option>
                  <option
                    value="progress"
                    className="bg-white text-black dark:bg-black dark:text-white"
                  >
                    Most Progress
                  </option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-white dark:bg-black/10 border border-black/20 dark:border-white/20 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 dark:focus:ring-offset-black ${
                      viewMode === "grid"
                        ? "bg-dark-green dark:bg-light-green text-white"
                        : "text-black/60 dark:text-white/60 hover:text-dark-green dark:hover:text-light-green hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 dark:focus:ring-offset-black ${
                      viewMode === "list"
                        ? "bg-dark-green dark:bg-light-green text-white"
                        : "text-black/60 dark:text-white/60 hover:text-dark-green dark:hover:text-light-green hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="min-h-[400px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-16 h-16 text-dark-green dark:text-light-green animate-spin mb-4" />
              <p className="text-black/70 dark:text-white/70 text-lg">
                Loading amazing campaigns...
              </p>
            </div>
          )}

          {!isLoading &&
            sortedCampaigns.length === 0 &&
            campaigns.length === 0 && (
              <div className="text-center py-20">
                <div className="bg-white dark:bg-black rounded-2xl p-12 border border-black/10 dark:border-white/10 max-w-md mx-auto transition-colors duration-200">
                  <Target className="w-16 h-16 text-black/40 dark:text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-black/60 dark:text-white/60 mb-6">
                    Be the first to launch a story crowdfunding campaign!
                  </p>
                  <button className="bg-dark-green dark:bg-light-green hover:bg-light-green dark:hover:bg-dark-green text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-dark-green dark:focus:ring-light-green focus:ring-offset-2 dark:focus:ring-offset-black">
                    Create First Campaign
                  </button>
                </div>
              </div>
            )}

          {!isLoading &&
            sortedCampaigns.length === 0 &&
            campaigns.length > 0 && (
              <div className="text-center py-20">
                <div className="bg-white dark:bg-black rounded-2xl p-12 border border-black/10 dark:border-white/10 max-w-md mx-auto transition-colors duration-200">
                  <Search className="w-16 h-16 text-black/40 dark:text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-black/60 dark:text-white/60">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              </div>
            )}

          {!isLoading && sortedCampaigns.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-black/70 dark:text-white/70">
                  Showing {sortedCampaigns.length} of {campaigns.length}{" "}
                  campaigns
                </p>
              </div>

              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {sortedCampaigns.map((campaign) => (
                  <FundCard
                    key={campaign.pId}
                    {...campaign}
                    deadline={campaign.deadline}
                    category="test"
                    handleClick={() => handleNavigate(campaign)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayCampaigns;
