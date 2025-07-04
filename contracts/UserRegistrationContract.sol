// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract UserRegistrationContract {
    struct User {
        address walletAddress;
        string name;
        string email;
        string role; // admin, producer, seller, distributor, user
        bool isActive;
        uint256 registrationDate;
    }
    
    mapping(address => User) public users;
    mapping(string => address) public emailToAddress;
    address[] public userAddresses;
    
    address public owner;
    
    event UserRegistered(address indexed userAddress, string name, string email, string role);
    event UserUpdated(address indexed userAddress, string name, string email);
    event UserDeactivated(address indexed userAddress);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    modifier onlyActiveUser() {
        require(users[msg.sender].isActive, "User is not active");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerUser(
        address _userAddress,
        string memory _name,
        string memory _email,
        string memory _role
    ) public onlyOwner {
        require(_userAddress != address(0), "Invalid address");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        require(!users[_userAddress].isActive, "User already registered");
        require(emailToAddress[_email] == address(0), "Email already registered");
        
        users[_userAddress] = User({
            walletAddress: _userAddress,
            name: _name,
            email: _email,
            role: _role,
            isActive: true,
            registrationDate: block.timestamp
        });
        
        emailToAddress[_email] = _userAddress;
        userAddresses.push(_userAddress);
        
        emit UserRegistered(_userAddress, _name, _email, _role);
    }
    
    function updateUser(
        string memory _name,
        string memory _email
    ) public onlyActiveUser {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        User storage user = users[msg.sender];
        
        // Update email mapping if email changed
        if (keccak256(bytes(user.email)) != keccak256(bytes(_email))) {
            require(emailToAddress[_email] == address(0), "Email already registered");
            delete emailToAddress[user.email];
            emailToAddress[_email] = msg.sender;
        }
        
        user.name = _name;
        user.email = _email;
        
        emit UserUpdated(msg.sender, _name, _email);
    }
    
    function deactivateUser(address _userAddress) public onlyOwner {
        require(users[_userAddress].isActive, "User is not active");
        
        users[_userAddress].isActive = false;
        
        emit UserDeactivated(_userAddress);
    }
    
    function getUser(address _userAddress) public view returns (User memory) {
        return users[_userAddress];
    }
    
    function getUserByEmail(string memory _email) public view returns (User memory) {
        address userAddress = emailToAddress[_email];
        return users[userAddress];
    }
    
    function getAllUsers() public view returns (User[] memory) {
        User[] memory allUsers = new User[](userAddresses.length);
        
        for (uint256 i = 0; i < userAddresses.length; i++) {
            allUsers[i] = users[userAddresses[i]];
        }
        
        return allUsers;
    }
    
    function getUserCount() public view returns (uint256) {
        return userAddresses.length;
    }
    
    function isUserRegistered(address _userAddress) public view returns (bool) {
        return users[_userAddress].isActive;
    }
}
