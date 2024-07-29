// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.21;

/**
 * @dev Functions and errors for add history.
 */
interface ISRRHistoryFeatureV01 {
    error AddHistoryNotPermitted();
    error CustomHistoryDoesNotExist();
    error MaxCombinedTokensAndHistoriesExceeded();

    /**
     * @dev Associating custom histories with SRRs
     * @param tokenIds Array of SRR token IDs
     * @param customHistoryIds Array of customHistoryIds
     */
    function addHistory(
        uint256[] calldata tokenIds,
        uint256[] calldata customHistoryIds
    ) external;
}
