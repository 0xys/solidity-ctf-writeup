import Web3 from 'web3';
import Common from '@ethereumjs/common';
import { Sender } from './lib/sender';
import config from './config.secret.json';

const endpoint = 'http://127.0.0.1:8545';

const web3 = new Web3(endpoint);
const mnemonic = config.mnemonic;
const common = new Common({ chain: 'mainnet', hardfork: 'berlin' });

import { deploy } from './problems/secure/public/deploy';
import { solve } from './problems/secure/private/solve';

(async () => {
    try{
        const deployer = new Sender(web3, endpoint, mnemonic, 0, common);
        const setupAddress = await deploy(deployer);

        const exploiter = new Sender(web3, endpoint, mnemonic, 1, common);
        const result = await solve(exploiter, setupAddress);

        console.log('solved:', result);
    }catch(e){
        console.log(e);
    }    
})();