pragma solidity ^0.5.0;

import "./ERC20.sol";
import "./Owned.sol";

contract Redistributed is ERC20, Owned{

    struct distribution {
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
    }

    distribution internal _currentDistribution;

    event Redistribution (uint256 amount, uint256 startTime, uint256 endTime);

    function currentDistribution() public view returns (uint256 amount, uint256 startTime, uint256 endTime) {
        return (_currentDistribution.amount, _currentDistribution.startTime, _currentDistribution.endTime);
    }

    function redistribute(uint256 tokenAmount, uint256 time) public isOwner returns (bool) {
        require (_currentDistribution.amount == 0 || now > _currentDistribution.endTime, "The previouse distribution is not over");
        require (balanceOf(_contractOwner) >= tokenAmount, "not enough token available");
        require (time > now, "the time should be in the future");
        _currentDistribution.amount = tokenAmount;
        _currentDistribution.startTime = now;
        _currentDistribution.endTime = time;
        emit Redistribution(tokenAmount, now, time);
        return true;
    }

}