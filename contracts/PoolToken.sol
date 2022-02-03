pragma solidity ^0.8.0;

// @dev: NOT ERC20 compliant
contract PoolToken {
    mapping(address => uint256) internal memberTokens;
    uint256 private supply = 0;

    event TokensMinted(address who, uint256 amount);

    constructor() public {}

    function BalanceOf(address _memberTokens) public view returns (uint256) {
        return memberTokens[_memberTokens];
    }

    function mintTokens(address _member, uint256 _amount) internal {
        memberTokens[_member] += _amount;
        supply += _amount;
        emit TokensMinted(_member, _amount);
    }

    function TotalSupply() public view returns (uint256) {
        return supply;
    }

    function burnTokens(address _member, uint256 _amount) internal {
        require(BalanceOf(_member) >= _amount, "burn amount exceeds balance");
        memberTokens[_member] -= _amount;
        supply -= _amount;
    }
}
