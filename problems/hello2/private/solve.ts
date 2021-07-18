import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';
import setting from '../setting.json';

const abi = require('ethereumjs-abi');

const input = (findFileContent: any): any => {
    return {
        language: 'Solidity',
        sources: {
            //  public/<FILE_NAME>.sol
            'public/Setup.sol': {
                content: findFileContent('public/Setup.sol')
            },
            'public/Hello.sol': {
                content: findFileContent('public/Hello.sol')
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
 * @param version 
 * @param setupAddress 
 * @param valueEth 
 * @returns true if solved, false otherwise.
 */
export const solve = async (exploiter: Sender, setupAddress: string, valueEth: number = 0): Promise<boolean> => {
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return false;
    }
    const bytecode = output['contracts']['private/Exploit.sol']['Exploit'].evm.bytecode.object;
    const exploitContractAddress = await exploiter.deployContract(bytecode+'000000000000000000000000'+setupAddress.slice(2), valueEth);
    console.log('private/Exploit.sol', exploitContractAddress);

    const calldata = abi.simpleEncode('solve()');
    const receipt = await exploiter.callContract(exploitContractAddress, calldata);
    console.log('call solve() receipt:', receipt);

    const data = abi.simpleEncode('isSolved()');
    const res = await exploiter.viewContract(setupAddress, data)
    return res === '0x0000000000000000000000000000000000000000000000000000000000000001';
}