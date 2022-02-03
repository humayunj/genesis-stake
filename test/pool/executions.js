const { ethers } = require("hardhat");
const common = require("../utils/common");
const { expect } = require("chai");
const { arrayify } = require("ethers/lib/utils");

module.exports.importTest = function importTest() {

    describe("Executions", () => {

        it("Execute a Transaction", async () => {

            const deadline = BigInt(9999999999999);

            //Execute(address target,uint256 value,bytes payload,uint256 nonce,uint256 deadline)
            const types = {
                'Execute': [
                    { name: 'target', type: 'address' },
                    { name: 'value', type: 'uint256' },
                    { name: 'payload', type: 'bytes' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' }
                ],

            };

            // The data to sign
            const value = {
                target: common.accounts[1].address,
                value: 10,
                payload: [],
                nonce: common.NONCE++,
                deadline: deadline,
            };

            const newBlnc = BigInt(await ethers.provider.getBalance(common.accounts[1].address)) + BigInt(10);
            const signer = common.accounts[0];
            const signature = arrayify(await signer._signTypedData(common.getDomain(), types, value));


            await expect(common.contract.Execute([signature], common.accounts[1].address, [], 10, deadline)).to.emit(common.contract, 'TransactionSucceeded');
            expect((await ethers.provider.getBalance(common.accounts[1].address)).toString()).to.be.equal(newBlnc.toString());

        });

    })
};