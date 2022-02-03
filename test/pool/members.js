const { ethers } = require("hardhat");
const common = require("../utils/common");
const { expect, assert } = require("chai");
const { arrayify } = require("ethers/lib/utils");


const { signParticipate, signRemoveMember } = require("../utils/signs");
module.exports.importTest = function importTest() {

    describe("Members", () => {

        it("Adds a new member", async () => {
            const pool = common.contract;
            const deadline = BigInt(9999999999999)
            // get min deposit
            const minDepo = BigInt(await pool.MinimumDeposit());

            const signature = await signParticipate(common.accounts[0],
                common.NONCE++,
                deadline
            );

            const toDepo = minDepo + BigInt(100);
            await expect(pool.connect(common.accounts[1])
                .Participate([signature], deadline, { value: toDepo }))
                .to.emit(pool, 'NewMember')
                .withArgs(common.accounts[1].address, toDepo);

            expect(await pool.BalanceOf(common.accounts[1].address)).to.be.equal(BigInt(toDepo));
        });
        it("Check total members", async () => {
            expect(await common.contract.TotalMembers()).to.to.equal(2);// 
        });

        it("Removes a member", async () => {
            const pool = common.contract;
            const deadline = BigInt(9999999999999)
            // get min deposit
            const minDepo = BigInt(await pool.MinimumDeposit());

            // add a member first
            const signature = await signParticipate(common.accounts[0],
                common.NONCE++,
                deadline
            );

            const currentQourum = BigInt(await common.contract.Quorum());
            const currentSupply = BigInt(await common.contract['TotalSupply()']());

            const toDepo = minDepo;
            await expect(pool.connect(common.accounts[2])
                .Participate([signature], deadline, { value: toDepo }))
                .to.emit(pool, 'NewMember')
                .withArgs(common.accounts[2].address, toDepo)



            const signatureRemoveMember = await signRemoveMember(common.accounts[0],
                common.accounts[2].address,
                common.NONCE++,
                deadline
            );

            await expect(pool.RemoveMember([signatureRemoveMember], common.accounts[2].address, deadline))
                .to.emit(pool, 'MemberRemoved')
                .withArgs(common.accounts[2].address, 1);// type


            assert(BigInt(await common.contract.Quorum()) === currentQourum, "Qourum shouldn't change when a member is removed");

            assert(BigInt(await common.contract['TotalSupply()']()) === currentSupply, "Removing a member should decrease the supply by removed member's token")

        });
        it("Check total members", async () => {
            expect(await common.contract.TotalMembers()).to.to.equal(2);// 
        });


    })
};