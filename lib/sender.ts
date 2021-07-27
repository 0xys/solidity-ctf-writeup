import Web3 from 'web3';
import axios from 'axios';
import { Unit } from 'web3-utils';
import Common from "@ethereumjs/common";
import { Transaction, TxData } from "@ethereumjs/tx";
import Wallet, { hdkey } from 'ethereumjs-wallet';
import BN from 'bn.js';
import assert from 'assert';
const bip39  = require('bip39');

export class Sender {
    wallet: Wallet;
    constructor(private web3: Web3, private endpoint: string, mnemonic: string, index: number, private common: Common){
        const seed = bip39.mnemonicToSeedSync(mnemonic);
        const hdWallet = hdkey.fromMasterSeed(seed);
        this.wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${index}`).getWallet();
    }

    chainid = async (): Promise<number> => {
        return await this.web3.eth.getChainId();
    }

    balance = async(unit: Unit): Promise<string> => {
        const wei = await this.web3.eth.getBalance(this.wallet.getAddressString());
        return this.web3.utils.fromWei(wei, unit);
    }

    sendFromUnknown = async (from: string, txData: TxData): Promise<any> => {
        const unlock = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'evm_unlockUnknownAccount',
            params: [from]
        });
        assert(unlock.data.result == true, `unlocking ${from} failed`);

        const tx = Transaction.fromTxData(txData, { common: this.common });
        
        const resHash = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'eth_sendTransaction',
            params: [{
                from: from,
                to: tx.to?.toString(),
                gasLimit: this.web3.utils.numberToHex(tx.gasLimit),
                gasPrice: this.web3.utils.numberToHex(tx.gasPrice),
                value: this.web3.utils.numberToHex(tx.value),
                data: `0x${tx.data.toString('hex')}`
            }]
        });

        console.log('sent:', resHash.data);

        const resReceipt = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [resHash.data.result]
        });
        const receipt = resReceipt.data.result;
        return receipt;
    }

    send = async (txData: TxData): Promise<any> => {
        const tx = Transaction.fromTxData(txData, { common: this.common });
        const signed = tx.sign(this.wallet.getPrivateKey());
        const serialized = signed.serialize().toString('hex');

        // console.log(serialized);
        const resHash = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'eth_sendRawTransaction',
            params: [serialized]
        });
        
        console.log('sent:', resHash.data);

        const resReceipt = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [resHash.data.result]
        });
        const receipt = resReceipt.data.result;
        return receipt;
    }

    transfer = async (to: string, value: BN): Promise<any> => {
        const nonce = await this.web3.eth.getTransactionCount(this.wallet.getChecksumAddressString());
        const txData = {
            from: this.wallet.getAddressString(),
            to: to,
            gasLimit: this.web3.utils.toHex('80000'),
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('0', 'gwei')),
            value: this.web3.utils.toHex(value),
            nonce: this.web3.utils.toHex(nonce),
        };
        const receipt = await this.send(txData);
        return receipt;
    }

    transferFromUnknown = async (from: string, to: string, value: BN): Promise<any> => {
        const nonce = await this.web3.eth.getTransactionCount(this.wallet.getChecksumAddressString());
        const txData = {
            from: from,
            to: to,
            gasLimit: this.web3.utils.toHex('80000'),
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('0', 'gwei')),
            value: this.web3.utils.toHex(value),
            nonce: this.web3.utils.toHex(nonce),
        };
        const receipt = await this.sendFromUnknown(from, txData);
        return receipt;
    }

    deployContract = async (bytecode: string, value: {value: string, unit?: string} = {value: '0'}): Promise<string> => {
        const nonce = await this.web3.eth.getTransactionCount(this.wallet.getChecksumAddressString());
        const txData = {
            from: this.wallet.getAddressString(),
            gasLimit: this.web3.utils.toHex('12500000'),
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('1', 'gwei')),
            value: this.web3.utils.toHex(this.web3.utils.toWei(value.value, toUnit(value.unit))),
            nonce: this.web3.utils.toHex(nonce),
            data: `0x${bytecode.toString()}`
        };
        const receipt = await this.send(txData);
        console.log('Deployment Receipt:', receipt);
        return receipt.contractAddress;
    }

    callContract = async (contractAddress: string, data: Buffer, value: {value: string, unit?: string} = {value: '0'}): Promise<any> => {
        const nonce = await this.web3.eth.getTransactionCount(this.wallet.getChecksumAddressString());
        const txData = {
            from: this.wallet.getAddressString(),
            gasLimit: this.web3.utils.toHex('12500000'),
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('1', 'gwei')),
            value: this.web3.utils.toHex(this.web3.utils.toWei(value.value, toUnit(value.unit))),
            to: contractAddress,
            nonce: this.web3.utils.toHex(nonce),
            data: `0x${data.toString('hex')}`
        };
        const receipt = await this.send(txData);
        return receipt;
    }

    callContractFromUnknown = async (from: string, contractAddress: string, data: Buffer, value: {value: string, unit?: string} = {value: '0'}): Promise<any> => {
        const nonce = await this.web3.eth.getTransactionCount(this.wallet.getChecksumAddressString());
        const txData = {
            from: from,
            gasLimit: this.web3.utils.toHex('12500000'),
            gasPrice: this.web3.utils.toHex(this.web3.utils.toWei('1', 'gwei')),
            value: this.web3.utils.toHex(this.web3.utils.toWei(value.value, toUnit(value.unit))),
            to: contractAddress,
            nonce: this.web3.utils.toHex(nonce),
            data: `0x${data.toString('hex')}`
        };
        const receipt = await this.sendFromUnknown(from, txData);
        return receipt;
    }

    viewContract = async (contractAddress: string, data: Buffer): Promise<string> => {
        const txData = {
            from: this.wallet.getAddressString(),
            to: contractAddress,
            data: `0x${data.toString('hex')}`
        };
        const res = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'eth_call',
            params: [txData, 'latest']
        });
        return res.data.result;
    }

    traceTransaction = async (txHash: string): Promise<any> => {
        const res = await axios.post(this.endpoint, {
            jsonrpc: '2.0',
            method: 'debug_traceTransaction',
            params: [txHash, {}]
        });
        return res.data;
    }
}

const toUnit = (unit?: string): Unit => {
    switch(unit){
        case 'wei':
            return 'wei';
        case 'gwei':
            return 'gwei';
        case 'ether':
            return 'ether';
        default:
            console.log('default unit is ether');
            return 'ether';
    }
}