// SPDX-License-Identifier: MIT
pragma solidity >=0.8.2 <0.9.0;

//import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol"; We have to pay money to use VRF. We'll discuss it with the team

contract Lottery {
    struct LotteryStruct {
        uint256 id;
        string lottery_name;
        uint256 current_prizePool;
        address manager;
        uint256 price;
        uint256 createdAt;
        uint256 expiresAt;
        bool drawn;
    }

    struct LotteriesPurchased {
        uint256 lottery_id;
        bool paid;
    }

    struct LotteryWinner {
        uint256 winning_ticket_number;
        address winner_address;
    }

    // hashmap to keep track of last ticket number issued for a particular lottery
    mapping(uint256 => uint256) lastTicketsArray;

    // Mapping to connect ticket numbers to player addresses for a particular lottery
    mapping(uint256 => mapping(uint256 => address)) ticketToAddress;

    mapping(uint256 => LotteryStruct) private lotteries;
    mapping(address => LotteriesPurchased[])
        private players_lotteries_purchased;

    mapping(uint256 => LotteryWinner) private lotteryPlayerWinner;

    uint256 private lotteryCounter;

    function getLotteryCounter() public view returns (uint256) {
        return lotteryCounter;
    }

    function createLottery(
        string memory _lottery_name,
        uint256 _price,
        uint256 _createdAt,
        uint256 _expiresAt
    ) public {
        //Security_Checks
        require(_price > 0, "Ticket price must be greater than zero");
        require(_createdAt <= block.timestamp, "Creation time must be in the past or present");
        require(_expiresAt > block.timestamp, "Expiration time must be in the future");

        lotteryCounter++;

        lotteries[lotteryCounter] = LotteryStruct({
            id: lotteryCounter,
            lottery_name: _lottery_name,
            current_prizePool: 0,
            manager: msg.sender,
            price: _price,
            createdAt: _createdAt,
            expiresAt: _expiresAt,
            drawn: false
        });
        lastTicketsArray[lotteryCounter] = 0;
    }

    function getAllLoteries() public view returns (LotteryStruct[] memory) {
        LotteryStruct[] memory allLotteriesArray = new LotteryStruct[](
            lotteryCounter
        );

        for (uint256 i = 1; i <= lotteryCounter; i++) {
            allLotteriesArray[i - 1] = lotteries[i];
        }

        return allLotteriesArray;
    }

    function purchaseLottery(uint256 lott_id) public payable returns (uint256) {
        //Check requirements first
        require(lott_id > 0 && lott_id <= lotteryCounter, "Invalid lottery id");
        require(
            msg.value == (lotteries[lott_id].price),
            "Price paid not sufficient"
        );

        players_lotteries_purchased[msg.sender].push(
            LotteriesPurchased({lottery_id: lott_id, paid: true})
        );

        lotteries[lott_id].current_prizePool += (lotteries[lott_id].price);
        lastTicketsArray[lott_id]++;
        uint256 ticketNumber = lastTicketsArray[lott_id];
        ticketToAddress[lott_id][ticketNumber] = msg.sender; // Connect ticket number to player address. Makes it easier after

        return ticketNumber;
    }

    function getPlayerLotteries()
        public
        view
        returns (LotteriesPurchased[] memory)
    {
        return players_lotteries_purchased[msg.sender];
    }

    function getPlayerAddressByTicket(
        uint256 lott_id,
        uint256 ticketNumber
    ) public view returns (address) {
        require(
            lott_id >= 1 && lott_id <= lotteryCounter,
            "Invalid lottery id"
        );
        require(
            ticketNumber >= 1 && ticketNumber <= lastTicketsArray[lott_id],
            "Invalid ticket number"
        );

        return ticketToAddress[lott_id][ticketNumber];
    }

    // Event to emit when a winner is selected
    event WinnerSelected(
        uint256 indexed lotteryId,
        address winner,
        uint256 winningTicket
    );

    function selectWinner(uint256 lott_id) public {
        //Check that requirements are fulfilled before selecting a winner
        require(
            msg.sender == lotteries[lott_id].manager,
            "Only the manager can call this function"
        );
        require(
            lott_id >= 1 && lott_id <= lotteryCounter,
            "Invalid lottery id"
        );
        require(
            block.timestamp >= lotteries[lott_id].expiresAt,
            "Lottery not yet expired"
        ); //We only select winner after it ends
        require(
            lastTicketsArray[lott_id] > 0,
            "No tickets purchased for this lottery"
        );

        // Pseudo-randomly select a winner based on additional factors
        uint256 random_nonce = uint256(
            keccak256(
                abi.encodePacked(block.difficulty, block.timestamp, msg.sender)
            )
        );

        uint256 winningTicket = (random_nonce % lastTicketsArray[lott_id]) + 1;

        // Get the winner's address using the function getPlayerAddressByTicket
        address winner = getPlayerAddressByTicket(lott_id, winningTicket);

        // store the winner in an hashmap
        lotteryPlayerWinner[lott_id] = LotteryWinner({
            winning_ticket_number: winningTicket,
            winner_address: winner
        });

        // Set the lottery as drawn
        lotteries[lott_id].drawn = true;

        // Emit an event with the winner's address
        emit WinnerSelected(lott_id, winner, winningTicket);
        payable(winner).transfer(lotteries[lott_id].current_prizePool);
    }

    // Getter function to retrieve lottery winner details
    function getLotteryWinner(
        uint256 lott_id
    ) public view returns (LotteryWinner memory) {
        require(
            lott_id >= 1 && lott_id <= lotteryCounter,
            "Invalid lottery id"
        );
        require(lotteries[lott_id].drawn, "Lottery not yet drawn");
        return lotteryPlayerWinner[lott_id];
    }
}
