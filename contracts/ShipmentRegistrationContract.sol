// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ShipmentRegistrationContract {
    struct Shipment {
        uint256 id;
        uint256 productId;
        address distributor;
        string origin;
        string destination;
        string transportCompany;
        uint256 quantity;
        uint256 timestamp;
        ShipmentStatus status;
        string notes;
    }

    enum ShipmentStatus {
        InTransit,
        Delivered,
        Cancelled
    }

    mapping(uint256 => Shipment) public shipments;
    mapping(address => uint256[]) public distributorShipments;
    mapping(uint256 => uint256[]) public productShipments;
    
    uint256 public nextShipmentId = 1;
    
    event ShipmentRegistered(
        uint256 indexed shipmentId,
        uint256 indexed productId,
        address indexed distributor,
        string origin,
        string destination
    );
    
    event ShipmentStatusUpdated(
        uint256 indexed shipmentId,
        ShipmentStatus status
    );

    modifier onlyDistributor() {
        // En un entorno real, aquí verificaríamos el rol del distribuidor
        _;
    }

    function registerShipment(
        uint256 _productId,
        string memory _origin,
        string memory _destination,
        string memory _transportCompany,
        uint256 _quantity,
        string memory _notes
    ) external onlyDistributor returns (uint256) {
        require(_productId > 0, "ID de producto invalido");
        require(bytes(_origin).length > 0, "Origen requerido");
        require(bytes(_destination).length > 0, "Destino requerido");
        require(_quantity > 0, "Cantidad debe ser mayor a 0");

        uint256 shipmentId = nextShipmentId++;
        
        shipments[shipmentId] = Shipment({
            id: shipmentId,
            productId: _productId,
            distributor: msg.sender,
            origin: _origin,
            destination: _destination,
            transportCompany: _transportCompany,
            quantity: _quantity,
            timestamp: block.timestamp,
            status: ShipmentStatus.InTransit,
            notes: _notes
        });

        distributorShipments[msg.sender].push(shipmentId);
        productShipments[_productId].push(shipmentId);

        emit ShipmentRegistered(
            shipmentId,
            _productId,
            msg.sender,
            _origin,
            _destination
        );

        return shipmentId;
    }

    function updateShipmentStatus(
        uint256 _shipmentId,
        ShipmentStatus _status
    ) external {
        require(_shipmentId > 0 && _shipmentId < nextShipmentId, "Envio no existe");
        require(
            shipments[_shipmentId].distributor == msg.sender,
            "Solo el distribuidor puede actualizar el estado"
        );

        shipments[_shipmentId].status = _status;
        
        emit ShipmentStatusUpdated(_shipmentId, _status);
    }

    function getShipment(uint256 _shipmentId) external view returns (Shipment memory) {
        require(_shipmentId > 0 && _shipmentId < nextShipmentId, "Envio no existe");
        return shipments[_shipmentId];
    }

    function getDistributorShipments(address _distributor) external view returns (uint256[] memory) {
        return distributorShipments[_distributor];
    }

    function getProductShipments(uint256 _productId) external view returns (uint256[] memory) {
        return productShipments[_productId];
    }
}
