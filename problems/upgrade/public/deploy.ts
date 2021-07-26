import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';

const abi = require('ethereumjs-abi');
import setting from '../setting.json';

const input = (findFileContent: any): any => {
    return {
        language: 'Solidity',
        sources: {
            //  public/<FILE_NAME>.sol
            'public/Setup.sol': {
                content: findFileContent('public/Setup.sol')
            },
            'public/FiatTokenV2.sol': {
                content: findFileContent('public/FiatTokenV2.sol')
            },
            'public/FiatTokenV3.sol': {
                content: findFileContent('public/FiatTokenV3.sol')
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
export const deploy = async (deployer: Sender): Promise<string> => {
    const compiler = new SolCompiler(setting.solc.version, setting.problem.name);
    const {success, output} = await compiler.compile(input);
    if(!success){
        console.log('fail compilation');
        return 'fail';
    }

    const bytecode = output['contracts']['public/Setup.sol']['Setup'].evm.bytecode.object;
    const contractAddress = await deployer.deployContract(bytecode, setting.problem.deploy_value);
    console.log('public/Setup.sol', contractAddress);

    //  call Setup.upgrade() method
    const data = abi.simpleEncode('upgrade()');
    const receipt = await deployer.callContract(contractAddress, data);
    console.log('call upgrade():', receipt);

    return contractAddress;
}