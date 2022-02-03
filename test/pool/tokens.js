const { ethers } = require("hardhat");
const { expect } = require("chai");
const { Wallet } = require("ethers");

const common = require("../utils/common");
function importTest() {

    describe("Tokens", () => {

        it("Should check the number of tokens", async () => {
            const tokens = await common.contract['BalanceOf(address)'](common.accounts[0].address)
            expect(tokens.toString()).to.equal(BigInt(common.INITIAL_DEPOSIT).toString());
        });

        it("Validates non-member balance", async () => {
            const w = Wallet.createRandom();
            const tokens = await common.contract['BalanceOf(address)'](w.address);
            expect(tokens.toString()).to.equal(BigInt(0).toString());

        });

        it("validates tokens total supply", async () => {
            let supply = BigInt(0);
            for (let i = 0; i < common.accounts.length; i++) {
                supply += BigInt(await common.contract['BalanceOf(address)'](common.accounts[i].address))
            }
            const totalSupply = await common.contract['TotalSupply()']()
            expect(totalSupply).to.be.equal((supply));
        })
    })
};

module.exports.importTest = importTest;