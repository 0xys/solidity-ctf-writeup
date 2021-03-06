import { SolCompiler } from '../../../../lib/compiler';
import { Sender } from '../../../../lib/sender';
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

            //  private/<FILE_NAME>.sol
            'private/Challenge.sol': {
                content: findFileContent('private/Challenge.sol')
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
    const bytecode = output['contracts']['private/Challenge.sol']['Challenge'].evm.bytecode.object;
    const contractAddress = await exploiter.deployContract(bytecode+'000000000000000000000000'+setupAddress.slice(2));
    console.log('private/Challenge.sol', contractAddress);

    const data = abi.simpleEncode('isSolved()');
    const res = await exploiter.viewContract(setupAddress, data)
    return res === '0x0000000000000000000000000000000000000000000000000000000000000001';
}