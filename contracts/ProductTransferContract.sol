// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ProductTransferContract {
    struct Transfer {
        uint256 id;
        uint256 productId;
        address from;
        address to;
        uint256 quantity;
        uint256 timestamp;
        TransferStatus status;
        string notes;
    }

    enum TransferStatus {
        Pending,
        Completed,
        Rejected
    }

    mapping(uint256 => Transfer) public transfers;
    mapping(address => uint256[]) public userTransfers;
    mapping(uint256 => uint256[]) public productTransfers;
    mapping(uint256 => address) public productCustody; // Quien tiene custodia del producto
    
    uint256 public nextTransferId = 1;
    
    event TransferInitiated(
        uint256 indexed transferId,
        uint256 indexed productId,
        address indexed from,
        address to,
        uint256 quantity
    );
    
    event TransferCompleted(
        uint256 indexed transferId,
        uint256 indexed productId
    );
    
    event CustodyChanged(
        uint256 indexed productId,
        address indexed from,
        address indexed to
    );

    modifier onlyAuthorized() {
        // En un entorno real, aquí verificaríamos los roles autorizados
        _;
    }

    function initiateTransfer(
        uint256 _productId,
        address _to,
        uint256 _quantity,
        string memory _notes
    ) external onlyAuthorized returns (uint256) {
        require(_productId > 0, "ID de producto invalido");
        require(_to != address(0), "Direccion de destino invalida");
        require(_to != msg.sender, "No puedes transferir a ti mismo");
        require(_quantity > 0, "Cantidad debe ser mayor a 0");

        // Verificar que el remitente tiene custodia del producto
        require(
            productCustody[_productId] == msg.sender || productCustody[_productId] == address(0),
            "No tienes custodia de este producto"
        );

        uint256 transferId = nextTransferId++;
        
        transfers[transferId] = Transfer({
            id: transferId,
            productId: _productId,
            from: msg.sender,
            to: _to,
            quantity: _quantity,
            timestamp: block.timestamp,
            status: TransferStatus.Pending,
            notes: _notes
        });

        userTransfers[msg.sender].push(transferId);
        userTransfers[_to].push(transferId);
        productTransfers[_productId].push(transferId);

        emit TransferInitiated(
            transferId,
            _productId,
            msg.sender,
            _to,
            _quantity
        );

        return transferId;
    }

    function completeTransfer(uint256 _transferId) external {
        require(_transferId > 0 && _transferId < nextTransferId, "Transferencia no existe");
        
        Transfer storage transfer = transfers[_transferId];
        require(transfer.status == TransferStatus.Pending, "Transferencia ya procesada");
        require(
            transfer.from == msg.sender || transfer.to == msg.sender,
            "No autorizado para completar esta transferencia"
        );

        transfer.status = TransferStatus.Completed;
        
        // Cambiar custodia del producto
        address previousCustody = productCustody[transfer.productId];
        productCustody[transfer.productId] = transfer.to;

        emit TransferCompleted(_transferId, transfer.productId);
        emit CustodyChanged(transfer.productId, previousCustody, transfer.to);
    }

    function rejectTransfer(uint256 _transferId) external {
        require(_transferId > 0 && _transferId < nextTransferId, "Transferencia no existe");
        
        Transfer storage transfer = transfers[_transferId];
        require(transfer.status == TransferStatus.Pending, "Transferencia ya procesada");
        require(transfer.to == msg.sender, "Solo el receptor puede rechazar");

        transfer.status = TransferStatus.Rejected;
    }

    function getTransfer(uint256 _transferId) external view returns (Transfer memory) {
        require(_transferId > 0 && _transferId < nextTransferId, "Transferencia no existe");
        return transfers[_transferId];
    }

    function getUserTransfers(address _user) external view returns (uint256[] memory) {
        return userTransfers[_user];
    }

    function getProductTransfers(uint256 _productId) external view returns (uint256[] memory) {
        return productTransfers[_productId];
    }

    function getProductCustody(uint256 _productId) external view returns (address) {
        return productCustody[_productId];
    }
}
