// SPDX-License-Identifier: GPL-3.0-only
pragma solidity 0.8.21;

import "forge-std/Vm.sol";
import {Test} from "forge-std/Test.sol";

import {IDiamondWritable} from "@solidstate/contracts/proxy/diamond/writable/IDiamondWritable.sol";
import {IERC721} from "@solidstate/contracts/interfaces/IERC721.sol";
import {IERC721Metadata} from "@solidstate/contracts/token/ERC721/metadata/IERC721Metadata.sol";
import {IERC2981} from "@openzeppelin/contracts/interfaces/IERC2981.sol";

import "../../contracts/collection/CollectionFactoryV01.sol";
import "../../contracts/collection/CollectionProxy.sol";
import "../../contracts/collection/features/BulkFeatureV01.sol";
import "../../contracts/collection/features/ERC721FeatureV03.sol";
import "../../contracts/collection/features/LockExternalTransferFeatureV01.sol";
import "../../contracts/collection/features/SRRApproveTransferFeatureV02.sol";
import "../../contracts/collection/features/SRRFeatureV02.sol";
import "../../contracts/collection/features/ERC2981RoyaltyFeatureV01.sol";
import "../../contracts/collection/features/SRRHistoryFeatureV01.sol";
import "../../contracts/collection/features/SRRMetadataFeatureV01.sol";
import "../../contracts/collection/registry/StartrailCollectionFeatureRegistry.sol";

import "../../contracts/name/Contracts.sol";
import "../../contracts/name/NameRegistry.sol";

import "./mock/MockLicensedUserManager.sol";
import "./mock/MockStartrailRegistry.sol";

import "./StartrailTestLibrary.sol";

/*
 * A base contract for Startrail collection tests that provides:
 * -  a setUp function for deploying and configuring the core set
 *    of collection contracts
 * - helper functions
 * - test data and addresses
 */
