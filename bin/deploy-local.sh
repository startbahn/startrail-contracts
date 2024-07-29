#!/bin/sh

export TS_NODE_TRANSPILE_ONLY=1 # skip type checks to speed up script

npx hardhat run --network localhost scripts/deploy/001-deploy-initial.js || exit $?
npx hardhat run --network localhost scripts/deploy/002-deploy-bulk-transfer.js || exit $?
npx hardhat run --network localhost scripts/deploy/003-deploy-exhibition-history.js || exit $?
npx hardhat run --network localhost scripts/deploy/004-deploy-second-transfer.js || exit $?
npx hardhat run --network localhost scripts/deploy/005-deploy-transfer-from-eoa-to-eoa.js || exit $?
npx hardhat run --network localhost scripts/deploy/006-deploy-provenance-created-at-fix.js || exit $?
npx hardhat run --network localhost scripts/deploy/007-deploy-for-marketplaces.js || exit $?
npx hardhat run --network localhost scripts/deploy/008-deploy-bulk-issue-enhancement.ts || exit $?
npx hardhat run --network localhost scripts/deploy/009-deploy-ownable.ts || exit $?
npx hardhat run --network localhost scripts/deploy/010-deploy-meta-tx-polygon-opensea.ts || exit $?
npx hardhat run --network localhost scripts/deploy/011-deploy-bulk.ts || exit $?
npx hardhat run --network localhost scripts/deploy/012-deploy-create-srr-issue-to-recipient.ts || exit $?
npx hardhat run --network localhost scripts/deploy/013-deploy-rename-recipient.ts || exit $?
npx hardhat run --network localhost scripts/deploy/014-deploy-bytecode-reduction.ts || exit $?
npx hardhat run --network localhost scripts/deploy/015-deploy-custom-history-update.ts || exit $?
npx hardhat run --network localhost scripts/deploy/016-deploy-update-srr-add-history-permission.ts || exit $?
npx hardhat run --network localhost scripts/deploy/017-deploy-audit-fixes.ts || exit $?
npx hardhat run --network localhost scripts/deploy/018-deploy-custom-history-name-update.ts || exit $?
npx hardhat run --network localhost scripts/deploy/019-deploy-enable-ipfs.ts || exit $?
npx hardhat run --network localhost scripts/deploy/020-deploy-royalty-erc2981.ts || exit $?
npx hardhat run --network localhost scripts/deploy/021-deploy-change-ipfs-url.ts || exit $?
npx hardhat run --network localhost scripts/deploy/022-deploy-royalty-receiver-multi-update.ts || exit $?
npx hardhat run --network localhost scripts/deploy/023-deploy-royalty-refactor.ts || exit $?
npx hardhat run --network localhost scripts/deploy/024-deploy-collections.ts || exit $?
npx hardhat run --network localhost scripts/deploy/025-deploy-fix-transfer-from-with-provenance.ts || exit $?
npx hardhat run --network localhost scripts/deploy/026-deploy-bulk-collection.ts || exit $?
npx hardhat run --network localhost scripts/deploy/027-deploy-bulk-issue-on-buyer.ts || exit $?
