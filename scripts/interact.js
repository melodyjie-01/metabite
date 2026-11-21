// MetaBite 命令行投喂 · Monad Blitz @广州 2026-11-21 当天编写
// 用法：npx hardhat run scripts/interact.js --network monad-testnet -- 650
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

const LEVEL_NAMES = { 1: "饿饿鬼", 2: "干饭鬼", 3: "大胃王鬼", 4: "赛博饕餮", 5: "宇宙级饭桶" };

async function main() {
  const kcal = Number(process.argv[2] || 650);
  if (!Number.isInteger(kcal) || kcal <= 0 || kcal > 5000) {
    throw new Error("卡路里必须是 1~5000 的整数，例如：... -- 650");
  }

  const { address, abi } = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "frontend", "abi", "MetaBite.json"), "utf8")
  );
  if (!address || /^0x0+$/.test(address)) throw new Error("请先运行 scripts/deploy.js 获得真实合约地址");

  const [signer] = await hre.ethers.getSigners();
  const metabite = await hre.ethers.getContractAt(abi, address, signer);

  console.log(`投喂 ${kcal} kcal ...`);
  const tx = await metabite.feed(kcal);
  const receipt = await tx.wait();
  console.log("✅ 上链成功 · 哈希", receipt.hash, "· 区块", receipt.blockNumber, "· gas", receipt.gasUsed.toString());

  const [total, meals, level] = await metabite.stats(signer.address);
  console.log(`档案：累计 ${total} kcal / 投喂 ${meals} 次 / Lv.${level} ${LEVEL_NAMES[level]}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});