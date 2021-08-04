import { Sender } from '../../../../lib/sender';
import BN from 'bn.js';
import setting from '../setting.json';
import _bytecode from '../private/bytecode.json';


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
        console.log(data);
        return data == '0x0000000000000000000000000000000000000000000000000000000000000001';
    }
}