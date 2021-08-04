pragma solidity 0.8.0;

import './IERC20.sol';

//  token of infinity supply
contract InfinityToken is IERC20 {
    uint private _totalSupply;
    mapping(address => uint) _balances;

    //  owner => spender => amount
    //  owner allows spender to spend as much amount.
    mapping(address => mapping(address => uint)) _allowed;

    constructor(uint initialSupply) {
        _totalSupply = initialSupply;
        mint(msg.sender, initialSupply);
    }

    function totalSupply() external view override returns (uint) {
        return _totalSupply;
    }

    function balanceOf(address account) external view override returns (uint) {
        return _balances[account];
    }

    function transfer(address recipient, uint amount) external override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }

    function approve(address spender, uint amount) external override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function allowance(address owner, address spender) external view override returns (uint) {
        return _allowed[owner][spender];
    }

    function transferFrom(address spender, address recipient, uint amount) external override returns (bool) {
        _validateAllowance(spender, msg.sender, amount);
        _transfer(spender, recipient, amount);
        return true;
    }

    function _transfer(address from, address recipient, uint amount) internal {
        require(_balances[from] > amount, "InfinityToken: sender not enough balance");
        require(recipient != address(0), "InfinityToken: cannot send to zero address");
        _balances[from] -= amount;
        _balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
    }

    function _approve(address owner, address spender, uint amount) internal {
        require(owner != address(0), "InfinityToken: approve from the zero address");
        require(spender != address(0), "InfinityToken: approve to the zero address");
        require(!((amount != 0) && (_allowed[owner][spender] != 0)), "Must reset to 0 to update existing allowance.");
        _allowed[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _validateAllowance(address owner, address spender, uint amount) internal {
        require(_allowed[owner][spender] >= amount, "InfinityToken: Tried to spend more than allowed amount");
        _allowed[owner][spender] -= amount;
    }

    function mint(address to, uint amount) public {
        require(to != address(0), "InfinityToken: cannot send to zero address");
        _balances[to] += amount;
        _totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function burn(uint amount) public {
        require(_balances[msg.sender] >= amount, "cannot burn more than owned");
        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }
}