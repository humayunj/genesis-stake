const { ethers } = require("hardhat");
const common = require("../utils/common");
const { expect } = require("chai");
const { arrayify } = require("ethers/lib/utils");


module.exports.importTest = function importTest() {

    describe("Funds", () => {

        it("Update minimum deposit", async () => {

            const NEW_MIN_DEPOSIT = 100;
            const deadline = BigInt(9999999999999);

        
            // The named list of all type definitions
            //setMinimumDeposit(uint256 newMinDeposit,uint256 nonce,uint256 deadline)
            const types = {
                'setMinimumDeposit': [
                    { name: 'newMinDeposit', type: 'uint256' },
                    { name: 'nonce', type: 'uint256' },
                    { name: 'deadline', type: 'uint256' }
                ],

            };

            // The data to sign
            const value = {
                newMinDeposit: BigInt(NEW_MIN_DEPOSIT),
                nonce: BigInt(common.NONCE++),
                deadline: deadline,
            };


            const signer = common.accounts[0];
            const signature = arrayify(await signer._signTypedData(common.getDomain(), types, value));


            await expect(common.contract.SetMinimumDeposit(BigInt(NEW_MIN_DEPOSIT), [signature], deadline)).to.emit(common.contract, 'MinimumDepositUpdated').withArgs(BigInt(NEW_MIN_DEPOSIT));
            expect(BigInt(await common.contract.MinimumDeposit())).to.be.equal(BigInt(NEW_MIN_DEPOSIT));
        });

        it("validates fund withdrawl", async () => {
            const sender = common.accounts[0].address;
            const blnc = BigInt(await common.contract.BalanceOf(sender));
            const blncToWithdraw = (blnc / BigInt(2));
            await expect(common.contract.Withdraw(sender, blncToWithdraw)).to.emit(common.contract, 'FundsWithdraw').withArgs(sender, sender, blncToWithdraw);
            expect(BigInt(await common.contract.BalanceOf(sender))).to.be.equal(blnc - blncToWithdraw);

        })

        it("Validates fund deposit", async () => {
            const sender = common.accounts[0].address;
            const blnc = BigInt(await common.contract.BalanceOf(sender));

            const blncToDeposit = blnc;
            await expect(common.contract.DepositFunds({ value: blncToDeposit })).to.emit(common.contract, 'FundsDeposit').withArgs(sender, blncToDeposit);
            expect(BigInt(await common.contract.BalanceOf(sender))).to.be.equal(blnc + blncToDeposit);
        })
    })
};