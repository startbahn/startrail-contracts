import { expect } from 'chai'
import { BigNumber, ethers, Wallet } from 'ethers'
import { id as keccak256Str, joinSignature } from 'ethers/lib/utils'

import { signMetaTx, toTypedMessageHash } from '../../utils/opensea-helpers'

describe("opensea-helpers", () => {
  const startrailRegistry = {
    getNonce: () => BigNumber.from(1),
    getDomainSeperator: () => keccak256Str(`domain`),
  };
  const fromWallet = Wallet.fromMnemonic(
    `bean entry answer unveil destroy noise during tuition split dinner couple identify`
  );
  const metaTxCalldata = `0x1234abcd00000000`;

  it("toTypedMessageHash", async () => {
    expect(
      await toTypedMessageHash(
        (startrailRegistry as any) as ethers.Contract,
        fromWallet.address,
        metaTxCalldata
      )
    ).to.equal(
      `0x3df88d1077fe4566b757eceafbc2b817ffba854796c3f25ccff7e4089dd7d94f`
    );
  });

  it("signMetaTx", async () => {
    expect(
      joinSignature(
        await signMetaTx(
          (startrailRegistry as any) as ethers.Contract,
          fromWallet,
          metaTxCalldata
        )
      )
    ).to.equal(
      `0x8a059796b7880675401bb6eecb52b42451ea35364e5ff0f94cc0138047fcbd314c74f933742e9d4727bc7c1ae844bb24f075049a8c7ad45fb764c569ef987a2e1b`
    );
  });
});
