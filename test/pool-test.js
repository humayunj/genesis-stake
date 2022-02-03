const { expect } = require("chai");
const { arrayify } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const { TypedDataUtils } = require('ethers-eip712');
const common = require("./utils/common");

describe("Pool", function () {

  before(async () => {
    const Fact = await ethers.getContractFactory('Pool');
    const MIN_DEPOSIT = 1;
    common.contract = await Fact.deploy(common.DOMAIN_NAME, common.DOMAIN_VER, MIN_DEPOSIT, { value: common.INITIAL_DEPOSIT });// min deposit
    await common.contract.deployed();
    common.accounts = await ethers.getSigners();
  })



  require("./pool/tokens").importTest();
  require("./pool/funds").importTest();
  require("./pool/executions").importTest();
  require("./pool/members").importTest();
  require("./pool/qourum").importTest();


});
