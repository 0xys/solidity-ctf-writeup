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
            'public/IERC20.sol': {
                content: findFileContent('public/IERC20.sol')
            },
            'public/Token.sol': {
                content: findFileContent('public/Token.sol')
            },

            //  private/<FILE_NAME>.sol
            'private/Solve.sol': {
                content: findFileContent('private/Solve.sol')
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
 * @param solver 
 * @param version 
 * @param setupAddress 
 * @param valueEth 
 * @returns true if solved, false otherwise.
 */
export const solve = async (solver: Sender, setupAddress: string): Promise<boolean> => {
    await solver.nonce();
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return false;
    }
    const bytecode = output['contracts']['private/Solve.sol']['Solve'].evm.bytecode.object;
    const solverContractAddress = await solver.deployContract(bytecode+'000000000000000000000000'+setupAddress.slice(2));
    console.log('private/Solve.sol', solverContractAddress);

    const data = abi.simpleEncode('isSolved()');
    const res = await solver.viewContract(setupAddress, data)
    return res === '0x0000000000000000000000000000000000000000000000000000000000000001';
}