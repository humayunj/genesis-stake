pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";
import "./PoolToken.sol";

contract Pool is EIP712, PoolToken {
    uint256 public Quorum; // number of tokens required
    uint256 public MinimumDeposit;

    // to avoid same-sigs
    uint256 public nonce = 1;

    uint256 public TotalMembers = 0;

    // errors
    error InvalidSignatures();
    error SignaturesExpired();
    error TransactionExecutionFailed();
    error InsufficientIntitialDeposit();
    error InsufficientVotes();
    error NotAMember();
    error WithdrawFailed();

    // events
    event ValueReceived(address sender, uint256 value);
    event TransactionSucceeded(address target, uint256 value, bytes payload);
    event FundsDeposit(address member, uint256 amount);

    event QourumUpdated(uint256 newQourum);
    event MinimumDepositUpdated(uint256 newMinimumDeposit);
    event NewMember(address member, uint256 initDeposit);
    event MemberRemoved(address member, uint256 removalType);
    event FundsWithdraw(address member, address to, uint256 amount);

    constructor(
        string memory _poolName,
        string memory _version,
        uint256 _minimumDeposit
    ) payable EIP712(_poolName, _version) PoolToken() {
        require(
            _minimumDeposit > 0,
            "Minimum deposit must be positive integer"
        );

        MinimumDeposit = _minimumDeposit;

        initialDeposit(msg.sender, msg.value);

        Quorum = msg.value;
        TotalMembers = 1;
    }

    /**
        @dev Internal method for initial deposits
     */
    function initialDeposit(address who, uint256 amount) internal {
        if (amount < MinimumDeposit) {
            revert InsufficientIntitialDeposit();
        }
        PoolToken.mintTokens(who, amount);
    }

    /**
        @notice Use this to deposit new funds into your account,
                must be a member before!
        @dev Mints new tokens
     */
    function DepositFunds() public payable {
        require(msg.value > 0, "Deposit amount must be positive");
        if (BalanceOf(msg.sender) == 0) {
            // must be a member
            revert NotAMember();
        }
        mintTokens(msg.sender, msg.value);
        // Quorum += msg.value; // increase the qourum
        emit FundsDeposit(msg.sender, msg.value);
    }

    /**
        @notice Executes a transaction
     */
    function Execute(
        bytes[] memory _signatures,
        address _target,
        bytes memory _payload,
        uint256 _value,
        uint256 _deadline
    ) external {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "Execute(address target,uint256 value,bytes payload,uint256 nonce,uint256 deadline)"
                    ),
                    _target,
                    _value,
                    keccak256(_payload),
                    nonce,
                    _deadline
                )
            )
        );
        nonce++;

        if (block.timestamp >= _deadline) {
            revert SignaturesExpired();
        }

        if (calculateVotes(_signatures, digest) < Quorum) {
            revert InsufficientVotes();
        }
        (bool success, ) = _target.call{value: _value}(_payload);
        if (!success) {
            revert TransactionExecutionFailed();
        }
        emit TransactionSucceeded(_target, _value, _payload);
    }

    /**
        @notice Set new Quorum
                Require approval of preivous Quorum 
     */
    function SetQourum(
        bytes[] memory _signatures,
        uint256 _newQourum,
        uint256 _deadline
    ) public {
        require(
            _newQourum > 0 && _newQourum <= PoolToken.TotalSupply(),
            "Qourum should be between 1 and total assigned votes"
        );

        if (block.timestamp >= _deadline) {
            revert SignaturesExpired();
        }

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "SetQourum(uint256 newQourum,uint256 nonce,uint256 deadline)"
                    ),
                    _newQourum,
                    nonce++,
                    _deadline
                )
            )
        );

        if (calculateVotes(_signatures, digest) < Quorum) {
            revert InsufficientVotes();
        }
        Quorum = _newQourum;
        emit QourumUpdated(_newQourum);
    }

    function SetMinimumDeposit(
        uint256 _newMinDeposit,
        bytes[] calldata _signatures,
        uint256 _deadline
    ) public {
        require(_newMinDeposit > 0, "Minumum deposit must be positive");

        if (block.timestamp >= _deadline) {
            revert SignaturesExpired();
        }

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "setMinimumDeposit(uint256 newMinDeposit,uint256 nonce,uint256 deadline)"
                    ),
                    _newMinDeposit,
                    nonce++,
                    _deadline
                )
            )
        );

        uint256 votes = calculateVotes(_signatures, digest);

        if (votes < Quorum) {
            revert InsufficientVotes();
        }
        MinimumDeposit = _newMinDeposit;
        emit MinimumDepositUpdated(_newMinDeposit);
    }

    /** 
    @notice The person who wants to participate have
            to call this with ETH to be deposit
            The person requires Quorum approval first 
    @param _signatures  Signatures of members
    @param _deadline    Deadlne associated with signs
    @dev maybe include deposit in signed hash?
    */
    function Participate(bytes[] calldata _signatures, uint256 _deadline)
        public
        payable
    {
        uint256 toDeposit = msg.value;
        require(
            toDeposit >= MinimumDeposit,
            "Intitial Deposit amount must be greater or equal than the min deposit."
        );

        if (block.timestamp >= _deadline) {
            revert SignaturesExpired();
        }

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256("Participate(uint256 nonce,uint256 deadline)"),
                    nonce++,
                    _deadline
                )
            )
        );

        uint256 votes = calculateVotes(_signatures, digest);

        if (votes < Quorum) {
            revert InsufficientVotes();
        }
        initialDeposit(msg.sender, toDeposit);
        TotalMembers += 1;
        emit NewMember(msg.sender, toDeposit);
    }

    /**
        @notice Remove a member from the pool
        @dev Should this function exists?
            Have to consider Bad actions 
     */
    function RemoveMember(
        bytes[] calldata _signatures,
        address _member,
        uint256 _deadline
    ) public payable {
        if (BalanceOf(_member) == 0) {
            revert NotAMember();
        }
        require(TotalMembers > 1, "Last member cannot be removed");

        if (block.timestamp >= _deadline) {
            revert SignaturesExpired();
        }

        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "RemoveMember(address member,uint256 nonce,uint256 deadline)"
                    ),
                    _member,
                    nonce++,
                    _deadline
                )
            )
        );

        uint256 votes = calculateVotes(_signatures, digest);

        if (votes < Quorum) {
            revert InsufficientVotes();
        }

        // transfer the amount back

        withdrawTransfer(_member, _member, BalanceOf(_member));
        TotalMembers -= 1;
        emit MemberRemoved(_member, 1); // By signs
    }

    /**
        @dev Internal method to calculate the total valid votes from members
     */
    function calculateVotes(bytes[] memory _signatures, bytes32 digest)
        internal
        view
        returns (uint256)
    {
        address previous; // to avoid signature re-use (  like using same sign muliple times )

        uint256 votesCount = 0;
        for (uint256 i = 0; i < _signatures.length; i++) {
            address signer = ECDSA.recover(digest, _signatures[i]);
            uint256 tokens = BalanceOf(signer);

            if (tokens == 0 || signer == address(0) || previous >= signer) {
                
                revert InvalidSignatures();
                // continue;
            }
            votesCount += tokens;
            previous = signer;
        }
        return votesCount;
    }

    /**
        @notice Withdraw your shares to any wallet,
        @dev Royality/fee can be applied here
        @dev Withdrawing back to wallet can increase tokens worth
     */
    function Withdraw(address _to, uint256 _tokenAmount) public {
        withdrawTransfer(msg.sender, _to, _tokenAmount);
    }

    function withdrawTransfer(
        address _member,
        address _to,
        uint256 _tokensWithdrawAmount
    ) internal {
        require(BalanceOf(_member) > 0, "blnc must be positive");
        require(_tokensWithdrawAmount <= BalanceOf(_member));
        uint256 tokenValue = GetTokenValue();
        uint256 WEIs = tokenValue * _tokensWithdrawAmount;
        (bool success, ) = _to.call{value: WEIs}(""); // look out for gas
        if (success) {
            burnTokens(_member, _tokensWithdrawAmount);

            /// @dev burning tokens decreases total supply,
            // so remove those votes from qourum too? ,
            // may be there percentage?

            // Quorum -= _tokensWithdrawAmount;
            // if (Quorum <= 0) {Quorum = 1;}

            emit FundsWithdraw(_member, _to, _tokensWithdrawAmount);
        } else revert WithdrawFailed();
    }

    /**
        @dev check for decimals
     */
    function GetTokenValue() public view returns (uint256) {
        return address(this).balance / TotalSupply();
    }

    /// @notice Fallback function when ETH is recevied directly with no calldata
    receive() external payable {
        emit ValueReceived(msg.sender, msg.value);
    }
}
