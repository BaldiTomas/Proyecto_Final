// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./UserRegistrationContract.sol";
import "./ProductRegistrationContract.sol";

contract SalesContract {
    UserRegistrationContract public userContract;
    ProductRegistrationContract public productContract;

    struct Sale {
        uint256 productId;
        uint256 fromCustody;
        uint256 toCustody;
        uint256 quantity;
        uint256 price;
        uint256 timestamp;
    }

    mapping(uint256 => Sale[]) public salesHistory;

    event ProductSold(
        uint256 indexed productId,
        uint256 indexed fromCustody,
        uint256 indexed toCustody,
        uint256 quantity,
        uint256 price,
        uint256 timestamp
    );

    constructor(address _userContract, address _productContract) {
        userContract = UserRegistrationContract(_userContract);
        productContract = ProductRegistrationContract(_productContract);
    }

    function sellProduct(
        uint256 productId,
        uint256 newCustodyId,
        uint256 quantity,
        uint256 price
    ) external {
        (, , , , uint256 currentCustody) = productContract.getProduct(productId);

        productContract.transferCustody(productId, newCustodyId);

        Sale memory s = Sale({
            productId:     productId,
            fromCustody:   currentCustody,
            toCustody:     newCustodyId,
            quantity:      quantity,
            price:         price,
            timestamp:     block.timestamp
        });
        salesHistory[productId].push(s);

        emit ProductSold(
            productId,
            currentCustody,
            newCustodyId,
            quantity,
            price,
            block.timestamp
        );
    }

    function getSalesCount(uint256 productId) external view returns (uint256) {
        return salesHistory[productId].length;
    }

    function getSale(uint256 productId, uint256 index)
        external
        view
        returns (Sale memory)
    {
        return salesHistory[productId][index];
    }

    function getUserId(address who) public view returns (uint256) {
        return userContract.getUserId(who);
    }
}
