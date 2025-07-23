// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract ShipmentRegistrationContract is AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    enum Status {
        Pending,
        InTransit,
        Confirmed,
        Cancelled
    }

    struct Shipment {
        uint256 productId;
        address distributor;
        string origin;
        string destination;
        string transportCompany;
        uint256 quantity;
        string notes;
        Status status;
        uint256 createdAt;
    }

    mapping(uint256 => Shipment) public shipments;
    uint256 public nextShipmentId;

    event ShipmentCreated(
        uint256 indexed shipmentId,
        uint256 productId,
        address indexed distributor,
        string origin,
        string destination,
        string transportCompany,
        uint256 quantity,
        string notes
    );

    event ShipmentStatusUpdated(uint256 indexed shipmentId, Status newStatus);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    function transferAdmin(
        address newAdmin
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newAdmin != address(0), "Admin invalido");
        _grantRole(DEFAULT_ADMIN_ROLE, newAdmin);
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function grantDistributor(
        address who
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(who != address(0), "No puede ser 0x0");
        _grantRole(DISTRIBUTOR_ROLE, who);
    }
    function revokeDistributor(
        address who
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(DISTRIBUTOR_ROLE, who);
    }

    function createShipment(
        uint256 productId,
        string calldata origin,
        string calldata destination,
        string calldata transportCompany,
        uint256 quantity,
        string calldata notes
    ) external onlyRole(DISTRIBUTOR_ROLE) returns (uint256) {
        require(quantity > 0, "Quantity>0");
        uint256 id = nextShipmentId++;
        shipments[id] = Shipment({
            productId: productId,
            distributor: msg.sender,
            origin: origin,
            destination: destination,
            transportCompany: transportCompany,
            quantity: quantity,
            notes: notes,
            status: Status.InTransit,
            createdAt: block.timestamp
        });
        emit ShipmentCreated(
            id,
            productId,
            msg.sender,
            origin,
            destination,
            transportCompany,
            quantity,
            notes
        );
        return id;
    }

    function updateStatus(
        uint256 shipmentId,
        Status newStatus
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        Shipment storage s = shipments[shipmentId];
        s.status = newStatus;
        emit ShipmentStatusUpdated(shipmentId, newStatus);
    }

    function getShipment(
        uint256 shipmentId
    ) external view returns (Shipment memory) {
        return shipments[shipmentId];
    }
}
