const common = require("./common");
const { arrayify } = require("ethers/lib/utils");

module.exports.signParticipate = async (signerWallet, nonce, deadline) => {

    // The named list of all type definitions
    const ParticipateType = require("../utils/Types").Participate;

    const signer = signerWallet
    const signature = arrayify(await signer._signTypedData(common.getDomain(), ParticipateType, {
        nonce: nonce,
        deadline: deadline,
    }));

    return signature;

}

module.exports.signRemoveMember = async (signerWallet, member, nonce, deadline) => {

    const type = require("../utils/Types").RemoveMember;

    const signer = signerWallet
    const signature = arrayify(await signer._signTypedData(common.getDomain(), type, {
        member: member,
        nonce: nonce,
        deadline: deadline,
    }));

    return signature;

}
module.exports.signSetQourum = async (signerWallet, newQourum, nonce, deadline) => {

    const type = require('../utils/Types').SetQourum;


    const signature = arrayify(await signerWallet._signTypedData(common.getDomain(), type, {
        newQourum: newQourum,
        nonce: nonce,
        deadline: deadline,
    }));

    return signature;

}