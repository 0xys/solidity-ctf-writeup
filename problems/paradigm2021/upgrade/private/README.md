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

## Storage Layout of Proxy
```
0  : 0xfcb19e6a322b27c06842a71e8c725399f049ae3a
1  : 0xf0d160dec1749afaf5a831668093b1431f7c8527
2  : 0x5db0115f3b72d19cea34dd697cf412ff86dc7e1b
3  : 0x
4  : 0x55534420436f696e000000000000000000000000000000000000000000000010
5  : 0x5553444300000000000000000000000000000000000000000000000000000008
6  : 0x06
7  : 0x5553440000000000000000000000000000000000000000000000000000000006
8  : 0x01e982615d461dd5cd06575bbea87624fda4e3de17
9  : 0x
10 : 0x
11 : 0x5dfad8d557750e
12 : 0x
13 : 0x
14 : 0x
15 : 0xb72420bc3c934306a7071cb3211aa86fe90a5475f11d8037c70cd462a0ab9898
16 : 0x
17 : 0x
18 : 0x02
19 : 0x
20 : 0x01
21 : 0x
```