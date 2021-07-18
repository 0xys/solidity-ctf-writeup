// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.0;

contract Test {
    address public owner;
    event Log(uint id);

    constructor(){
        owner = msg.sender;
    }

    function exec(uint id) public {
        emit Log(id);
    }

    function pay() public payable {
        emit Log(msg.value);
    }

    function get() public view returns (uint) {
        return 125;
    }
}