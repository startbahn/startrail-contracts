// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.13;

/**
 * @dev Functions for minting SRR tokens on collections.
 */
interface ISRRFeature {
    error OnlyIssuerOrArtistOrAdministrator();
    error ZeroAddress();

    struct SRR {
        bool isPrimaryIssuer;
        address artistAddress;
        address issuer;
    }

    event CreateSRR(
        uint256 indexed tokenId,
        SRR registryRecord,
        string metadataCID,
        bool lockExternalTransfer
    );

    event UpdateSRR(
        uint256 indexed tokenId,
        bool isPrimaryIssuer,
        address artistAddress,
        address sender
    );

    /**
     * @dev Creates an SRR for an artwork
     * @param isPrimaryIssuer true if issued by primary issuer
     * @param artistAddress artist contract
     * @param metadataCID metadata IPFS cid
     * @param lockExternalTransfer transfer lock flag (see LockExternalTransferFeatuer.sol)
     * @param to the address this token will be transferred to after the creation
     * @param royaltyReceiver royalty receiver
     * @param royaltyBasisPoints royalty basis points
     */
    function createSRR(
        bool isPrimaryIssuer,
        address artistAddress,
        string memory metadataCID,
        bool lockExternalTransfer,
        address to,
        address royaltyReceiver,
        uint16 royaltyBasisPoints
    ) external;

    /**
     * @dev Gets core SRR details
     * @param tokenId SRR id
     * @return isPrimaryIssuer
     * @return artist
     * @return issuer
     */
    function getSRR(uint256 tokenId)
        external
        view
        returns (
            bool isPrimaryIssuer,
            address artist,
            address issuer
        );

    /**
     * @dev Update SRR details
     * @param tokenId SRR id
     * @param isPrimaryIssuer true if issued by primary issuer
     * @param artistAddress artist contract
     */
    function updateSRR(
        uint256 tokenId,
        bool isPrimaryIssuer,
        address artistAddress
    ) external;
}
