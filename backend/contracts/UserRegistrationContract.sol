// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistrationContract {
    struct User {
        string  name;
        string  email;
        bool    isActive;
        uint256 userId;
    }

    mapping(address => User) public users;
    address public owner;
    uint256 public nextUserId = 1;

    event UserRegistered(address indexed userAddress, string name, string email, uint256 userId);
    event UserUpdated(address indexed userAddress, string name, string email);
    event UserDeactivated(address indexed userAddress);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerUser(address _userAddress, string memory _name, string memory _email)
        public onlyOwner
    {
        require(!users[_userAddress].isActive, "User already registered");
        uint256 uid = nextUserId++;
        users[_userAddress] = User({
            name:     _name,
            email:    _email,
            isActive: true,
            userId:   uid
        });
        emit UserRegistered(_userAddress, _name, _email, uid);
    }

    function updateUser(string memory _name, string memory _email) public {
        require(users[msg.sender].isActive, "User is not active");
        users[msg.sender].name  = _name;
        users[msg.sender].email = _email;
        emit UserUpdated(msg.sender, _name, _email);
    }

    function deactivateUser(address _userAddress) public onlyOwner {
        require(users[_userAddress].isActive, "User is not active");
        users[_userAddress].isActive = false;
        emit UserDeactivated(_userAddress);
    }

    function isUserRegistered(address _userAddress) public view returns (bool) {
        return users[_userAddress].isActive;
    }

    function getUserId(address who) public view returns (uint256) {
        require(users[who].isActive, "User not registered");
        return users[who].userId;
    }
}
