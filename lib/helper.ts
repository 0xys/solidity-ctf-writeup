import Web3 from 'web3';
import BN from 'bn.js';

const web3 = new Web3();
const keccak256 = require('keccak256');

/**
 * 
 * @param address 0x... format address
 */
export const hexToBuffer = (address: string): Buffer => {
    let trimed = '';
    if(address.startsWith('0x')){
        trimed = address.slice(2);
    }
    return Buffer.from(trimed, 'hex');
}

export const getItemSlotOfMappingByKey = (key: Buffer, pSlot: BN): BN => {
    let keyPadded = key;
    if(keyPadded.length > 32){
        throw new Error(`key size exceeds uint256 size: ${keyPadded.length}`);
    }
    if(keyPadded.length < 32){
        const padding = Buffer.from('00'.repeat(32 - keyPadded.length), 'hex');
        keyPadded = Buffer.concat([padding, keyPadded]);
    }
    let p = pSlot.toBuffer('be', 32);
    const preimage = Buffer.concat([Uint8Array.from(keyPadded), Uint8Array.from(p)]);
    const hashed = '0x'+keccak256(preimage).toString('hex');
    return new BN(web3.utils.hexToNumberString(hashed));
}