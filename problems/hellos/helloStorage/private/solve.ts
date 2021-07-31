import { SolCompiler } from '../../../../lib/compiler';
import { Sender } from '../../../../lib/sender';
import setting from '../setting.json';
import Web3 from 'web3';
import BN from 'bn.js';
import { getItemSlotOfMappingByKey, hexToBuffer } from '../../../../lib/helper';

const web3 = new Web3();
const abi = require('ethereumjs-abi');
/**
 * 
 * @param exploiter 
 * @param version 
 * @param tokenAddress 
 * @param valueEth 
 * @returns true if solved, false otherwise.
 */
export const solve = async (exploiter: Sender, tokenAddress: string, valueEth: number = 0): Promise<boolean> => {
    const minted = '0xa2327a938febf5fec13bacfb16ae10ecbc4cbdcf';
    
    {
        const res = await exploiter.getStorageAt(tokenAddress, new BN(0));
        console.log('total supply:', res);
    }
    {        
        const slot = getItemSlotOfMappingByKey(hexToBuffer(minted), new BN(1));
        console.log('slot:', '0x'+slot.toBuffer().toString('hex'));
        console.log(slot.toString());
        const res = await exploiter.getStorageAt(tokenAddress, slot);
        console.log('balance:', res);
    }

    return false;
}