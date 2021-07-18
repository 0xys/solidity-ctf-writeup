import * as fs from 'fs';
import path from 'path';
import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';

const solc = require('solc');
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
            'public/Test.sol': {
                content: findFileContent('public/Test.sol')
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
 * @param deployer 
 * @param version 
 * @param valueEth 
 * @returns contract address of Setup contract
 */
export const deploy = async (deployer: Sender, version: string, valueEth: number = 0): Promise<string> => {
    const compiler = new SolCompiler(version, 'hello');
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return 'fail';
    }

    const bytecode = output['contracts']['public/Test.sol']['Test'].evm.bytecode.object;
    const contractAddress = await deployer.deployContract(bytecode, 0);
    return contractAddress;
}