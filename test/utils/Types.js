//Participate(uint256 nonce,uint256 deadline)
module.exports.Participate = {
    'Participate': [
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ],

}
//RemoveMember(address member,uint256 nonce,uint256 deadline)
module.exports.RemoveMember = {
    
    'RemoveMember': [
        { name: "member", type: "address" },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ],

}

module.exports.SetQourum = {
    'SetQourum': [
        { name: 'newQourum', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
    ],

};