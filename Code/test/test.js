const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Creating Lotteries", () => {
    let lotteryContract;
    let owner1;
    let owner2;
  
    //Initialize the owner and deploy the contract before the test cases
    beforeEach(async () => {
      [owner1, owner2] = await ethers.getSigners();
      lotteryContract = await ethers.deployContract("Lottery");
    });

    it("Should create a new lottery with valid parameters", async function () {
        //Values for the new Lottery
        const lotteryName = "Test Lottery";
        const pricePerTicket = ethers.parseEther("1");
        const createdAt = Math.floor(Date.now() / 1000);
        const expiresAt = createdAt + 3600; // Expire after 1 hour
    
        //create the new Lottery
        await lotteryContract.connect(owner2).createLottery(
          lotteryName,
          pricePerTicket,
          createdAt,
          expiresAt
        );
    

        const allLotteries = await lotteryContract.getAllLoteries();
        const newLottery = allLotteries[0];
    
        //compare the Lottery in the contract with the expected values
        //expect(newLottery.lottery_id).to.equal(1)
        expect(newLottery.lottery_name).to.equal(lotteryName);
        expect(newLottery.manager).to.equal(owner2.address);
        expect(newLottery.current_prizePool).to.equal(0);
        expect(newLottery.price).to.equal(pricePerTicket);
        expect(newLottery.createdAt).to.equal(createdAt);
        expect(newLottery.expiresAt).to.equal(expiresAt);
    });

    it("Should increase the lottery counter after creating a new lottery", async function () {
        const initialCounter = Number(await lotteryContract.getLotteryCounter());
    
        await lotteryContract.createLottery(
          "Test Lottery",
          ethers.parseEther("1"),
          Math.floor(Date.now() / 1000),
          Math.floor(Date.now() / 1000) + 3600
        );
    
        const finalCounter = await lotteryContract.getLotteryCounter();
        expect(Number(finalCounter)).to.equal(initialCounter + 1);
    });

    it("Should increase the lottery counter after creating many new lotteries", async function () {

        const initialCounter = Number(await lotteryContract.getLotteryCounter());
        const num_of_lotteries = 300

        for (let step = 0; step < 300; step++) {
            await lotteryContract.createLottery(
                "Test Lottery".concat(" ", step.toString()),
                ethers.parseEther("1"),
                Math.floor(Date.now() / 1000),
                Math.floor(Date.now() / 1000) + 3600
            );

        }
    
        const finalCounter = Number(await lotteryContract.getLotteryCounter());
        expect(finalCounter).to.equal(initialCounter + num_of_lotteries);
    });

    it("Should not create a new lottery after trying to create a few falseful lotteries", async function () {
        const initialCounter = Number(await lotteryContract.getLotteryCounter());
    
        //This lottery has an expire date before the creation date
        await lotteryContract.createLottery(
            "Test Lottery",
            ethers.parseEther("1"),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) - 3600
        );

        //This Lottery has a creation date before the actual time
        await lotteryContract.createLottery(
            "Test Lottery",
            ethers.parseEther("1"),
            Math.floor(Date.now() / 1000) - 7200,
            Math.floor(Date.now() / 1000) + 3600
        );
    
        const finalCounter = await lotteryContract.getLotteryCounter();
        expect(Number(finalCounter)).to.equal(initialCounter);
    });
});

describe("Buying Lottteries", () => {
    let lotteryContract;
    let owner;
    let player;
  
    // Deploy the contract and set variables before each testcase
    beforeEach(async () => {
        [owner, player] = await ethers.getSigners();
        price = BigInt("100")
        
        lotteryContract = await ethers.deployContract("Lottery");
    });

    it("Should allow a player to purchase a lottery ticket", async () => {
        // Create a lottery
        await lotteryContract.createLottery("Test Lottery", price, 0, 9999999999);
        //console.log("debug point");


        // Purchase a lottery ticket
        await lotteryContract.connect(player).purchaseLottery(1, { value: price });

        //console.log("debug point");

        const playerLotteries = await lotteryContract.connect(player).getPlayerLotteries();
    
        // Ensure the purchased lottery is present in the player's lotteries
        expect(playerLotteries).to.have.lengthOf(1);
        expect(playerLotteries[0].lottery_id).to.equal(1);
        expect(playerLotteries[0].paid).to.be.true;

    });
    
    it("Should not buy a single ticket after trying to buy false tickets", async() => {
        //creating a lottery
        await lotteryContract.createLottery(
            "Test Lottery",
            ethers.parseEther("1"),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) - 3600
        );
        const id_counter = Number(lotteryContract.getLotteryCounter());
        //lotteryContract.purchaseLottery(1, { value: price });

        //Trying to buy tickets with invalid ID
        await expect(
            lotteryContract.connect(player).purchaseLottery(0, { value: price })
        ).to.be.revertedWith("Invalid lottery id");
        await expect(
            lotteryContract.connect(player).purchaseLottery(2 , { value: price })
        ).to.be.revertedWith("Invalid lottery id");
        await expect(
            lotteryContract.connect(player).purchaseLottery(20002 , { value: price })
        ).to.be.revertedWith("Invalid lottery id");

        
        //Try to buy lotteries with a wrong price
        await expect(
            lotteryContract.connect(player).purchaseLottery(1 , { value: 1 })
        ).to.be.revertedWith("Price paid not sufficient");
        await expect(
            lotteryContract.connect(player).purchaseLottery(1 , { value: BigInt("99999999999999") })
        ).to.be.revertedWith("Price paid not sufficient");
    
        //Check that no lotteries where bought
        const playerLotteries = await lotteryContract.connect(player).getPlayerLotteries();
        expect(playerLotteries).to.have.lengthOf(0);
    });
});

