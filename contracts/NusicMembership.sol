// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "operator-filter-registry/src/DefaultOperatorFilterer.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {MerkleProof} from '@openzeppelin/contracts/utils/cryptography/MerkleProof.sol';
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

error CallerIsAContract();

contract NusicMembership is ERC721A, Pausable, Ownable, DefaultOperatorFilterer, ERC2981, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant MINT_PER_ADDR = 10; // Mint per Address

    string public defaultURI = "ipfs://QmXsMLpKjznF3z1KsVm5tNs3E94vj4BFAyAHvD5RTWgQ1J";
    string private baseURI;

    bool public saleLive = true;

    uint256 public price = 0.0008 ether;
    address manager;

    event Minted(address indexed to, uint256 tokenQuantity, uint256 amount);
    
    modifier onlyOwnerOrManager() {
        require((owner() == msg.sender) || (manager == msg.sender), "Caller needs to Owner or Manager");
        _;
    }

    modifier mintPerAddressNotExceed(uint256 tokenQuantity) {
		require(balanceOf(msg.sender) + tokenQuantity <= MINT_PER_ADDR, 'Exceed Per Address limit');
		_;
	}

    constructor(string memory _name, string memory _symbol) ERC721A(_name, _symbol) {
        manager = msg.sender;
        _setDefaultRoyalty(owner(), 500);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string calldata _baseuri) public onlyOwnerOrManager {
		baseURI = _baseuri;
	}

    function setDefaultRI(string calldata _defaultURI) public onlyOwnerOrManager {
		defaultURI = _defaultURI;
	}

    function toggleSaleLive() public onlyOwnerOrManager {
        saleLive = !saleLive;
    }

    function setPrice(uint256 newPrice) public onlyOwnerOrManager {
        require(newPrice > 0, "Price can not be zero");
        price = newPrice;
    }

    function setManager(address _manager) public onlyOwner {
        manager = _manager;
    }

    function _startTokenId() internal view virtual override returns (uint256) {
        return 1;
    }

    modifier callerIsUser() {
        if (tx.origin != msg.sender) revert CallerIsAContract();
        _;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "Token does not exists");
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString(),".json")) : defaultURI;
    }

    function mint(uint256 tokenQuantity) public payable mintPerAddressNotExceed(tokenQuantity) callerIsUser whenNotPaused nonReentrant{
        require(saleLive, "Sale Not Active"); // Sale should be active
        require(totalSupply() + tokenQuantity <= MAX_SUPPLY, "Minting would exceed max supply"); // Total Minted should not exceed Max Supply
        require((price * tokenQuantity) == msg.value, "Incorrect Funds Sent" ); // Amount sent should be equal to price to quantity being minted
        
        _safeMint(msg.sender, tokenQuantity);
        emit Minted(msg.sender, tokenQuantity, msg.value);
    }

    function withdraw() public onlyOwner nonReentrant{
        require(owner() != address(0),"Fund Owner is NULL");
        (bool sent1, ) = owner().call{value: address(this).balance}("");
        require(sent1, "Failed to withdraw");
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721A, ERC2981)
        returns (bool)
    {
        // Supports the following `interfaceId`s:
        // - IERC165: 0x01ffc9a7
        // - IERC721: 0x80ac58cd
        // - IERC721Metadata: 0x5b5e139f
        // - IERC2981: 0x2a55205a
        return
            ERC721A.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) public onlyOwner nonReentrant{
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function pause() public onlyOwner nonReentrant {
        _pause();
    }

    function unpause() public onlyOwner nonReentrant {
        _unpause();
    }

    // Operator Filtering
    function setApprovalForAll(address operator, bool approved) 
        public override onlyAllowedOperatorApproval(operator) {
        super.setApprovalForAll(operator, approved);
    }

    function approve(address operator, uint256 tokenId) 
        public payable override onlyAllowedOperatorApproval(operator) {
        super.approve(operator, tokenId);
    }

    function transferFrom(address from, address to,uint256 tokenId) 
        public payable override onlyAllowedOperator(from) {
        super.transferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) 
        public payable override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) 
        public payable override onlyAllowedOperator(from) {
        super.safeTransferFrom(from, to, tokenId, data);
    }
}