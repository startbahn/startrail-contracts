// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.13;

import "forge-std/Vm.sol";
import {Test} from "forge-std/Test.sol";

import {IDiamondWritable} from "@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol";
import {IERC721} from "@solidstate/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@solidstate/contracts/token/ERC721/metadata/IERC721Metadata.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "../../contracts/collection/CollectionFactory.sol";
import "../../contracts/collection/CollectionProxy.sol";
import "../../contracts/collection/features/ERC721Feature.sol";
import "../../contracts/collection/features/LockExternalTransferFeature.sol";
import "../../contracts/collection/features/SRRApproveTransferFeature.sol";
import "../../contracts/collection/features/SRRFeature.sol";
import "../../contracts/collection/features/ERC2981RoyaltyFeature.sol";
import "../../contracts/collection/registry/StartrailCollectionFeatureRegistry.sol";

import "../../contracts/name/Contracts.sol";
import "../../contracts/name/NameRegistry.sol";

import "./mock/MockLicensedUserManager.sol";
import "./mock/MockStartrailRegistry.sol";

import "./StartrailTestLibrary.sol";

contract StartrailTestBase is StartrailTestLibrary, Contracts {
    string internal constant COLLECTION_NAME = "NoMoreApes";
    string internal constant COLLECTION_SYMBOL = "NOAPE";
    string internal constant COLLECTION_METADATA_CID =
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";

    ///                                                          ///
    ///                          BASE SETUP                      ///
    ///                                                          ///

    StartrailCollectionFeatureRegistry internal featureRegistry;
    CollectionFactory internal collectionFactory;
    NameRegistry internal nameRegistry;

    MockLicensedUserManager internal mockLicensedUserManager;
    MockStartrailRegistry internal mockStartrailRegistry;

    address internal ownableFeatureImpl;
    address internal erc721FeatureImpl;
    address internal lockExternalTransferFeatureImpl;
    address internal srrFeatureImpl;
    address internal srrApprovalFeatureImpl;
    address internal erc2981RoyaltyFeatureImpl;

    address internal admin;
    address internal collectionOwner1;
    address internal trustedForwarder;

    address internal licensedUser1;
    address internal licensedUser2;

    function setUp() public virtual {
        admin = vm.addr(0xabc);
        collectionOwner1 = vm.addr(0x123);
        trustedForwarder = vm.addr(0x456);

        nameRegistry = new NameRegistry();
        nameRegistry.initialize(admin);

        // Deploy Core Collection Contracts
        address featureRegistryAddress;
        (featureRegistryAddress, ownableFeatureImpl) = createFeatureRegistry(
            admin,
            trustedForwarder,
            address(nameRegistry)
        );
        featureRegistry = StartrailCollectionFeatureRegistry(
            featureRegistryAddress
        );

        vm.prank(admin);
        collectionFactory = new CollectionFactory(featureRegistryAddress);

        // Deploy Feature Contracts
        erc721FeatureImpl = deployERC721Feature(featureRegistry);
        lockExternalTransferFeatureImpl = deployLockExternalTransferFeature(
            featureRegistry
        );
        srrFeatureImpl = deploySRRFeature(featureRegistry);
        srrApprovalFeatureImpl = deploySRRApproveTransferFeature(
            featureRegistry
        );
        erc2981RoyaltyFeatureImpl = deployERC2981RoyaltyFeature(
            featureRegistry
        );

        // Mock LUM
        mockLicensedUserManager = new MockLicensedUserManager();
        vm.prank(admin);
        nameRegistry.set(
            Contracts.LICENSED_USER_MANAGER,
            address(mockLicensedUserManager)
        );

        // Mock LU wallets
        licensedUser1 = vm.addr(0x1212);
        licensedUser2 = vm.addr(0x1313);
        mockLicensedUserManager.addWallet(licensedUser1);
        mockLicensedUserManager.addWallet(licensedUser2);

        // Mock StartrailRegistry
        mockStartrailRegistry = new MockStartrailRegistry();
        vm.prank(admin);
        nameRegistry.set(
            Contracts.STARTRAIL_REGISTRY,
            address(mockStartrailRegistry)
        );

        // Mock Custom History
        mockStartrailRegistry.addCustomHistory(
            CUSTOM_HISTORY_ID_EXHIBITION,
            "The 54th SBI Art Auction"
        );

        // Setup labels for traces
        vm.label(admin, "Administrator");
        vm.label(address(collectionFactory), "CollectionFactory");
        vm.label(collectionOwner1, "CollectionOwner1");
        vm.label(address(featureRegistry), "FeatureRegistry");
        vm.label(licensedUser1, "LicensedUser1");
        vm.label(licensedUser2, "LicensedUser2");
        vm.label(address(mockLicensedUserManager), "MockLicensedUserManager");
        vm.label(address(mockStartrailRegistry), "MockStartrailRegistry");
        vm.label(address(nameRegistry), "NameRegistry");
        vm.label(trustedForwarder, "TrustedForwarder");
    }

    function deployERC721Feature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address erc721ddress) {
        ERC721Feature erc721Feature = new ERC721Feature();

        // Initialize the implementation contract for safety
        erc721Feature.__ERC721Feature_initialize("ImplOnly", "IMPLONLY");

        bytes4[] memory selectors = new bytes4[](15);

        uint8 selIdx = 0;

        // ERC721Feature
        selectors[selIdx++] = ERC721Feature.__ERC721Feature_initialize.selector;
        selectors[selIdx++] = ERC721Feature.exists.selector;

        // ERC721
        selectors[selIdx++] = ERC721UpgradeableBase.balanceOf.selector;
        selectors[selIdx++] = ERC721UpgradeableBase.ownerOf.selector;
        selectors[selIdx++] = 0x42842e0e; // safeTransferFrom(address,address,uint256)
        selectors[selIdx++] = 0xb88d4fde; // safeTransferFrom(address,address,uint256,bytes)
        selectors[selIdx++] = ERC721UpgradeableBase.transferFrom.selector;
        selectors[selIdx++] = ERC721UpgradeableBase.approve.selector;
        selectors[selIdx++] = ERC721UpgradeableBase.getApproved.selector;
        selectors[selIdx++] = ERC721UpgradeableBase.setApprovalForAll.selector;
        selectors[selIdx++] = ERC721UpgradeableBase.isApprovedForAll.selector;

        // ERC721Metadata
        selectors[selIdx++] = ERC721UpgradeableBase.name.selector;
        selectors[selIdx++] = ERC721UpgradeableBase.symbol.selector;
        selectors[selIdx++] = ERC721Feature.tokenURI.selector;

        erc721ddress = address(erc721Feature);
        deployFeature(admin, featureRegistry_, erc721ddress, selectors);

        vm.prank(admin);
        featureRegistry_.setSupportedInterface(type(IERC721).interfaceId, true);

        vm.prank(admin);
        featureRegistry_.setSupportedInterface(
            type(IERC721Metadata).interfaceId,
            true
        );
    }

    function deployLockExternalTransferFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        LockExternalTransferFeature lockExternalTransferFeature = new LockExternalTransferFeature();

        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = LockExternalTransferFeature
            .getLockExternalTransfer
            .selector;
        selectors[1] = LockExternalTransferFeature
            .setLockExternalTransfer
            .selector;

        lockExternalTransferFeatureImpl = address(lockExternalTransferFeature);
        deployFeature(
            admin,
            featureRegistry_,
            lockExternalTransferFeatureImpl,
            selectors
        );

        return lockExternalTransferFeatureImpl;
    }

    function deploySRRFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        SRRFeature feature = new SRRFeature();

        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = SRRFeature.createSRR.selector;
        selectors[1] = SRRFeature.getSRR.selector;
        selectors[2] = SRRFeature.updateSRR.selector;

        srrFeatureImpl = address(feature);
        deployFeature(admin, featureRegistry_, srrFeatureImpl, selectors);

        return srrFeatureImpl;
    }

    function deploySRRApproveTransferFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        SRRApproveTransferFeature feature = new SRRApproveTransferFeature();

        bytes4[] memory selectors = new bytes4[](6);

        selectors[0] = 0xc0b00724; // approveSRRByCommitment(uint256,bytes32,string,uint256)
        selectors[1] = 0x81882bd0; // approveSRRByCommitment(uint256,bytes32,string)
        selectors[2] = SRRApproveTransferFeature
            .approveSRRByCommitmentFromBulk
            .selector;
        selectors[3] = SRRApproveTransferFeature.cancelSRRCommitment.selector;
        selectors[4] = SRRApproveTransferFeature.transferSRRByReveal.selector;
        selectors[5] = SRRApproveTransferFeature.getSRRCommitment.selector;

        srrApprovalFeatureImpl = address(feature);
        deployFeature(
            admin,
            featureRegistry_,
            srrApprovalFeatureImpl,
            selectors
        );

        return srrApprovalFeatureImpl;
    }

    function deployERC2981RoyaltyFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        ERC2981RoyaltyFeature feature = new ERC2981RoyaltyFeature();

        bytes4[] memory selectors = new bytes4[](4);

        selectors[0] = ERC2981RoyaltyFeature.updateSRRRoyalty.selector;
        selectors[1] = ERC2981RoyaltyFeature
            .updateSRRRoyaltyReceiverMulti
            .selector;
        selectors[2] = ERC2981RoyaltyFeature.getSRRRoyalty.selector;
        selectors[3] = ERC2981RoyaltyFeature.royaltyInfo.selector;

        erc2981RoyaltyFeatureImpl = address(feature);
        deployFeature(
            admin,
            featureRegistry_,
            erc2981RoyaltyFeatureImpl,
            selectors
        );

        vm.prank(admin);
        featureRegistry_.setSupportedInterface(
            type(IERC2981).interfaceId,
            true
        );

        return erc2981RoyaltyFeatureImpl;
    }

    function createCollection(address creatorLU) internal returns (address) {
        vm.recordLogs();

        vm.prank(trustedForwarder);
        (bool success, ) = address(collectionFactory).call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    CollectionFactory.createCollectionContract.selector,
                    COLLECTION_NAME,
                    COLLECTION_SYMBOL,
                    COLLECTION_METADATA_CID,
                    bytes32(keccak256("random salt"))
                ),
                creatorLU
            )
        );
        require(success);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        Vm.Log memory collectionCreatedLog = entries[entries.length - 1];
        return address(bytes20(collectionCreatedLog.topics[1] << 96));
    }
}
