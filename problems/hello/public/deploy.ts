import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';

import setting from '../setting.json';

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
 * @returns address of Setup contract
 */
export const deploy = async (deployer: Sender, valueEth: number = 0): Promise<string> => {
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return 'fail';
    }

    const bytecode = output['contracts']['public/Setup.sol']['Setup'].evm.bytecode.object;
    const contractAddress = await deployer.deployContract(bytecode, 0);
    console.log('public/Setup.sol', contractAddress);
    return contractAddress;
}