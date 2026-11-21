// MetaBite Hardhat 配置 · Monad Blitz @广州 2026-11-21 当天编写
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, MONAD_TESTNET_RPC } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    "monad-testnet": {
      url: MONAD_TESTNET_RPC || "https://testnet-rpc.monad.xyz",
      chainId: 10143,
      // 私钥缺失时该网络不可用，防止误用真实账户
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  paths: { sources: "./contracts", tests: "./test", scripts: "./scripts" },
};