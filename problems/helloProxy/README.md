# Tips
 There're TWO proxies we're going to interact with.

## **1st Proxy: Vault Proxy**, our entry point
- Proxy: [0xb97dd0102bb67f81d25d686c661d7f0aed62e344](https://ropsten.etherscan.io/address/0xb97dd0102bb67f81d25d686c661d7f0aed62e344)
- Vault implementation: [0x3be6dc29716fe3572d68581418f34c5a876449b8](https://ropsten.etherscan.io/address/0x3be6dc29716fe3572d68581418f34c5a876449b8)
### Storage Layout
> [0]: ACL address
>  
> ...
> 
> [keccak("proxyOwnerSlot")]: proxy owner address
> 
> ...
>
> [keccak("implementationSlot")]: Vault address
>
> ...

- ACL address: [0x9cf474aeda7cf10910a44fecb29110efab0e1d4f](https://ropsten.etherscan.io/address/0x9cf474aeda7cf10910a44fecb29110efab0e1d4f)
    - This is actually another Proxy contract(to ACL), whose owner is `0xa6db372ad0e30fe6c4b2764596b3ddd8e3e367b6`.
    - explained in next section.
- proxy owner address: [0xa6db372ad0e30fe6c4b2764596b3ddd8e3e367b6](https://ropsten.etherscan.io/address/0xa6db372ad0e30fe6c4b2764596b3ddd8e3e367b6)
- vault address: [0x3be6dc29716fe3572d68581418f34c5a876449b8](https://ropsten.etherscan.io/address/0x3be6dc29716fe3572d68581418f34c5a876449b8)

## **2nd Proxy: ACL Proxy**, hidden entry point
- Proxy: [0x9cf474aeda7cf10910a44fecb29110efab0e1d4f](https://ropsten.etherscan.io/address/0x9cf474aeda7cf10910a44fecb29110efab0e1d4f)
- ACL implementation: [0x05109b4f5b5bf313eb4d3aa20a0afc02ccf2fa62](https://ropsten.etherscan.io/address/0x05109b4f5b5bf313eb4d3aa20a0afc02ccf2fa62)
### Storage Layout
> [0]: role5999294130779334338 address
>  
> [1]: role7123909213907581092 address
>  
> [2]: role8972381298910001230 address
>  
> ...
> 
> [keccak("proxyOwnerSlot")]: proxy owner address
> 
> ...
>
> [keccak("implementationSlot")]: Vault address
>
> ...


## How it works
- When calling `withdraw()` of Vault Proxy, 
```sol
function withdraw() public payable {
    //  [balance of Vault Proxy] > YOUR_BALANCE
    require(balance() > msg.value);

    //  YOUR_BALANCE > [balance of Vault Proxy] - YOUR_BALANCE
    require(msg.value > balance() - msg.value);

    //  call getACLRole8972381298910001230() of ACL Proxy
    require(msg.sender == acl.getACLRole8972381298910001230());
    
    //  seemingly transfering to role5999294130779334338 of ACL.
    //  But, there's method signature collision
    //  between ACL's getACLRole5999294130779334338() and Proxy's proxyOwner().
    //  Hence, the method actually called is ACL Proxy's proxyOwner().
    acl.getACLRole5999294130779334338().transfer(balance());
}
```