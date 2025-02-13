// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract StoryCrowdfunding {
    // Define the phases for each campaign.
    enum Phase {
        Funding,
        Voting,
        Finalized
    }

    // A proposal represents one narrative option for the story.
    struct Proposal {
        string description; // Detailed narrative option.
        uint256 voteCount; // Total weight of votes received.
    }

    // A campaign includes funding parameters, proposals, and voting info.
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target; // Funding target in wei.
        uint256 deadline; // Funding deadline timestamp.
        uint256 amountCollected;
        string image;
        // Donor tracking:
        address[] donators;
        uint256[] donationAmounts; // List of each donation received.
        mapping(address => uint256) donations; // Total donation per donor.
        // Campaign phase management:
        Phase phase;
        uint256 votingDeadline; // Voting deadline timestamp.
        // Proposals for narrative direction.
        Proposal[] proposals;
        mapping(address => bool) hasVoted; // To ensure each donor votes only once.
        uint256 winningProposalIndex; // Set when the campaign is finalized.
        bool withdrawn; // To check if funds have been withdrawn.
    }

    // Instead of returning the whole Campaign struct (which contains mappings),
    // we create a summary struct for off-chain use.
    struct CampaignSummary {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;
        Phase phase;
        uint256 votingDeadline;
        uint256 winningProposalIndex;
        uint256 proposalsCount;
    }

    mapping(uint256 => Campaign) private campaigns;
    uint256 public numberOfCampaigns = 0;

    // --- EVENTS ---
    event CampaignCreated(
        uint256 indexed campaignId,
        address owner,
        uint256 deadline
    );
    event DonationReceived(
        uint256 indexed campaignId,
        address donor,
        uint256 amount
    );
    event CampaignPhaseChanged(uint256 indexed campaignId, Phase newPhase);
    event ProposalCreated(
        uint256 indexed campaignId,
        uint256 proposalIndex,
        string description
    );
    event VoteCast(
        uint256 indexed campaignId,
        address voter,
        uint256 proposalIndex,
        uint256 weight
    );
    event CampaignFinalized(
        uint256 indexed campaignId,
        uint256 winningProposalIndex
    );
    event FundsWithdrawn(uint256 indexed campaignId, uint256 amount);

    // --- CAMPAIGN CREATION AND FUNDING ---

    // Create a new campaign (in Funding phase).
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _target,
        uint256 _deadline, // Must be in the future.
        string memory _image
    ) public returns (uint256) {
        require(_deadline > block.timestamp, "Deadline must be in the future");

        Campaign storage campaign = campaigns[numberOfCampaigns];
        campaign.owner = msg.sender;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.phase = Phase.Funding;
        campaign.withdrawn = false;

        emit CampaignCreated(numberOfCampaigns, msg.sender, _deadline);

        numberOfCampaigns++;
        return numberOfCampaigns - 1;
    }

    // Get multiple campaign summaries at once
    function getCampaigns(
        uint256 start,
        uint256 limit
    ) public view returns (CampaignSummary[] memory) {
        uint256 end = start + limit;
        // Make sure we don't try to read past the end of our campaigns
        if (end > numberOfCampaigns) {
            end = numberOfCampaigns;
        }
        // Calculate actual size of array we'll return
        uint256 arraySize = end - start;

        CampaignSummary[] memory summaries = new CampaignSummary[](arraySize);

        for (uint256 i = 0; i < arraySize; i++) {
            Campaign storage campaign = campaigns[start + i];
            summaries[i] = CampaignSummary({
                owner: campaign.owner,
                title: campaign.title,
                description: campaign.description,
                target: campaign.target,
                deadline: campaign.deadline,
                amountCollected: campaign.amountCollected,
                image: campaign.image,
                phase: campaign.phase,
                votingDeadline: campaign.votingDeadline,
                winningProposalIndex: campaign.winningProposalIndex,
                proposalsCount: campaign.proposals.length
            });
        }

        return summaries;
    }

    // Donate to an active campaign (only during Funding phase).
    function donateToCampaign(uint256 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(
            campaign.phase == Phase.Funding,
            "Campaign is not in funding phase"
        );
        require(
            block.timestamp < campaign.deadline,
            "Funding deadline has passed"
        );
        require(msg.value > 0, "Donation must be greater than zero");

        uint256 amount = msg.value;
        // Update the total donation for the donor.
        campaign.donations[msg.sender] += amount;
        // Record this donation for front-end tracking.
        campaign.donators.push(msg.sender);
        campaign.donationAmounts.push(amount);

        campaign.amountCollected += amount;
        emit DonationReceived(_id, msg.sender, amount);
    }

    // --- TRANSITION TO VOTING PHASE ---

    // The campaign owner starts the voting phase once the funding period is over and target met.
    // _votingDuration is the length (in seconds) of the voting period.
    function startVoting(uint256 _id, uint256 _votingDuration) public {
        Campaign storage campaign = campaigns[_id];
        require(
            msg.sender == campaign.owner,
            "Only campaign owner can start voting"
        );
        require(
            campaign.phase == Phase.Funding,
            "Campaign is not in funding phase"
        );
        require(
            block.timestamp >= campaign.deadline,
            "Funding period not yet over"
        );
        require(
            campaign.amountCollected >= campaign.target,
            "Funding target not reached"
        );

        campaign.phase = Phase.Voting;
        campaign.votingDeadline = block.timestamp + _votingDuration;
        emit CampaignPhaseChanged(_id, Phase.Voting);
    }

    // --- PROPOSAL CREATION AND VOTING ---

    // During the Voting phase, the campaign owner can add narrative proposals.
    function createProposal(
        uint256 _id,
        string memory _proposalDescription
    ) public {
        Campaign storage campaign = campaigns[_id];
        require(
            msg.sender == campaign.owner,
            "Only campaign owner can create proposals"
        );
        require(
            campaign.phase == Phase.Voting,
            "Proposals can only be created in voting phase"
        );
        require(
            block.timestamp < campaign.votingDeadline,
            "Voting period has ended"
        );

        campaign.proposals.push(
            Proposal({description: _proposalDescription, voteCount: 0})
        );

        emit ProposalCreated(
            _id,
            campaign.proposals.length - 1,
            _proposalDescription
        );
    }

    // Donors vote on a proposal. Their vote weight is equal to their total donation.
    function voteOnProposal(uint256 _id, uint256 _proposalIndex) public {
        Campaign storage campaign = campaigns[_id];
        require(
            campaign.phase == Phase.Voting,
            "Campaign is not in voting phase"
        );
        require(
            block.timestamp < campaign.votingDeadline,
            "Voting period is over"
        );
        require(campaign.donations[msg.sender] > 0, "Only donors can vote");
        require(!campaign.hasVoted[msg.sender], "Donor has already voted");
        require(
            _proposalIndex < campaign.proposals.length,
            "Invalid proposal index"
        );

        uint256 voteWeight = campaign.donations[msg.sender];
        campaign.proposals[_proposalIndex].voteCount += voteWeight;
        campaign.hasVoted[msg.sender] = true;
        emit VoteCast(_id, msg.sender, _proposalIndex, voteWeight);
    }

    // --- FINALIZATION AND WITHDRAWAL ---

    // After the voting deadline, anyone may call this to finalize the campaign,
    // determining the winning narrative proposal.
    function finalizeCampaign(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(
            campaign.phase == Phase.Voting,
            "Campaign is not in voting phase"
        );
        require(
            block.timestamp >= campaign.votingDeadline,
            "Voting period is not yet over"
        );

        uint256 winningVoteCount = 0;
        uint256 winningIndex = 0;
        // Loop through proposals to find the one with the highest vote count.
        for (uint256 i = 0; i < campaign.proposals.length; i++) {
            if (campaign.proposals[i].voteCount > winningVoteCount) {
                winningVoteCount = campaign.proposals[i].voteCount;
                winningIndex = i;
            }
        }
        campaign.winningProposalIndex = winningIndex;
        campaign.phase = Phase.Finalized;
        emit CampaignFinalized(_id, winningIndex);
    }

    // After finalization, the campaign owner can withdraw the collected funds.
    function withdrawFunds(uint256 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(
            msg.sender == campaign.owner,
            "Only campaign owner can withdraw funds"
        );
        require(campaign.phase == Phase.Finalized, "Campaign not finalized");
        require(!campaign.withdrawn, "Funds already withdrawn");
        uint256 amount = campaign.amountCollected;
        campaign.withdrawn = true;
        (bool success, ) = payable(campaign.owner).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit FundsWithdrawn(_id, amount);
    }

    // --- VIEW FUNCTIONS ---

    // Return a summary of a campaign (without mappings).
    function getCampaignSummary(
        uint256 _id
    ) public view returns (CampaignSummary memory) {
        Campaign storage campaign = campaigns[_id];
        CampaignSummary memory summary = CampaignSummary({
            owner: campaign.owner,
            title: campaign.title,
            description: campaign.description,
            target: campaign.target,
            deadline: campaign.deadline,
            amountCollected: campaign.amountCollected,
            image: campaign.image,
            phase: campaign.phase,
            votingDeadline: campaign.votingDeadline,
            winningProposalIndex: campaign.winningProposalIndex,
            proposalsCount: campaign.proposals.length
        });
        return summary;
    }

    // Retrieve proposals for a specific campaign.
    function getProposals(uint256 _id) public view returns (Proposal[] memory) {
        Campaign storage campaign = campaigns[_id];
        return campaign.proposals;
    }

    // Get the total donation of a specific donor for a campaign.
    function getDonation(
        uint256 _id,
        address donor
    ) public view returns (uint256) {
        Campaign storage campaign = campaigns[_id];
        return campaign.donations[donor];
    }
}
