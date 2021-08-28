// 0.5.1-c8a2
// Enable optimization
pragma solidity ^0.5.0;

import "./ERC20.sol";
import "./ERC20Detailed.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `ERC20` functions.
 */
contract NetIx is ERC20, ERC20Detailed {

    address private contractOwner;
    uint256 private _distributionCap;

    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor () public ERC20Detailed("NetIx", "NTX", 6) {
        contractOwner = msg.sender;
        _mint(msg.sender, 15000000 * (10 ** uint256(decimals())));
        transfer(address(0x4135a1ca2155b0b4fa618f394c63e6115406eb4070), 1500000 * (10 ** uint256(decimals()))); // founders share
        transfer(address(0x41BD3515A2992DDB6FE38B94A3DB0740ABE5BE7A51), 750000 * (10 ** uint256(decimals()))); // teams share
        transfer(address(0x41A8CFB0B2EAA2A320E21438A72CAD8DE6668D1A2F), 300000 * (10 ** uint256(decimals()))); // counsultors share
        transfer(address(0x41218AC26AFFBA0ED5A6872436D610157A9AFE015A), 450000 * (10 ** uint256(decimals()))); // partners share
        _distributionCap = balanceOf(contractOwner);
    }

    function distributionCap() public view returns(uint256) {
        return _distributionCap;
    }

    function transfer(address recipient, uint256 amount) public returns (bool) {
        if (msg.sender == contractOwner) {
            require(balanceOf(contractOwner).sub(amount) > _distributionCap, "greater than distribution capicity");
        }
        return super.transfer(recipient, amount);
    }

    function increaseAllowance(address spender, uint256 addedValue) public returns (bool) {
        require (msg.sender != contractOwner, "contract owner is not authorized to have allowance");
        return super.increaseAllowance(spender, addedValue);
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public returns (bool) {
        require (msg.sender != contractOwner, "contract owner is not authorized to have allowance");
        return super.decreaseAllowance(spender, subtractedValue);
    }

    function redistribute(uint256 tokenAmount) public returns (bool) {
        require (msg.sender == contractOwner, "only the contract owner is authorized");
        _distributionCap = _distributionCap.sub(tokenAmount);
        return true;
    }

}