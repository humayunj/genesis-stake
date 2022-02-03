const { ethers } = require("hardhat");
const common = require("../utils/common");
const { expect, assert } = require("chai");
const { arrayify } = require("ethers/lib/utils");
const { NONCE, accounts } = require("../utils/common");

const {signSetQourum} = require("../utils/signs");
module.exports.importTest = function importTest() {

    describe("Qourum", () => {

        it("Should not accept qourum exceeding total supply", async () => {
            const supply = BigInt(await common.contract['TotalSupply()']());
            const currentQourum = BigInt(await common.contract.Quorum());

            const newQourum = supply + BigInt(1);
            const deadline = BigInt(9999999999999);
            // Don't increament NONCE because Transaction is reverted before NONCE is increamented in contract
            const signature = await signSetQourum(common.accounts[0], newQourum, common.NONCE, deadline)


            await expect(common.contract.SetQourum([signature], BigInt(newQourum), deadline)).to.be.revertedWith("Qourum should be between 1 and total assigned votes");
            expect(BigInt(await common.contract.Quorum())).to.be.equal(currentQourum);
        });


        it("Sets new qourum to total supply", async () => {

            const newQourum = BigInt(await common.contract['TotalSupply()']());

            const deadline = BigInt(9999999999999);
            const signature = await signSetQourum(common.accounts[0], newQourum, common.NONCE++, deadline)

            await expect(common.contract.SetQourum([signature], BigInt(newQourum), deadline)).to.emit(common.contract, 'QourumUpdated').withArgs(BigInt(newQourum));
            expect(BigInt(await common.contract.Quorum())).to.be.equal(newQourum);
        });


        it("Updating qourum with insufficent votes should fail", async () => {

            const currentQourum = BigInt(await common.contract.Quorum());

            

            const signer = common.accounts[0].address;

            const newQourum = BigInt(1);
            const deadline = BigInt(9999999999999);
            // signer should have less votes because a member was added
            const signature = await signSetQourum(common.accounts[0], newQourum, common.NONCE, deadline)

            await expect(common.contract.SetQourum([signature], BigInt(newQourum), deadline)).to.be.revertedWith("InsufficientVotes");
            expect(BigInt(await common.contract.Quorum())).to.be.equal(currentQourum);
        });

        it("Updating qourum with multiple signs", async () => {

            const currentQourum = BigInt(await common.contract.Quorum());

            
            const newQourum = BigInt(100);
            const deadline = BigInt(9999999999999);
            // signer should have less votes because a member was added

            const signers = [common.accounts[0], common.accounts[1]].sort((a, b) => Number(BigInt(a.address) - BigInt(b.address)))
            const signatures = await Promise.all( signers.map(s=>signSetQourum(s, newQourum, common.NONCE, deadline)));
            
            common.NONCE++;

            await expect(common.contract.SetQourum(signatures, newQourum, deadline)).to.emit(common.contract, 'QourumUpdated').withArgs(BigInt(newQourum));
            expect(BigInt(await common.contract.Quorum())).to.be.equal(currentQourum);
        });

    })
};