import test from "node:test";
import assert from "node:assert/strict";
import { formatWalletAddress } from "./activity-utils";
import { walletMetadata, walletAddressMetadata } from "./__fixtures__/activity";

test("formats metadata.wallet", () => {
  assert.equal(
    formatWalletAddress(walletMetadata),
    "0x1234…5678",
  );
});

test("formats metadata.walletAddress", () => {
  assert.equal(
    formatWalletAddress(walletAddressMetadata),
    "0xabcd…ef12",
  );
});