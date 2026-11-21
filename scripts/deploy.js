// MetaBite 部署脚本 · Monad Blitz @广州 2026-11-21 当天编写
// 用法：npx hardhat run scripts/deploy.js --network monad-testnet
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) throw new Error("没有可用账户：请先在 .env 填入测试网 PRIVATE_KEY");

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("部署账户:", deployer.address);
  console.log("MON 余额:", hre.ethers.formatEther(balance));
  if (balance === 0n) throw new Error("余额为 0：先去 faucet.monad.xyz 或 mojo.devnads.com 领测试 MON");

  const Factory = await hre.ethers.getContractFactory("MetaBite");
  const metabite = await Factory.deploy();
  await metabite.waitForDeployment();
  const address = await metabite.getAddress();
  console.log("✅ MetaBite 已部署:", address);
  console.log("浏览器查看: https://testnet.monadvision.com/address/" + address);

  // 把真实地址 + ABI 写给前端两份载体（json 供脚本用，inline js 供页面直接用）
  const artifact = await hre.artifacts.readArtifact("MetaBite");
  const frontendDir = path.join(__dirname, "..", "frontend");
  fs.mkdirSync(path.join(frontendDir, "abi"), { recursive: true });
  fs.writeFileSync(
    path.join(frontendDir, "abi", "MetaBite.json"),
    JSON.stringify({ address, abi: artifact.abi }, null, 2)
  );
  fs.writeFileSync(
    path.join(frontendDir, "abi-inline.js"),
    "/* 部署自动覆盖 · " + new Date().toISOString() + " */\nwindow.METABITE = " +
      JSON.stringify({ address, abi: artifact.abi }, null, 2) + ";\n"
  );
  console.log("已更新 frontend/abi/MetaBite.json 与 frontend/abi-inline.js");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});