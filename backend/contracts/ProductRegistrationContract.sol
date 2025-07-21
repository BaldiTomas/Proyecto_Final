// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistrationContract.sol";

contract ProductRegistrationContract {
    struct Product {
        string name;
        string metadataHash;
        address producer;
        bool isActive;
        uint256 custodyId;
    }

    mapping(uint256 => Product) public products;
    uint256 public nextProductId = 1;
    UserRegistrationContract public userContract;

    event ProductRegistered(
        uint256 indexed productId,
        uint256 indexed custodyId,
        string name,
        string metadataHash
    );
    event ProductUpdated(
        uint256 indexed productId,
        string name,
        string metadataHash
    );
    event ProductStatusChanged(
        uint256 indexed productId,
        bool isActive
    );
    event CustodyChanged(
        uint256 indexed productId,
        uint256 indexed oldCustodyId,
        uint256 indexed newCustodyId
    );

    constructor(address _userContract) {
        userContract = UserRegistrationContract(_userContract);
    }

    function registerProduct(
        string calldata name,
        string calldata metadataHash,
        uint256 initialCustodyId
    ) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        require(bytes(metadataHash).length > 0, "Metadata hash required");

        uint256 id = nextProductId++;
        products[id] = Product({
            name: name,
            metadataHash: metadataHash,
            producer: msg.sender,
            isActive: true,
            custodyId: initialCustodyId
        });

        emit ProductRegistered(id, initialCustodyId, name, metadataHash);
        return id;
    }

    function updateProduct(
        uint256 id,
        string calldata name,
        string calldata metadataHash
    ) external {
        require(bytes(name).length > 0, "Name required");
        require(bytes(metadataHash).length > 0, "Metadata hash required");
        Product storage p = products[id];
        p.name = name;
        p.metadataHash = metadataHash;
        emit ProductUpdated(id, name, metadataHash);
    }

    function setProductActive(uint256 id, bool active) external {
        products[id].isActive = active;
        emit ProductStatusChanged(id, active);
    }

    function transferCustody(uint256 id, uint256 newCustodyId) external {
        Product storage p = products[id];
        uint256 old = p.custodyId;
        p.custodyId = newCustodyId;
        emit CustodyChanged(id, old, newCustodyId);
    }

    function getProduct(uint256 id)
        external
        view
        returns (
            string memory name,
            string memory metadataHash,
            address producer,
            bool isActive,
            uint256 custodyId
        )
    {
        Product storage p = products[id];
        return (p.name, p.metadataHash, p.producer, p.isActive, p.custodyId);
    }

    function getUserId(address who) public view returns (uint256) {
        return userContract.getUserId(who);
    }
}