describe("Lottery Contract - Selecting Winner", function () {
    let lotteryContract;
    let owner;
    let player1;
    let player2;
  
    //set variables and deploy contract
    beforeEach(async () => {
      [owner, player1, player2] = await ethers.getSigners();

      lotteryContract = await ethers.deployContract("Lottery");
    });
  
    it("Should allow the owner to select a winner", async function () {
        const lotteryId = Number(lotteryContract.getLotteryCounter()) + 1;

        // Create a lottery
        await lotteryContract.createLottery(
            "Weekly Lottery",
            ethers.parseEther("1"),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) + 2
        );

        // Purchase lottery tickets (assuming both players purchase a ticket)
        await lotteryContract.connect(player1).purchaseLottery(1, { value: ethers.parseEther("1") });

        const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

        //console.log("purchased ticket - now waiting...");
        await wait(3000);
        //console.log("done");


        // Select a winner
        await expect(lotteryContract.connect(owner).selectWinner(1))
            .to.emit(lotteryContract, "WinnerSelected")
            .withArgs(1, player1.address, 1);
    });
  
    it("Should not allow a non-owner to select a winner", async function () {
        const lotteryId = Number(lotteryContract.getLotteryCounter()) + 1;
  
      // Create a lottery
        await lotteryContract.createLottery(
            "Monthly Lottery",
            ethers.parseEther("2"),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) + 3600
        );
  
        // Purchase lottery tickets
        await lotteryContract.connect(player1).purchaseLottery(1, { value: ethers.parseEther("2") });
        
        const allLotteries = await lotteryContract.getAllLoteries();
        const monthly_lottery = allLotteries[0];
        console.log(monthly_lottery.manager)
        console.log(player2.address)
        // Non-owner attempts to select a winner
        await expect(lotteryContract.connect(player2).selectWinner(1))
            .to.be.revertedWith("Only the manager can call this function");
    });

    it("Should allow anyone to retrieve the lottery winner details after it's drawn", async function () {
        const lotteryId = Number(lotteryContract.getLotteryCounter()) + 1;

        // Create a lottery
        await lotteryContract.createLottery(
            "Weekly Lottery",
            ethers.parseEther("1"),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) + 2
        );

        // Purchase lottery tickets (assuming both players purchase a ticket)
        await lotteryContract.connect(player1).purchaseLottery(1, { value: ethers.parseEther("1") });

        const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

        // Wait for the lottery to expire
        await wait(3000);

        // Select a winner
        await lotteryContract.connect(owner).selectWinner(1);

        // Retrieve the winner details
        const winnerDetails = await lotteryContract.getLotteryWinner(1);

        // Assert the winner details
        expect(winnerDetails.winner_address).to.equal(player1.address);
        expect(winnerDetails.winning_ticket_number).to.equal(1);
    });

    it("Should not allow retrieving winner details for an undrawn lottery", async function () {
        const lotteryId = Number(lotteryContract.getLotteryCounter()) + 1;

        // Create a lottery
        await lotteryContract.createLottery(
            "Monthly Lottery",
            ethers.parseEther("2"),
            Math.floor(Date.now() / 1000),
            Math.floor(Date.now() / 1000) + 3600
        );

        // Purchase lottery tickets
        await lotteryContract.connect(player1).purchaseLottery(1, { value: ethers.parseEther("2") });

        // Try to retrieve winner details for an undrawn lottery
        await expect(lotteryContract.getLotteryWinner(1))
            .to.be.revertedWith("Lottery not yet drawn");
    });
});
