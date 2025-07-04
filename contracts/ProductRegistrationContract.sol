// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistrationContract.sol";

contract ProductRegistrationContract {
    struct Product {
        uint256 id;
        string name;
        string description;
        string category;
        address producer;
        string origin;
        uint256 productionDate;
        uint256 registrationDate;
        bool isActive;
        string[] certifications;
        string metadataHash; // IPFS hash for additional data
    }
    
    struct ProductHistory {
        uint256 productId;
        address actor;
        string action; // created, transferred, verified, etc.
        string location;
        uint256 timestamp;
        string notes;
    }
    
    mapping(uint256 => Product) public products;
    mapping(uint256 => ProductHistory[]) public productHistories;
    mapping(address => uint256[]) public producerProducts;
    
    uint256 public nextProductId = 1;
    uint256[] public allProductIds;
    
    UserRegistrationContract public userContract;
    
    event ProductRegistered(uint256 indexed productId, string name, address indexed producer);
    event ProductUpdated(uint256 indexed productId, string name, string description);
    event ProductTransferred(uint256 indexed productId, address indexed from, address indexed to);
    event ProductHistoryAdded(uint256 indexed productId, address indexed actor, string action);
    
    modifier onlyRegisteredUser() {
        require(userContract.isUserRegistered(msg.sender), "User not registered");
        _;
    }
    
    modifier onlyProductOwner(uint256 _productId) {
        require(products[_productId].producer == msg.sender, "Not product owner");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(products[_productId].id != 0, "Product does not exist");
        _;
    }
    
    constructor(address _userContractAddress) {
        userContract = UserRegistrationContract(_userContractAddress);
    }
    
    function registerProduct(
        string memory _name,
        string memory _description,
        string memory _category,
        string memory _origin,
        uint256 _productionDate,
        string[] memory _certifications,
        string memory _metadataHash
    ) public onlyRegisteredUser returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_productionDate <= block.timestamp, "Production date cannot be in the future");
        
        uint256 productId = nextProductId++;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            description: _description,
            category: _category,
            producer: msg.sender,
            origin: _origin,
            productionDate: _productionDate,
            registrationDate: block.timestamp,
            isActive: true,
            certifications: _certifications,
            metadataHash: _metadataHash
        });
        
        producerProducts[msg.sender].push(productId);
        allProductIds.push(productId);
        
        // Add initial history entry
        productHistories[productId].push(ProductHistory({
            productId: productId,
            actor: msg.sender,
            action: "created",
            location: _origin,
            timestamp: block.timestamp,
            notes: "Product registered on blockchain"
        }));
        
        emit ProductRegistered(productId, _name, msg.sender);
        emit ProductHistoryAdded(productId, msg.sender, "created");
        
        return productId;
    }
    
    function updateProduct(
        uint256 _productId,
        string memory _name,
        string memory _description,
        string memory _category
    ) public onlyRegisteredUser onlyProductOwner(_productId) productExists(_productId) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        Product storage product = products[_productId];
        product.name = _name;
        product.description = _description;
        product.category = _category;
        
        // Add history entry
        productHistories[_productId].push(ProductHistory({
            productId: _productId,
            actor: msg.sender,
            action: "updated",
            location: "",
            timestamp: block.timestamp,
            notes: "Product information updated"
        }));
        
        emit ProductUpdated(_productId, _name, _description);
        emit ProductHistoryAdded(_productId, msg.sender, "updated");
    }
    
    function addProductHistory(
        uint256 _productId,
        string memory _action,
        string memory _location,
        string memory _notes
    ) public onlyRegisteredUser productExists(_productId) {
        productHistories[_productId].push(ProductHistory({
            productId: _productId,
            actor: msg.sender,
            action: _action,
            location: _location,
            timestamp: block.timestamp,
            notes: _notes
        }));
        
        emit ProductHistoryAdded(_productId, msg.sender, _action);
    }
    
    function transferProduct(
        uint256 _productId,
        address _newOwner,
        string memory _location,
        string memory _notes
    ) public onlyRegisteredUser onlyProductOwner(_productId) productExists(_productId) {
        require(userContract.isUserRegistered(_newOwner), "New owner not registered");
        require(_newOwner != msg.sender, "Cannot transfer to yourself");
        
        address previousOwner = products[_productId].producer;
        products[_productId].producer = _newOwner;
        
        // Remove from previous owner's products
        uint256[] storage prevOwnerProducts = producerProducts[previousOwner];
        for (uint256 i = 0; i < prevOwnerProducts.length; i++) {
            if (prevOwnerProducts[i] == _productId) {
                prevOwnerProducts[i] = prevOwnerProducts[prevOwnerProducts.length - 1];
                prevOwnerProducts.pop();
                break;
            }
        }
        
        // Add to new owner's products
        producerProducts[_newOwner].push(_productId);
        
        // Add history entry
        productHistories[_productId].push(ProductHistory({
            productId: _productId,
            actor: msg.sender,
            action: "transferred",
            location: _location,
            timestamp: block.timestamp,
            notes: _notes
        }));
        
        emit ProductTransferred(_productId, previousOwner, _newOwner);
        emit ProductHistoryAdded(_productId, msg.sender, "transferred");
    }
    
    function getProduct(uint256 _productId) public view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }
    
    function getProductHistory(uint256 _productId) public view productExists(_productId) returns (ProductHistory[] memory) {
        return productHistories[_productId];
    }
    
    function getProducerProducts(address _producer) public view returns (uint256[] memory) {
        return producerProducts[_producer];
    }
    
    function getAllProducts() public view returns (Product[] memory) {
        Product[] memory allProducts = new Product[](allProductIds.length);
        
        for (uint256 i = 0; i < allProductIds.length; i++) {
            allProducts[i] = products[allProductIds[i]];
        }
        
        return allProducts;
    }
    
    function getProductCount() public view returns (uint256) {
        return allProductIds.length;
    }
    
    function deactivateProduct(uint256 _productId) public onlyRegisteredUser onlyProductOwner(_productId) productExists(_productId) {
        products[_productId].isActive = false;
        
        // Add history entry
        productHistories[_productId].push(ProductHistory({
            productId: _productId,
            actor: msg.sender,
            action: "deactivated",
            location: "",
            timestamp: block.timestamp,
            notes: "Product deactivated"
        }));
        
        emit ProductHistoryAdded(_productId, msg.sender, "deactivated");
    }
}
