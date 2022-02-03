
let common = {
    INITIAL_DEPOSIT: 1000,
    DOMAIN_NAME: "Pool",
    DOMAIN_VER : "1",
    NONCE : 1,
    CHAIN_ID: require('../../hardhat.config').networks.hardhat.chainId || 31337,
    contract: null,
    accounts:[],
    getDomain: function() {

        return {
            name: this.DOMAIN_NAME,
            version: this.DOMAIN_VER,
            chainId: this.CHAIN_ID,
            verifyingContract: this.contract.address,
        };
    }

}


module.exports = common;