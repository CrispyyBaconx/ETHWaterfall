const { ethers } = require("ethers");
require('dotenv').config();
const path = require("path");
const fs = require('fs');
const provider = new ethers.providers.getDefaultProvider(process.env.NETWORK);
const AMOUNT_TO_SEND = process.env.AMOUNT_TO_SEND; // has to be in each wallet, or that wallet's txn will revert

async function main() {
    await getKeys().then(async (pairs) => {
        for(var i = 0; i < pairs.length; i++) {
            const txn = {
                to: pairs[i].to,
                value: ethers.utils.parseEther(AMOUNT_TO_SEND),
                gasLimit: ethers.utils.parseUnits('21000', 'gwei'),
                maxFeePerGas: ethers.utils.parseUnits("50", "gwei"), // put gas details here
                maxPriorityFeePerGas: ethers.utils.parseUnits("1.5", "gwei")
            }

            await new ethers.Wallet(pairs[i].from, provider).sendTransaction(txn).then(async (txn) => {
                console.log(`Transaction sent: ${txn.hash}`);
            });
        }
    }).catch(err => { console.error(err) });
}

async function getKeys() {
    return new Promise(async (resolve, reject) => {
        let pairs = [];
        let to = fs.readFileSync(path.resolve(__dirname, 'input\\to.txt'), 'utf8').split('\n');
        let from = fs.readFileSync(path.resolve(__dirname, 'input\\from.txt'), 'utf8').split('\n');

        if(to.length === from.length) { // this block will not execute if you have a newline at the end of one file but not the other
            for(let i = 0; i < to.length; i++) {
                if(to[i].length > 0) {
                    pairs.push({
                        to: to[i].replace("\r", ""),
                        from: from[i].replace("\r", "")
                    })
                }
            }
        } else {
            reject('From and To inputs must have a 1:1 wallet ratio');
        }

        resolve(pairs);
    });
}

main();