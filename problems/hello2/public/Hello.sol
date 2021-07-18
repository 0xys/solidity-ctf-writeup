pragma solidity 0.8.0;

contract Hello {
    bool public solved = false;
    uint _count = 0;
    uint _genesis;

    constructor(){
        _genesis = block.number;
    }

    event Say(uint id);
    event SayHello(address from, uint count);

    function solve() public {
        emit Say(_genesis);
        require(block.number > (_genesis+1), "must wait");
        solved = true;
    }

    function hello() public {
        _count += 1;
        emit SayHello(address(this), _count);
    }

    function getHelloCount() public view returns (uint) {
        return _count;
    } 
}