contract StartrailTestBase is StartrailTestLibrary, Contracts {
    string internal constant COLLECTION_NAME = "NoMoreApes";
    string internal constant COLLECTION_SYMBOL = "NOAPE";

    ///                                                          ///
    ///                          BASE SETUP                      ///
    ///                                                          ///

    StartrailCollectionFeatureRegistry internal featureRegistry;
    CollectionFactoryV01 internal collectionFactory;
    NameRegistry internal nameRegistry;

    MockLicensedUserManager internal mockLicensedUserManager;
    MockStartrailRegistry internal mockStartrailRegistry;

    address internal ownableFeatureImpl;
    address internal erc721FeatureImpl;
    address internal lockExternalTransferFeatureImpl;
    address internal srrFeatureImpl;
    address internal srrApprovalFeatureImpl;
    address internal erc2981RoyaltyFeatureImpl;
    address internal srrMetadataFeatureImpl;
    address internal srrHistoryFeatureImpl;
    address internal bulkFeatureImpl;

    address internal collectionProxyImpl;

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

        collectionProxyImpl = address(new CollectionProxy());
        CollectionProxy(payable(collectionProxyImpl))
            .__CollectionProxy_initialize(address(0x1));

        vm.prank(admin);

        collectionFactory = new CollectionFactoryV01();
        collectionFactory.initialize(
            featureRegistryAddress,
            collectionProxyImpl
        );

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
        srrMetadataFeatureImpl = deploySRRMetadataFeature(featureRegistry);
        srrHistoryFeatureImpl = deploySRRHistoryFeature(featureRegistry);
        bulkFeatureImpl = deployBulkFeature(featureRegistry);

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

        // Mock Custom Histories
        mockStartrailRegistry.addCustomHistory(
            CUSTOM_HISTORY_ID_EXHIBITION,
            "The 54th SBI Art Auction"
        );
        mockStartrailRegistry.addCustomHistory(
            CUSTOM_HISTORY_ID_AUCTION,
            "Stratosphere Beijing Auction"
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
        ERC721FeatureV03 erc721Feature = new ERC721FeatureV03();

        // Initialize the implementation contract for safety
        erc721Feature.__ERC721Feature_initialize("ImplOnly", "IMPLONLY");

        bytes4[] memory selectors = new bytes4[](14);

        uint8 selIdx = 0;

        // ERC721Feature
        selectors[selIdx++] = ERC721FeatureV03
            .__ERC721Feature_initialize
            .selector;
        selectors[selIdx++] = ERC721FeatureV03.exists.selector;
        selectors[selIdx++] = ERC721FeatureV03
            .transferFromWithProvenance
            .selector;
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

        erc721ddress = address(erc721Feature);
        deployFeature(admin, featureRegistry_, erc721ddress, selectors);

        vm.prank(admin);
        featureRegistry_.setSupportedInterface(type(IERC721).interfaceId, true);

        vm.prank(admin);
        featureRegistry_.setSupportedInterface(
            type(IERC721Metadata).interfaceId,
            true
        );
        return erc721ddress;
    }

    function deployLockExternalTransferFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        LockExternalTransferFeatureV01 lockExternalTransferFeature = new LockExternalTransferFeatureV01();

        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = LockExternalTransferFeatureV01
            .getLockExternalTransfer
            .selector;
        selectors[1] = LockExternalTransferFeatureV01
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
        SRRFeatureV02 feature = new SRRFeatureV02();

        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = SRRFeatureV02.createSRR.selector;
        selectors[1] = SRRFeatureV02.getSRR.selector;
        selectors[2] = SRRFeatureV02.updateSRR.selector;

        srrFeatureImpl = address(feature);
        deployFeature(admin, featureRegistry_, srrFeatureImpl, selectors);

        return srrFeatureImpl;
    }

    function deploySRRApproveTransferFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        SRRApproveTransferFeatureV02 feature = new SRRApproveTransferFeatureV02();

        bytes4[] memory selectors = new bytes4[](6);

        selectors[0] = 0xc0b00724; // approveSRRByCommitment(uint256,bytes32,string,uint256)
        selectors[1] = 0x81882bd0; // approveSRRByCommitment(uint256,bytes32,string)
        selectors[2] = SRRApproveTransferFeatureV02
            .cancelSRRCommitment
            .selector;
        selectors[3] = SRRApproveTransferFeatureV02
            .transferSRRByReveal
            .selector;
        selectors[4] = SRRApproveTransferFeatureV02.getSRRCommitment.selector;

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
        ERC2981RoyaltyFeatureV01 feature = new ERC2981RoyaltyFeatureV01();

        bytes4[] memory selectors = new bytes4[](4);

        selectors[0] = ERC2981RoyaltyFeatureV01.updateSRRRoyalty.selector;
        selectors[1] = ERC2981RoyaltyFeatureV01
            .updateSRRRoyaltyReceiverMulti
            .selector;
        selectors[2] = ERC2981RoyaltyFeatureV01.getSRRRoyalty.selector;
        selectors[3] = ERC2981RoyaltyFeatureV01.royaltyInfo.selector;

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

    function deploySRRMetadataFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        SRRMetadataFeatureV01 feature = new SRRMetadataFeatureV01();

        bytes4[] memory selectors = new bytes4[](3);

        selectors[0] = SRRMetadataFeatureV01.updateSRRMetadata.selector;
        selectors[1] = SRRMetadataFeatureV01.getSRRMetadata.selector;
        selectors[2] = SRRMetadataFeatureV01.tokenURI.selector;

        srrMetadataFeatureImpl = address(feature);
        deployFeature(
            admin,
            featureRegistry_,
            srrMetadataFeatureImpl,
            selectors
        );

        return srrMetadataFeatureImpl;
    }

    function deployBulkFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        BulkFeatureV01 feature = new BulkFeatureV01();

        bytes4[] memory selectors = new bytes4[](3);

        selectors[0] = BulkFeatureV01.createSRRFromBulk.selector;
        selectors[1] = BulkFeatureV01.approveSRRByCommitmentFromBulk.selector;
        selectors[2] = BulkFeatureV01
            .transferFromWithProvenanceFromBulk
            .selector;

        bulkFeatureImpl = address(feature);
        deployFeature(admin, featureRegistry_, bulkFeatureImpl, selectors);

        return srrMetadataFeatureImpl;
    }

    function deploySRRHistoryFeature(
        StartrailCollectionFeatureRegistry featureRegistry_
    ) internal returns (address) {
        SRRHistoryFeatureV01 feature = new SRRHistoryFeatureV01();

        bytes4[] memory selectors = new bytes4[](1);

        selectors[0] = SRRHistoryFeatureV01.addHistory.selector;

        srrHistoryFeatureImpl = address(feature);
        deployFeature(
            admin,
            featureRegistry_,
            srrHistoryFeatureImpl,
            selectors
        );

        return srrHistoryFeatureImpl;
    }

    function createCollection(address creatorLU) internal returns (address) {
        vm.recordLogs();

        vm.prank(trustedForwarder);
        (bool success, ) = address(collectionFactory).call(
            eip2771AppendSender(
                abi.encodeWithSelector(
                    CollectionFactoryV01.createCollectionContract.selector,
                    COLLECTION_NAME,
                    COLLECTION_SYMBOL,
                    bytes32(keccak256("random salt"))
                ),
                creatorLU
            )
        );
        require(success);

        Vm.Log[] memory entries = vm.getRecordedLogs();
        Vm.Log memory collectionCreatedLog = entries[entries.length - 1];
        return bytes32ToAddress(collectionCreatedLog.topics[1]);
    }
}
