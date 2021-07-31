pragma solidity 0.8.0;

contract Token {
    uint public totalSupply;
    mapping(address => uint) balances;

    function mint(address to, uint amount) public {
        balances[to] += amount;
        totalSupply += amount;
    }
    function balanceOf(address owner) public view returns (uint) {
        return balances[owner];
    }
}