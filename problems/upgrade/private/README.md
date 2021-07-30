# Inheritence Rule
```sol
pragma solidity 0.5.0;

contract BaseContract1 {
    uint public base1 = 1;  // slot 0
}
contract BaseContract2 is BaseContract1{
    uint public base2 = 2;  // slot 1
}
contract BaseContract3 is BaseContract2 {
    uint public base3 = 3;  // slot 2
}

contract AppContract is BaseContract3 {
    uint public app = 0;    // slot 3
}
```

```sol
pragma solidity 0.5.0;

contract BaseContractA {
    uint public baseA = 10;  // slot 0
}
contract BaseContractB {
    uint public baseB = 11;  // slot 1
}
contract BaseContractC {
    uint public baseC = 12;  // slot 2
}

contract AppContract is BaseContractA, BaseContractB, BaseContractC {
    uint public app = 0;    // slot 3
}
```

```sol
contract BaseContract1 {
    uint public base1 = 1;  // slot 0
}
contract BaseContract2 is BaseContract1 {
    uint public base2 = 2;  // slot 1
}
contract BaseContract3 is BaseContract2 {
    uint public base3 = 3;  // slot 2
}
contract BaseContract4 is BaseContract1 {
    uint public base4 = 4;  // slot 3
}

contract AppContract is BaseContract3, BaseContract4 {
    uint public app = 0;    // slot 4
}
```

```sol
pragma solidity 0.5.0;

contract BaseContract1 {
    uint public base1 = 1;  // slot 0
}
contract BaseContract2 is BaseContract1 {
    uint public base2 = 2;  // slot 2
}
contract BaseContract3 is BaseContract2 {
    uint public base3 = 3;  // slot 3
}
contract BaseContract4 is BaseContract1 {
    uint public base4 = 4;  // slot 1
}

contract AppContract is BaseContract4, BaseContract3 {
    uint public app = 0;    // slot 4
}
```