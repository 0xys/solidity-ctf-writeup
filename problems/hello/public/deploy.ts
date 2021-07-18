import * as fs from 'fs';
import path from 'path';
import { Sender } from '../../../lib/sender';

const solc = require('solc');
const abi = require('ethereumjs-abi');

const pather = (filepath: string): string => {
    return path.join(__dirname, '../../../problems/hello/', filepath)
}

const findFileContent = (filepath: string): string => {
    return fs.readFileSync(pather(filepath)).toString();
    // if (filepath == './public/Hello.sol') {
    //     return fs.readFileSync(pather(filepath)).toString();
    // }else if(filepath == './public/Setup.sol') {
    //     return fs.readFileSync('hello/Setup.sol').toString();
    // }else if(filepath == './Exploit.sol') {
    //     return fs.readFileSync('hello/Exploit.sol').toString();
    // }else if(filepath == './Test.sol') {
    //     return fs.readFileSync('hello/Test.sol').toString();
    // }
    // throw new Error(`${filepath} not found`);
}

const input = {
    language: 'Solidity',
    sources: {
        //  public
        'public/Setup.sol': {
            content: findFileContent('public/Setup.sol')
        },
        'public/Hello.sol': {
            content: findFileContent('public/Hello.sol')
        },
        'public/Test.sol': {
            content: findFileContent('public/Test.sol')
        },

        //  private
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
};

const deploy = (deployer: Sender, version: string, valueEth: number = 0): string => {
    solc.loadRemoteVersion('v0.8.0+commit.c7dfd78e',
        async (err: any, compiler: any) => {
            const output = JSON.parse(
                compiler.compile(JSON.stringify(input), { import: findFileContent })
            );
            if(output.errors.length > 0){
                var error = false;
                output.errors.forEach((e: any) => {
                    if(e.severity == 'error'){
                        error = true;
                    }
                });
                console.log(output.errors);
                if(error) return;
            }

            const bytecode = output['contracts']['public/Setup.sol']['Setup'].evm.bytecode.object;
            const contractAddress = await deployer.deployContract(bytecode, valueEth);
            console.log('contract address:', contractAddress);

            return contractAddress;
        }
    );

    return '';
}