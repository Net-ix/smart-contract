pragma solidity ^0.5.0;

import "./ERC20.sol";
import "./ERC20Detailed.sol";
import "./Owned.sol";
import "./LockedWallet.sol";
import "./Redistributed.sol";
import "./Votable.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract NetIx is ERC20, ERC20Detailed, Owned, Redistributed, LockedWallet, Votable {

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor () public ERC20Detailed("NetIx", "NTX", 6) {
        _mint(msg.sender, 15000000 * (10 ** uint256(decimals())));
        _transfer(msg.sender, address(0x4135a1ca2155b0b4fa618f394c63e6115406eb4070), 1500000 * (10 ** uint256(decimals()))); // founders share
        _transfer(msg.sender, address(0x41BD3515A2992DDB6FE38B94A3DB0740ABE5BE7A51), 750000 * (10 ** uint256(decimals()))); // teams share
        _transfer(msg.sender, address(0x41A8CFB0B2EAA2A320E21438A72CAD8DE6668D1A2F), 300000 * (10 ** uint256(decimals()))); // counsultors share
        _transfer(msg.sender, address(0x41218AC26AFFBA0ED5A6872436D610157A9AFE015A), 450000 * (10 ** uint256(decimals()))); // partners share
    }

    function approve(address spender, uint256 addedValue) public notOwner returns (bool) {
        return super.approve(spender, addedValue);
    }

    function increaseAllowance(address spender, uint256 addedValue) public notOwner returns (bool) {
        return super.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public notOwner returns (bool) {
        return super.decreaseAllowance(spender, subtractedValue);
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        if (msg.sender == _contractOwner) {
            require (block.timestamp < _currentDistribution.endTime, "current distribution is over");
            _currentDistribution.amount = _currentDistribution.amount.sub(amount);
            _lockedBalances[recipient].amount += amount;
            _lockedBalances[recipient].endTime = _currentDistribution.startTime + 120 days;
        }
        return super.transfer(recipient, amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal checkLockedBalance(sender, amount) {
        return super._transfer(sender, recipient, amount);
    }
}