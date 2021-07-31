import { SolCompiler } from '../../../../lib/compiler';
import { Sender } from '../../../../lib/sender';
import BN from 'bn.js';
import Web3 from 'web3';

const web3 = new Web3();
const abi = require('ethereumjs-abi');
import setting from '../setting.json';
import { hexToBuffer, getItemSlotOfMappingByKey } from '../../../../lib/helper';

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
 * @param deployer 
 * @param version 
 * @param valueEth 
 * @returns address of Setup contract
 */
export const deploy = async (deployer: Sender): Promise<string> => {
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return 'fail';
    }

    const bytecode = output['contracts']['public/Setup.sol']['Setup'].evm.bytecode.object;
    const contractAddress = await deployer.deployContract(bytecode, setting.problem.deploy_value);
    console.log('public/Setup.sol', contractAddress);
    console.log('');

    /* change admin */
    {
        const owner = "0x807a96288A1A408dBC13DE2b1d087d10356395d2";
        const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
        const data = Buffer.concat([Buffer.from('8f283970000000000000000000000000', 'hex'), Buffer.from(contractAddress.slice(2), 'hex')]);
        const receipt = await deployer.callContractFromUnknown(owner, usdc, data);
        console.log('call changeAdmin():', receipt);
        console.log('');
    }

    // for(let i=0;i<23;i++){
    //     const data = await deployer.getStorageAt('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', new BN(i));
    //     console.log(i,':',data);
    // }
    // {
    //     const implSlot = web3.utils.hexToNumberString('0x7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3');
    //     const data = await deployer.getStorageAt('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', new BN(implSlot));
    //     console.log('impl:',data);
    // }
    // {
    //     const slot = getItemSlotOfMappingByKey(hexToBuffer('0x39aa39c021dfbae8fac545936693ac917d5e7563'), new BN(9));
    //     const data = await deployer.getStorageAt('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', new BN(slot));
    //     console.log('balance:',data);
    // }

    /* call Setup.upgrade() method */
    {
        const data = abi.simpleEncode('upgrade()');
        const receipt = await deployer.callContract(contractAddress, data);
        console.log('call upgrade():', receipt);
        console.log('');
    }

    return contractAddress;
}