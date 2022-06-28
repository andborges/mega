const { expect } = require("chai");
const { ethers } = require("hardhat");

describe('Mega', function () {
    let mega;
    let owner;
    let addr1;
    let addr2;
    let addr3;
    let value;

    beforeEach(async function () {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        const Mega = await ethers.getContractFactory('Mega');
        mega = await Mega.connect(owner).deploy();

        await mega.deployed();

        value = { value: ethers.utils.parseEther('0.00035') };
    });

    it('Should revert if invalid value', async function () {
        // Act
        const play1 = mega.connect(addr1).play([1, 2, 3, 4, 5, 6], { value: ethers.utils.parseEther('0.00036') });

        // Assert
        await expect(play1).to.be.revertedWith('Games costs .00035 ether');
    });

    it('Should revert if invalid numbers', async function () {
        // Act
        const play1 = mega.connect(addr1).play([71, 2, 3, 4, 5, 6], value);

        // Assert
        await expect(play1).to.be.revertedWith('All numbers must be unique and between 1 and 60');
    });

    it('Should revert if duplicated numbers', async function () {
        // Act
        const play1 = mega.connect(addr1).play([50, 2, 3, 4, 5, 50], value);

        // Assert
        await expect(play1).to.be.revertedWith('All numbers must be unique and between 1 and 60');
    });

    it('Should return the new balance after new play', async function () {
        // Act
        const play1 = await mega.connect(addr1).play([1, 2, 3, 4, 5, 6], value);
        await play1.wait();

        // Assert
        expect(await mega.getBalance()).to.equal(332500000000000);

        // Act
        const play2 = await mega.connect(addr2).play([1, 2, 3, 4, 5, 6], value);
        await play2.wait();

        // Assert
        expect(await mega.getBalance()).to.equal(665000000000000);
    });

    it('Should emit event after new play', async function () {
        // Act
        const play = await mega.connect(addr1).play([1, 2, 3, 4, 5, 6], value);
        
        // Assert
        await expect(play)
                .to.emit(mega, 'Played')
                .withArgs(addr1.address, [1, 2, 3, 4, 5, 6]);
    });

    it('Should winners have balance updated after set results with winners', async function () {
        // Arrange
        const winner1 = await mega.connect(addr1).play([1, 2, 3, 4, 5, 6], value);
        await winner1.wait();

        const winner2 = await mega.connect(addr2).play([1, 2, 3, 4, 5, 6], value);
        await winner2.wait();

        const loser = await mega.connect(addr3).play([1, 2, 3, 4, 5, 7], value);
        await loser.wait();

        const winner1InitialBalance = await addr1.getBalance();
        const winner2InitialBalance = await addr2.getBalance();
        const loserInitialBalance = await addr3.getBalance();

        // Act
        const setResults = await mega.connect(owner).setResults([1, 2, 3, 4, 5, 6]);
        await setResults.wait();

        const winner1FinalBalance = await addr1.getBalance();
        const winner2FinalBalance = await addr2.getBalance();
        const loserFinalBalance = await addr3.getBalance();

        // Assert
        expect(winner1FinalBalance).to.gt(winner1InitialBalance);
        expect(winner2FinalBalance).to.gt(winner2InitialBalance);
        expect(loserFinalBalance).to.equal(loserInitialBalance);
    });

    it('Should all players have refund after set results without winners', async function () {
        // Arrange
        const player1 = await mega.connect(addr1).play([1, 2, 3, 4, 5, 6], value);
        await player1.wait();

        const player2 = await mega.connect(addr2).play([1, 2, 3, 4, 5, 6], value);
        await player2.wait();

        const player3 = await mega.connect(addr3).play([1, 2, 3, 4, 5, 7], value);
        await player3.wait();

        const player1InitialBalance = await addr1.getBalance();
        const player2InitialBalance = await addr2.getBalance();
        const player3InitialBalance = await addr3.getBalance();

        // Act
        const setResults = await mega.connect(owner).setResults([1, 2, 3, 10, 11, 12]);
        await setResults.wait();

        const player1FinalBalance = await addr1.getBalance();
        const player2FinalBalance = await addr2.getBalance();
        const player3FinalBalance = await addr3.getBalance();

        // Assert
        expect(player1FinalBalance).to.gt(player1InitialBalance);
        expect(player2FinalBalance).to.gt(player2InitialBalance);
        expect(player3FinalBalance).to.gt(player3InitialBalance);
    });
});