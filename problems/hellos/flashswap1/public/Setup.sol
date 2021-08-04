pragma solidity 0.8.0;

import './IERC20.sol';
import './Token.sol';

contract Setup {
    address public token;
    constructor() {
        InfinityToken t = new InfinityToken(1000);
        token = address(t);
    }
}