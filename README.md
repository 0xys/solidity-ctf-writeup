# Writeup of Solidity&EVM challenges
Create `config.secret.json` with following contents.
```
{
    "mnemonic": "<YOUR_MNEMONIC>"
}
```

Run following command in sub terminal.
```
ganache-cli --fork "<YOUR_FULLNODE_ENDPOINT>" --chainId 1 --mnemonic "<YOUR_MNEMONIC>" -l 100000000 -g 0 --defaultBalanceEther 100000
```

On main terminal, run following command.
```
npm start
```