// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistrationContract.sol";
import "./ProductRegistrationContract.sol";

contract SaleTransactionContract {
    struct Transaction {
        uint256 id;
        uint256 productId;
        address seller;
        address buyer;
        uint256 quantity;
        uint256 pricePerUnit;
        uint256 totalAmount;
        uint256 timestamp;
        string location;
        TransactionStatus status;
        string notes;
    }
    
    enum TransactionStatus {
        Pending,
        Confirmed,
        InTransit,
        Delivered,
        Cancelled
    }
    
    mapping(uint256 => Transaction) public transactions;
    mapping(address => uint256[]) public userTransactions;
    mapping(uint256 => uint256[]) public productTransactions;
    
    uint256 public nextTransactionId = 1;
    uint256[] public allTransactionIds;
    
    UserRegistrationContract public userContract;
    ProductRegistrationContract public productContract;
    
    event TransactionCreated(uint256 indexed transactionId, uint256 indexed productId, address indexed seller, address indexed buyer);
    event TransactionStatusUpdated(uint256 indexed transactionId, TransactionStatus status);
    event PaymentProcessed(uint256 indexed transactionId, uint256 amount);
    
    modifier onlyRegisteredUser() {
        require(userContract.isUserRegistered(msg.sender), "User not registered");
        _;
    }
    
    modifier onlyTransactionParty(uint256 _transactionId) {
        Transaction memory txn = transactions[_transactionId];
        require(msg.sender == txn.seller || msg.sender == txn.buyer, "Not authorized for this transaction");
        _;
    }
    
    modifier transactionExists(uint256 _transactionId) {
        require(transactions[_transactionId].id != 0, "Transaction does not exist");
        _;
    }
    
    constructor(address _userContractAddress, address _productContractAddress) {
        userContract = UserRegistrationContract(_userContractAddress);
        productContract = ProductRegistrationContract(_productContractAddress);
    }
    
    function createTransaction(
        uint256 _productId,
        address _buyer,
        uint256 _quantity,
        uint256 _pricePerUnit,
        string memory _location,
        string memory _notes
    ) public onlyRegisteredUser returns (uint256) {
        require(userContract.isUserRegistered(_buyer), "Buyer not registered");
        require(_buyer != msg.sender, "Cannot sell to yourself");
        require(_quantity > 0, "Quantity must be greater than 0");
        require(_pricePerUnit > 0, "Price must be greater than 0");
        
        // Verify product exists and seller owns it
        ProductRegistrationContract.Product memory product = productContract.getProduct(_productId);
        require(product.producer == msg.sender, "You don't own this product");
        require(product.isActive, "Product is not active");
        
        uint256 transactionId = nextTransactionId++;
        uint256 totalAmount = _quantity * _pricePerUnit;
        
        transactions[transactionId] = Transaction({
            id: transactionId,
            productId: _productId,
            seller: msg.sender,
            buyer: _buyer,
            quantity: _quantity,
            pricePerUnit: _pricePerUnit,
            totalAmount: totalAmount,
            timestamp: block.timestamp,
            location: _location,
            status: TransactionStatus.Pending,
            notes: _notes
        });
        
        userTransactions[msg.sender].push(transactionId);
        userTransactions[_buyer].push(transactionId);
        productTransactions[_productId].push(transactionId);
        allTransactionIds.push(transactionId);
        
        // Add to product history
        productContract.addProductHistory(
            _productId,
            "sale_created",
            _location,
            string(abi.encodePacked("Sale transaction created for quantity: ", uintToString(_quantity)))
        );
        
        emit TransactionCreated(transactionId, _productId, msg.sender, _buyer);
        
        return transactionId;
    }
    
    function confirmTransaction(uint256 _transactionId) public onlyRegisteredUser onlyTransactionParty(_transactionId) transactionExists(_transactionId) {
        Transaction storage txn = transactions[_transactionId];
        require(txn.status == TransactionStatus.Pending, "Transaction not in pending status");
        require(msg.sender == txn.buyer, "Only buyer can confirm transaction");
        
        txn.status = TransactionStatus.Confirmed;
        
        // Add to product history
        productContract.addProductHistory(
            txn.productId,
            "sale_confirmed",
            txn.location,
            "Sale transaction confirmed by buyer"
        );
        
        emit TransactionStatusUpdated(_transactionId, TransactionStatus.Confirmed);
    }
    
    function updateTransactionStatus(
        uint256 _transactionId,
        TransactionStatus _status,
        string memory _location,
        string memory _notes
    ) public onlyRegisteredUser onlyTransactionParty(_transactionId) transactionExists(_transactionId) {
        Transaction storage txn = transactions[_transactionId];
        require(txn.status != TransactionStatus.Cancelled, "Cannot update cancelled transaction");
        
        txn.status = _status;
        if (bytes(_location).length > 0) {
            txn.location = _location;
        }
        if (bytes(_notes).length > 0) {
            txn.notes = _notes;
        }
        
        string memory action;
        if (_status == TransactionStatus.InTransit) {
            action = "in_transit";
        } else if (_status == TransactionStatus.Delivered) {
            action = "delivered";
        } else if (_status == TransactionStatus.Cancelled) {
            action = "cancelled";
        } else {
            action = "status_updated";
        }
        
        // Add to product history
        productContract.addProductHistory(
            txn.productId,
            action,
            _location,
            _notes
        );
        
        emit TransactionStatusUpdated(_transactionId, _status);
    }
    
    function processPayment(uint256 _transactionId) public payable onlyRegisteredUser onlyTransactionParty(_transactionId) transactionExists(_transactionId) {
        Transaction storage txn = transactions[_transactionId];
        require(msg.sender == txn.buyer, "Only buyer can process payment");
        require(txn.status == TransactionStatus.Confirmed || txn.status == TransactionStatus.InTransit, "Invalid transaction status for payment");
        require(msg.value == txn.totalAmount, "Incorrect payment amount");
        
        // Transfer payment to seller
        payable(txn.seller).transfer(msg.value);
        
        // Add to product history
        productContract.addProductHistory(
            txn.productId,
            "payment_processed",
            txn.location,
            string(abi.encodePacked("Payment of ", uintToString(msg.value), " wei processed"))
        );
        
        emit PaymentProcessed(_transactionId, msg.value);
    }
    
    function getTransaction(uint256 _transactionId) public view transactionExists(_transactionId) returns (Transaction memory) {
        return transactions[_transactionId];
    }
    
    function getUserTransactions(address _user) public view returns (uint256[] memory) {
        return userTransactions[_user];
    }
    
    function getProductTransactions(uint256 _productId) public view returns (uint256[] memory) {
        return productTransactions[_productId];
    }
    
    function getAllTransactions() public view returns (Transaction[] memory) {
        Transaction[] memory allTransactions = new Transaction[](allTransactionIds.length);
        
        for (uint256 i = 0; i < allTransactionIds.length; i++) {
            allTransactions[i] = transactions[allTransactionIds[i]];
        }
        
        return allTransactions;
    }
    
    function getTransactionCount() public view returns (uint256) {
        return allTransactionIds.length;
    }
    
    function getTransactionsByStatus(TransactionStatus _status) public view returns (Transaction[] memory) {
        uint256 count = 0;
        
        // First pass: count transactions with the specified status
        for (uint256 i = 0; i < allTransactionIds.length; i++) {
            if (transactions[allTransactionIds[i]].status == _status) {
                count++;
            }
        }
        
        // Second pass: populate the result array
        Transaction[] memory result = new Transaction[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allTransactionIds.length; i++) {
            if (transactions[allTransactionIds[i]].status == _status) {
                result[index] = transactions[allTransactionIds[i]];
                index++;
            }
        }
        
        return result;
    }
    
    // Helper function to convert uint to string
    function uintToString(uint256 _value) internal pure returns (string memory) {
        if (_value == 0) {
            return "0";
        }
        
        uint256 temp = _value;
        uint256 digits;
        
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        
        while (_value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(_value % 10)));
            _value /= 10;
        }
        
        return string(buffer);
    }
}
