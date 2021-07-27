import { BADNAME } from 'dns';
import { SolCompiler } from '../../../lib/compiler';
import { Sender } from '../../../lib/sender';
import BN from 'bn.js';

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

    {
        const vitalik = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
        const temp = "0x1489392198444892570aaaaaaaaaaaaaaaaaaaaa";
        const receipt = await deployer.transferFromUnknown(vitalik, temp, new BN('100000000000000'));
        console.log('test transfer from vitalik:', receipt);
    }

    //  change admin
    // {
    //     const owner = "0x807a96288A1A408dBC13DE2b1d087d10356395d2";
    //     const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    //     const data = Buffer.concat([Buffer.from("8f283970000000000000000000000000"), Buffer.from(contractAddress.slice(2))]);
    //     const receipt = await deployer.callContractFromUnknown(owner, usdc, data);
    //     console.log('call changeAdmin():', receipt);
    // }

    // //  call Setup.upgrade() method
    // {
    //     const data = abi.simpleEncode('upgrade()');
    //     const receipt = await deployer.callContract(contractAddress, data);
    //     console.log('call upgrade():', receipt);
    // }

    return contractAddress;
}