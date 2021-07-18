import Web3 from 'web3';
import * as fs from 'fs';
import Common from '@ethereumjs/common';
import { Sender } from './lib/sender';

const endpoint = 'http://127.0.0.1:8545';
const solc = require('solc');
const abi = require('ethereumjs-abi');

const web3 = new Web3(endpoint);
const mnemonic = 'anxiety write moment screen deposit dolphin aim brown grain canal chef tired';
const common = new Common({ chain: 'mainnet', hardfork: 'berlin' });

import { deploy } from './problems/hello/public/deploy';

const findFileContent = (path: string): string => {
    if (path == './Hello.sol') {
        return fs.readFileSync('hello/Hello.sol').toString();
    }else if(path == './Setup.sol') {
        return fs.readFileSync('hello/Setup.sol').toString();
    }else if(path == './Exploit.sol') {
        return fs.readFileSync('hello/Exploit.sol').toString();
    }else if(path == './Test.sol') {
        return fs.readFileSync('hello/Test.sol').toString();
    }
    throw new Error(`${path} not found`);
}

const input = {
    language: 'Solidity',
    sources: {
      'hello/Setup.sol': {
        content: findFileContent('./Setup.sol')
      },
      'hello/Hello.sol': {
        content: findFileContent('./Hello.sol')
      },
      'hello/Exploit.sol': {
        content: findFileContent('./Exploit.sol')
      },
      'hello/Test.sol': {
        content: findFileContent('./Test.sol')
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

const loadCompileVersion = (version: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    solc.loadRemoteVersion(version, (err: any, compiler: any) => {
      if(err) reject(err);
      resolve(compiler);
    })
  });
}

(async () => {
    try{

      const sender = new Sender(web3, endpoint, mnemonic, 0, common);
      console.log(`sender: ${sender.wallet.getChecksumAddressString()}`);
      const balance = await sender.balance('ether');
      console.log(`sender balance: ${balance} ETH`);
      const chainid = await sender.chainid();
      console.log('chainid', chainid);

      const height = await web3.eth.getBlockNumber();
      console.log(height);


      // const compiler = new SolCompiler('v0.8.0+commit.c7dfd78e', 'hello');
      // const { success, output } = await compiler.compile(input);
      // if(!success){
      //   console.log('fail compilation');
      //   return;
      // }
      // const bytecode = output['contracts']['hello/Test.sol']['Test'].evm.bytecode.object;
      // console.log('compiled:', bytecode);

      // const contractAddress = await sender.deployContract(bytecode, 0);
      // console.log('contract address:', contractAddress);

      const contractAddress = await deploy(sender, 'v0.8.0+commit.c7dfd78e');

      {
          const data = abi.simpleEncode('exec(uint)', 123);
          console.log(data.toString('hex'));

          const receipt = await sender.callContract(contractAddress, data);
          console.log(receipt);
      }
      {
          const data = abi.simpleEncode('pay()');
          console.log(data.toString('hex'));

          const receipt = await sender.callContract(contractAddress, data, 1);
          console.log(receipt);
      }
      {
          const data = abi.simpleEncode('get()');
          console.log('data:', data.toString('hex'));

          const result = await sender.viewContract(contractAddress, data);
          console.log('result:', result);
          const decoded = abi.rawDecode(['uint'], result);
          console.log(decoded.toString());

          // const receipt = await sender.callContract(contractAddress, data);
          // console.log(receipt);

          // const trace = await sender.traceTransaction(receipt.transactionHash);
          // console.log(trace);
      }
    }catch(e){
      console.log(e);
    }

    
})();