import { SolCompiler } from '../../../../lib/compiler';
import { Sender } from '../../../../lib/sender';

import setting from '../setting.json';

// const input = (findFileContent: any): any => {
//     return {
//         language: 'Solidity',
//         sources: {
//             //  public/<FILE_NAME>.sol
//             'public/Proxy.sol': {
//                 content: findFileContent('public/Setup.sol')
//             },
//             //  private/<FILE_NAME>.sol
//             'private/Exploit.sol': {
//                 content: findFileContent('private/Exploit.sol')
//             },
//         },
//         settings: {
//             outputSelection: {
//                 '*': {
//                     '*': ['*']
//                 }
//             }
//         }
//     }
// }

/// This exercise doesn't contain setup.
/// Taken from https://medium.com/nomic-labs-blog/malicious-backdoors-in-ethereum-proxies-62629adf3357
/**
 * 
 * @param deployer 
 * @param version 
 * @param valueEth 
 * @returns address of Setup contract
 */
export const deploy = async (deployer: Sender): Promise<string> => {
    // const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    // const {success, output} = await compiler.compile(input);
    // if(!success){
    //     console.log('fail compilation');
    //     return 'fail';
    // }

    // const bytecode = output['contracts']['public/Setup.sol']['Setup'].evm.bytecode.object;
    // const contractAddress = await deployer.deployContract(bytecode, setting.problem.deploy_value);
    // console.log('public/Setup.sol', contractAddress);
    return '0xB97DD0102bB67f81d25D686C661d7F0AED62E344';
}