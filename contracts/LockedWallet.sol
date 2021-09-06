pragma solidity ^0.5.0;

import "./ERC20.sol";

contract LockedWallet is ERC20{

    struct locked {
        uint256 amount;
        uint256 endTime;
    }

    mapping (address => locked) internal _lockedBalances;

    function lockedBalanceOf(address account) public view returns (uint256 amount, uint256 endTime) {
        return (_lockedBalances[account].amount, _lockedBalances[account].endTime);
    }

    modifier checkLockedBalance(address sender, uint256 amount) {
        _checkLockTime(sender);
        require(balanceOf(sender).sub(amount) >= _lockedBalances[sender].amount, 'insufficient unlocked balance');
        _;
    }

    function _checkLockTime (address account) internal {
        if (_lockedBalances[account].endTime < now) {
            _lockedBalances[account].endTime = 0;
            _lockedBalances[account].amount = 0;
        }
    }

}