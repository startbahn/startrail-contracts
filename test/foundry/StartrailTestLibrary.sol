// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "hardhat/console.sol";
import "forge-std/Vm.sol";
import {Test} from "forge-std/Test.sol";

import "../../contracts/collection/registry/StartrailCollectionFeatureRegistry.sol";
import "../../contracts/collection/features/SRRFeature.sol";
import "../../contracts/collection/features/ERC721Feature.sol";

contract StartrailTestLibrary is Test {
    // Shared test data
    string internal constant A_CID =
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
    uint256 internal constant CUSTOM_HISTORY_ID_EXHIBITION = 1;

    function createFeatureRegistry(
        address registryOwner,
        address eip2771TrustedForwarder,
        address nameRegistry
    )
        internal
        returns (address featureRegistryAddress, address ownableFeatureAddress_)
    {
        vm.recordLogs();
        vm.prank(registryOwner);
        featureRegistryAddress = address(
            new StartrailCollectionFeatureRegistry(
                eip2771TrustedForwarder,
                nameRegistry
            )
        );
        Vm.Log[] memory entries = vm.getRecordedLogs();

        assertEq(
            entries[0].topics[0],
            keccak256("FeatureContractCreated(address,string)")
        );
        ownableFeatureAddress_ = address(bytes20(entries[0].topics[1] << 96));
    }

    function deployFeature(
        address featureRegistryOwner,
        StartrailCollectionFeatureRegistry featureRegistry_,
        address featureAddress,
        bytes4[] memory selectors
    ) internal {
        IDiamondWritable.FacetCut[]
            memory cuts = new IDiamondWritable.FacetCut[](1);
        cuts[0] = IDiamondWritable.FacetCut({
            target: featureAddress,
            action: IDiamondWritable.FacetCutAction.ADD,
            selectors: selectors
        });
        vm.prank(featureRegistryOwner);
        featureRegistry_.diamondCut(cuts, address(0x0), "");
    }

    function eip2771AppendSender(
        bytes memory callData,
        address sender
    ) internal pure returns (bytes memory) {
        return abi.encodePacked(callData, sender);
    }

    function pseudorandomUint256() internal returns (uint256) {
        // skip - moves block.timestamp forward 1 to ensure each call to here
        // returns a new number
        skip(1);
        return uint256(keccak256(abi.encode(block.timestamp)));
    }

    function createSRRWithDefaults(
        address collectionAddress,
        address eip2771TrustedForwarder,
        address minter
    ) internal returns (uint256 tokenId) {
        bool isPrimaryIssuer = true;
        address artist = vm.addr(pseudorandomUint256());
        string memory metadataCID = A_CID;
        bool lockExternalTransfer = true;
        address to = address(0);
        address royaltyReceiver = address(0);
        uint16 royaltyPercentage = 100;

        return
            createSRR(
                collectionAddress,
                eip2771TrustedForwarder,
                minter,
                isPrimaryIssuer,
                artist,
                metadataCID,
                lockExternalTransfer,
                to,
                royaltyReceiver,
                royaltyPercentage,
                bytes4(0)
            );
    }

    function createSRR(
        address collectionAddress,
        address eip2771TrustedForwarder,
        address minter,
        bool isPrimaryIssuer,
        address artist,
        string memory metadataCID,
        bool lockExternalTransfer,
        address to,
        address royaltyReceiver,
        uint16 royaltyPercentage,
        bytes4 expectRevertError
    ) internal returns (uint256 tokenId) {
        vm.prank(eip2771TrustedForwarder);

        if (expectRevertError != bytes4(0)) {
            vm.expectRevert(expectRevertError);
        }

        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    SRRFeature.createSRR.selector,
                    isPrimaryIssuer,
                    artist,
                    metadataCID,
                    lockExternalTransfer,
                    to,
                    royaltyReceiver,
                    royaltyPercentage
                ),
                minter
            )
        );
        require(success);

        return IDGeneratorV3.generate(metadataCID, artist);
    }

    function approveSRRByCommitment(
        address collectionAddress,
        address eip2771TrustedForwarder,
        address srrOwner,
        uint256 tokenId,
        bytes32 commitment,
        string memory historyMetadataHash,
        uint256 customHistoryId,
        bytes4 expectRevertError
    ) internal {
        vm.prank(eip2771TrustedForwarder);

        if (expectRevertError != bytes4(0)) {
            vm.expectRevert(expectRevertError);
        }

        bytes4 fnSelector = bytes4(
            customHistoryId != 0
                ? keccak256(
                    "approveSRRByCommitment(uint256,bytes32,string,uint256)"
                )
                : keccak256("approveSRRByCommitment(uint256,bytes32,string)")
        );

        bytes memory callBytes = abi.encodeWithSelector(
            fnSelector,
            tokenId,
            commitment,
            historyMetadataHash,
            customHistoryId
        );

        (bool success, ) = collectionAddress.call(
            eip2771AppendSender(callBytes, srrOwner)
        );

        require(success);
    }
}
