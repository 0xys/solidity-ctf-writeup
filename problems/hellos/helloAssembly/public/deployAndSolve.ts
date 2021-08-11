import { Sender } from '../../../../lib/sender';
import BN from 'bn.js';
import setting from '../setting.json';
import _bytecode from '../private/bytecode.json';

const abi = require('ethereumjs-abi');

/**
 * 
 * @param deployer 
 * @param version 
 * @param valueEth 
 * @returns address of Setup contract
 */
export const deploy = async (deployer: Sender): Promise<string> => {
    const bytecode = _bytecode.object;
    const contractAddress = await deployer.deployContract(bytecode, setting.problem.deploy_value);
    console.log('bytecode.json: ', contractAddress);
    return contractAddress;
}

export const solve = async (deployer: Sender, contractAddress: string): Promise<boolean> => {
    {
        const slot = new BN('0');
        const data = await deployer.getStorageAt(contractAddress, slot);
        if(data != '0x10000123'){
            console.log('failed 0:', data);
            return false;
        }
    }
    {
        const data = abi.simpleEncode('a()');
        const res = await deployer.viewContract(contractAddress, data);
        if(res != '0x0000000000000000000000000000000000000000000000000000000010000123'){
            console.log('failed 1:', res);
            return false;
        }
    }

    return true;
}