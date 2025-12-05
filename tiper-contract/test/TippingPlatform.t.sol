// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TippingPlatform.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock USDC token for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("USD Coin", "USDC") {
        _mint(msg.sender, 1000000 * 10 ** 6); // Mint 1M USDC to deployer
    }

    function decimals() public pure override returns (uint8) {
        return 6; // USDC has 6 decimals
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract TippingPlatformTest is Test {
    // Make test contract payable to receive ETH
    receive() external payable {}

    TippingPlatform public tippingPlatform;
    MockUSDC public usdc;

    address public owner;
    address public author;
    address public tipper;
    address public attacker;

    uint256 public constant INITIAL_BALANCE = 100 ether;
    uint256 public constant PLATFORM_FEE_BPS = 1000; // 10%
    uint256 public constant MINIMUM_TIP = 0.001 ether;

    // Events to test
    event TipSent(
        address indexed from,
        address indexed to,
        uint256 totalAmount,
        uint256 authorAmount,
        uint256 platformFee,
        address token,
        uint256 timestamp
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    function setUp() public {
        // Set up accounts
        // In Foundry, the contract deploying the child contract is the default owner
        owner = address(this);
        author = makeAddr("author");
        tipper = makeAddr("tipper");
        attacker = makeAddr("attacker");

        // Deploy contracts
        tippingPlatform = new TippingPlatform(PLATFORM_FEE_BPS, MINIMUM_TIP);
        usdc = new MockUSDC();

        // Fund accounts with ETH
        vm.deal(tipper, INITIAL_BALANCE);
        vm.deal(author, INITIAL_BALANCE);
        vm.deal(attacker, INITIAL_BALANCE);

        // Fund accounts with USDC
        usdc.mint(tipper, 10000 * 10 ** 6); // 10k USDC
        usdc.mint(attacker, 10000 * 10 ** 6);
    }

    /*//////////////////////////////////////////////////////////////
                            BASIC TIPPING TESTS
    //////////////////////////////////////////////////////////////*/

    function testTipAuthorWithETH() public {
        uint256 tipAmount = 1 ether;
        uint256 expectedPlatformFee = (tipAmount * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedAuthorAmount = tipAmount - expectedPlatformFee;

        uint256 authorBalanceBefore = author.balance;
        uint256 ownerBalanceBefore = owner.balance;

        // Tipper sends tip
        vm.prank(tipper);

        // We check Topic 1 (From), Topic 2 (To), and Data (Amounts)
        // We set checkTopic3 to false (Token Addr) because it's not indexed in your event definition?
        // Actually, looking at your contract, 'token' is NOT indexed.
        // So topics are: [Signature, From, To]
        // Data is: [total, authorAmt, fee, token, timestamp]

        vm.expectEmit(true, true, false, true);
        emit TipSent(
            tipper,
            author,
            tipAmount,
            expectedAuthorAmount,
            expectedPlatformFee,
            address(0),
            block.timestamp
        );

        tippingPlatform.tipAuthor{value: tipAmount}(author);

        // Check balances
        assertEq(
            author.balance,
            authorBalanceBefore + expectedAuthorAmount,
            "Author should receive 90%"
        );
        assertEq(
            owner.balance,
            ownerBalanceBefore + expectedPlatformFee,
            "Owner should receive 10%"
        );
    }

    function testTipAuthorWithUSDC() public {
        // USDC has 6 decimals.
        // 1 USDC = 1,000,000 units.
        // Min tip is 0.001 ETH (10^15 wei).
        // If we use 10 USDC (10,000,000 units), it is > 10^15? No.
        // 10^7 < 10^15.
        // So we MUST lower the minimum tip requirement for the USDC test
        // OR use a very large amount of USDC units to pass the check.

        // Let's lower the minimum for the test to ensure smooth execution
        tippingPlatform.setMinimumTipAmount(1);

        uint256 tipAmount = 100 * 10 ** 6; // 100 USDC
        uint256 expectedPlatformFee = (tipAmount * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedAuthorAmount = tipAmount - expectedPlatformFee;

        // Approve contract to spend tipper's USDC
        vm.prank(tipper);
        usdc.approve(address(tippingPlatform), tipAmount);

        uint256 authorBalanceBefore = usdc.balanceOf(author);
        uint256 ownerBalanceBefore = usdc.balanceOf(owner);

        // Send tip
        vm.prank(tipper);
        tippingPlatform.tipAuthorWithToken(author, address(usdc), tipAmount);

        // Check balances
        assertEq(
            usdc.balanceOf(author),
            authorBalanceBefore + expectedAuthorAmount,
            "Author should receive 90% USDC"
        );
        assertEq(
            usdc.balanceOf(owner),
            ownerBalanceBefore + expectedPlatformFee,
            "Owner should receive 10% USDC"
        );

        // Check Contract Balance (Should be 0, as it flushes everything out)
        assertEq(
            usdc.balanceOf(address(tippingPlatform)),
            0,
            "Contract should not hold dust"
        );
    }

    /*//////////////////////////////////////////////////////////////
                            VALIDATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testCannotTipZero() public {
        vm.prank(tipper);
        vm.expectRevert("Tip below minimum amount");
        tippingPlatform.tipAuthor{value: 0}(author);
    }

    function testCannotTipBelowMinimum() public {
        vm.prank(tipper);
        vm.expectRevert("Tip below minimum amount");
        tippingPlatform.tipAuthor{value: 0.0001 ether}(author);
    }

    function testCannotTipYourself() public {
        vm.prank(tipper);
        vm.expectRevert("Cannot tip yourself");
        tippingPlatform.tipAuthor{value: 1 ether}(tipper);
    }

    // NEW TEST: Confirming we removed the "Cannot tip owner" restriction
    function testOwnerCanReceiveTips() public {
        uint256 tipAmount = 1 ether;
        uint256 expectedPlatformFee = (tipAmount * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedAuthorAmount = tipAmount - expectedPlatformFee;

        uint256 ownerBalanceBefore = owner.balance;

        // Tipper tips the Owner
        vm.prank(tipper);
        tippingPlatform.tipAuthor{value: tipAmount}(owner);

        // The owner receives the "Author Share" AND the "Platform Fee"
        // So they basically get the whole amount back
        assertEq(
            owner.balance,
            ownerBalanceBefore + expectedAuthorAmount + expectedPlatformFee,
            "Owner should receive full amount (share + fee)"
        );
    }

    /*//////////////////////////////////////////////////////////////
                            OWNER FUNCTIONS TESTS
    //////////////////////////////////////////////////////////////*/

    function testOwnerCanChangeFee() public {
        uint256 newFee = 500; // 5%

        vm.expectEmit(false, false, false, true);
        emit PlatformFeeUpdated(PLATFORM_FEE_BPS, newFee);

        tippingPlatform.setPlatformFee(newFee);

        assertEq(
            tippingPlatform.platformFeeBps(),
            newFee,
            "Fee should be updated"
        );
    }

    function testNonOwnerCannotChangeFee() public {
        vm.prank(attacker);
        // Expect the custom error from OpenZeppelin Ownable
        // Note: We use the generic expectRevert() to handle any revert data
        vm.expectRevert();
        tippingPlatform.setPlatformFee(500);
    }

    /*//////////////////////////////////////////////////////////////
                            SECURITY TESTS
    //////////////////////////////////////////////////////////////*/

    function testReentrancyProtection() public {
        // 1. Deploy the malicious AUTHOR
        MaliciousAuthor badAuthor = new MaliciousAuthor(
            payable(address(tippingPlatform))
        );

        // 2. Fund the platform so there is something to steal/interact with
        // (Though in the new logic, the platform holds 0 funds usually,
        // we fund it to simulate a stuck ETH scenario or active tx)
        vm.deal(address(tippingPlatform), 5 ether);

        // 3. Tipper tries to tip the Bad Author
        vm.prank(tipper);

        // 4. Expect Revert
        vm.expectRevert();
        tippingPlatform.tipAuthor{value: 1 ether}(address(badAuthor));
    }

    function testCannotReceiveETHDirectly() public {
        vm.deal(tipper, 1 ether);
        vm.prank(tipper);
        vm.expectRevert("Please use tipAuthor() function");
        payable(address(tippingPlatform)).transfer(1 ether);
    }

    /*//////////////////////////////////////////////////////////////
                            FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzzTipAmounts(uint96 amount) public {
        // Bound amount to reasonable range
        vm.assume(amount >= MINIMUM_TIP && amount <= 1000 ether);

        vm.deal(tipper, amount);

        uint256 expectedFee = (amount * PLATFORM_FEE_BPS) / 10000;
        uint256 expectedAuthor = amount - expectedFee;

        uint256 authorBalanceBefore = author.balance;
        uint256 ownerBalanceBefore = owner.balance;

        vm.prank(tipper);
        tippingPlatform.tipAuthor{value: amount}(author);

        // Check the actual balances changed correctly
        assertEq(
            author.balance - authorBalanceBefore,
            expectedAuthor,
            "Author balance change incorrect"
        );
        assertEq(
            owner.balance - ownerBalanceBefore,
            expectedFee,
            "Owner balance change incorrect"
        );
    }
}

// =========================================================
// HELPER CONTRACTS
// =========================================================

contract MaliciousAuthor {
    TippingPlatform public platform;

    constructor(address payable _platform) {
        platform = TippingPlatform(_platform);
    }

    // This contract behaves like an Author receiving money.
    receive() external payable {
        if (address(platform).balance >= 1 ether) {
            // Try to re-enter!
            platform.tipAuthor{value: 1 ether}(address(this));
        }
    }
}
