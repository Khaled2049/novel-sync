import React, { useState, useEffect } from "react";
import { useCampaignContext } from "@/contexts/campaignContext";
import { CampaignSummary, Phase } from "@/types/ICampaigns";
import { Proposal } from "@thirdweb-dev/react";

// --- Props Interface ---
interface ActionPanelProps {
  campaign: CampaignSummary;
  isOwner: boolean;
}

// --- Main Component ---
const ActionPanel: React.FC<ActionPanelProps> = ({ campaign, isOwner }) => {
  // Destructure all required functions from the context
  const {
    address,
    getProposals,
    getDonation,
    donateToCampaign,
    startVoting,
    createProposal,
    voteOnProposal,
    finalizeCampaign,
    withdrawFunds,
  } = useCampaignContext();

  // --- State Management (no changes needed here) ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for forms
  const [donationAmount, setDonationAmount] = useState("");
  const [votingDuration, setVotingDuration] = useState("7"); // Default to 7 days
  const [proposalDesc, setProposalDesc] = useState("");

  // State for dynamic data
  const [isDonor, setIsDonor] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // --- Data Fetching Effect (Refactored) ---
  useEffect(() => {
    const fetchData = async () => {
      // Check if the current user is a donor using the correct function name
      if (address && campaign.pId !== undefined) {
        try {
          const donation = await getDonation(campaign.pId, address);
          // Use parseFloat since the context returns a formatted string (e.g., "0.05")
          if (parseFloat(donation) > 0) {
            setIsDonor(true);
          }
        } catch (e) {
          console.error("Could not fetch user donation status.", e);
        }
      }

      // Fetch proposals if in Voting or Finalized phase
      if (
        (campaign.phase === Phase.Voting ||
          campaign.phase === Phase.Finalized) &&
        campaign.pId !== undefined
      ) {
        const fetchedProposals = await getProposals(campaign.pId);
        setProposals(fetchedProposals);
      }
    };

    fetchData();
  }, [campaign.pId, campaign.phase, address, getDonation, getProposals]);

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0)
      return setError("Please enter a valid amount.");
    setIsLoading(true);
    setError(null);
    try {
      // The context now handles the conversion from string to wei.
      await donateToCampaign(Number(campaign.pId), donationAmount);
      setDonationAmount("");
    } catch (err: any) {
      setError(err.message || "Donation failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartVoting = async () => {
    const durationInSeconds = parseInt(votingDuration) * 24 * 60 * 60;
    if (isNaN(durationInSeconds) || durationInSeconds <= 0)
      return setError("Please enter a valid duration.");
    setIsLoading(true);
    setError(null);
    try {
      await startVoting(Number(campaign.pId), durationInSeconds);
    } catch (err: any) {
      setError(err.message || "Failed to start voting.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!proposalDesc.trim())
      return setError("Proposal description cannot be empty.");
    setIsLoading(true);
    setError(null);
    try {
      await createProposal(Number(campaign.pId), proposalDesc);
      setProposalDesc("");
      const fetchedProposals = await getProposals(Number(campaign.pId));
      setProposals(fetchedProposals);
    } catch (err: any) {
      setError(err.message || "Failed to create proposal.");
    } finally {
      setIsLoading(false);
    }
  };

  // No changes needed for the handlers below, just ensuring pId is used
  const handleVote = async (proposalIndex: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await voteOnProposal(Number(campaign.pId), proposalIndex);
    } catch (err: any) {
      setError(err.message || "Failed to cast vote.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await finalizeCampaign(Number(campaign.pId));
    } catch (err: any) {
      setError(err.message || "Failed to finalize campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await withdrawFunds(Number(campaign.pId));
    } catch (err: any) {
      setError(err.message || "Failed to withdraw funds.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (campaign.phase) {
      case Phase.Funding:
        // Use parseFloat for comparison as values are formatted ETH strings
        const canStartVoting =
          Date.now() / 1000 > campaign.deadline &&
          parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);
        if (isOwner) {
          // Owner view for Funding Phase
          return (
            <div>
              <h3 className="text-lg font-semibold mb-2">Owner Controls</h3>
              {canStartVoting ? (
                <div className="space-y-3">
                  <p>
                    Funding successful! Set the voting duration to begin the
                    next phase.
                  </p>
                  <input
                    type="number"
                    value={votingDuration}
                    onChange={(e) => setVotingDuration(e.target.value)}
                    className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
                  />
                  <button
                    onClick={handleStartVoting}
                    disabled={isLoading}
                    className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isLoading ? "Processing..." : "Start Voting Phase"}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  The campaign is in the funding phase. Controls will appear
                  here once the funding period ends.
                </p>
              )}
            </div>
          );
        }

        return (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Support this Story</h3>
            <p className="text-sm text-gray-500">
              Your contribution fuels the creation of this narrative. Help bring
              it to life!
            </p>
            <input
              type="text"
              placeholder="0.05"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
            />
            <button
              onClick={handleDonate}
              disabled={isLoading}
              className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {isLoading ? "Processing..." : "Donate ETH"}
            </button>
          </div>
        );

      case Phase.Voting:
        const canFinalize = Date.now() / 1000 > campaign.votingDeadline;
        return (
          <div className="space-y-6">
            {isOwner && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Create a New Proposal
                </h3>
                <textarea
                  value={proposalDesc}
                  onChange={(e) => setProposalDesc(e.target.value)}
                  placeholder="Propose a new plot direction..."
                  className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
                  rows={3}
                ></textarea>
                <button
                  onClick={handleCreateProposal}
                  disabled={isLoading || proposals.length >= 5}
                  className="mt-2 p-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {isLoading
                    ? "Submitting..."
                    : `Create Proposal (${proposals.length}/5)`}
                </button>
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Vote on the Narrative
              </h3>
              {proposals.length > 0 ? (
                <div className="space-y-2">
                  {proposals.map((p, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <p>{p.description}</p>
                      {isDonor && (
                        <button
                          onClick={() => handleVote(i)}
                          disabled={isLoading}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Vote
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  The author is creating proposals. Check back soon!
                </p>
              )}
            </div>
            {canFinalize && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Finalize Voting</h3>
                <p className="text-sm text-gray-500 mb-2">
                  The voting period is over. Anyone can trigger the finalization
                  to determine the winner.
                </p>
                <button
                  onClick={handleFinalize}
                  disabled={isLoading}
                  className="w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {isLoading ? "Finalizing..." : "Finalize Campaign"}
                </button>
              </div>
            )}
          </div>
        );

      // --- FINALIZED PHASE ---
      case Phase.Finalized:
        const winningProposal = proposals[campaign.winningProposalIndex];
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Voting Complete!</h3>
              {winningProposal ? (
                <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg border border-green-300 dark:border-green-700">
                  <p className="font-bold text-green-800 dark:text-green-200">
                    Winning Proposal:
                  </p>
                  <p className="text-green-700 dark:text-green-300">
                    "{winningProposal.description}"
                  </p>
                </div>
              ) : (
                <p>The winning proposal is being determined...</p>
              )}
            </div>
            {isOwner && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Withdraw Funds</h3>
                <p className="text-sm text-gray-500 mb-2">
                  The campaign is finalized. You can now withdraw the raised
                  funds.
                </p>
                {/* The 'withdrawn' property is not on CampaignSummary, so we can't disable the button after withdrawal without fetching more data. 
                  For now, the button will remain active but the contract will prevent double-withdrawal. */}
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {isLoading ? "Withdrawing..." : "Withdraw ETH"}
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <p className="text-gray-500">The campaign is in an unknown state.</p>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-2xl border border-gray-200 dark:border-gray-800 p-8 transition-colors duration-200">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Take Action
      </h2>
      {renderContent()}
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
};

export default ActionPanel;
