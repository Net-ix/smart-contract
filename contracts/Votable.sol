pragma solidity ^0.5.0;

import "./ERC20.sol";
import "./Owned.sol";

contract Votable is ERC20, Owned {

    struct Vote {
        address voter;
        bool vote;
    }

    enum State { notVoting, voting }

    Vote[] private votes;

    State private _votingState;

    mapping(address => bool) private _hasVoted;

    event Voted (address voter, bool vote);

    event Result (bool voted);

    modifier notVoted {
        require(_hasVoted[msg.sender] == false, "You have voted before");
        _;
        _hasVoted[msg.sender] = true;
    }

    modifier isVoting {
        require(_votingState == State.voting, "voting is disabled");
        _;
    }

    function votingState() public view returns (State) {
        return _votingState;
    }

    function startVoting() public isOwner returns (bool) {
        require(_votingState == State.notVoting, "there is an ongoing voting");
        for (uint256 index = 0; index < votes.length; index++) {
            delete _hasVoted[votes[index].voter];
        }
        delete votes;
        _votingState = State.voting;
        return true;
    }

    function vote(bool _vote) public notVoted isVoting returns (bool) {
        votes.push(Vote({
            voter: msg.sender,
            vote: _vote
        }));
        emit Voted(msg.sender, _vote);
        return true;
    }

    function reveal() public isOwner isVoting returns (bool) {
        uint256 yes;
        uint256 no;
        for (uint256 index = 0; index < votes.length; index++) {
            Vote memory ballot = votes[index];
            uint256 balance = balanceOf(ballot.voter);
            if (ballot.vote) {
                yes += balance;
            } else {
                no += balance;
            }
        }
        _votingState = State.notVoting;
        emit Result (yes > no);
        return yes > no;
    }
}