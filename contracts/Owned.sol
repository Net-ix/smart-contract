pragma solidity ^0.5.0;

contract Owned {
    
    address internal _contractOwner;

    constructor () public {
        _contractOwner = msg.sender;
    }

    modifier isOwner() {
        require(msg.sender == _contractOwner, 'Other than owner is not authorized!');
        _;
    }

    modifier notOwner() {
        require(msg.sender != _contractOwner, 'The owner is not authorized!');
        _;
    }
}