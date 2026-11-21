# 快拍下饭吧 · MetaBite 赛博幽灵食堂

Monad Blitz @ 广州（2026-11-21）参赛作品。**本仓库全部代码于比赛当天编写**；创意与架构设计沿用赛前文档《区块链逻辑架构》。

拍一张饭照 → 估算卡路里 → 钱包签名 → 上链投喂 → 累计干饭经验 → 推导幽灵等级。感知层目前是 Mock（诚实标注），账本层是 Monad 测试网真链。

## 链接

- 公开演示（GitHub Pages）：https://melodyjie-01.github.io/metabite/ （推送后由工作流自动发布）
- 代码仓库：https://github.com/melodyjie-01/metabite
- 合约地址：见 `frontend/abi/MetaBite.json`（部署后自动写入；当前为占位符）
- 区块浏览器：https://testnet.monadvision.com / https://testnet.monadscan.com

## 目录结构

```
├── index.html                  # 根目录跳转页（Pages 入口）
├── contracts/MetaBite.sol      # 智能合约（当天重写）
├── test/MetaBite.test.js       # 单元测试（当天重写）
├── scripts/deploy.js           # 部署并回写前端 ABI
├── scripts/interact.js         # 命令行投喂
├── python/interact.py          # web3.py 投喂/查询
├── frontend/快拍下饭吧.html     # 像素风前端：真链 + Mock 双模式
├── frontend/connect.js         # 钱包连接 / 同步回执 / 回退
├── frontend/abi-inline.js      # 页面内联 ABI（部署自动覆盖）
├── frontend/abi/MetaBite.json  # 地址 + ABI（部署自动覆盖）
├── hardhat.config.js / package.json / .env.example / .gitignore
└── .github/workflows/pages.yml # 静态站自动发布
```

## 快速上手

```bash
npm install                      # Node ≥ 18；国内网络可加 --registry=https://registry.npmmirror.com
npx hardhat test                 # 本地测试
cp .env.example .env             # 填测试网私钥（严禁主网私钥、严禁提交）
npx hardhat run scripts/deploy.js --network monad-testnet
npm run serve                    # 本地 http://localhost:8080 打开前端
```

测试 MON 领取：https://faucet.monad.xyz 或 https://mojo.devnads.com（活动页）。

## 合约接口

- `feed(uint256 kcal)`：投喂一顿，1~5000 kcal，越界自定义错误拒绝；发 `Feast` 收据事件
- `stats(address)`：一次返回 (累计kcal, 投喂次数, 等级)
- `levelOf(address)`：纯推导 Lv.1~5，门槛 1000 / 5000 / 20000 / 100000
- `eaters(address)`：公开档案 (totalKcal, meals)

## Monad 特性利用

- `eth_sendRawTransactionSync`：同步回执 RPC，喂完立刻刷新（钱包不支持自动回退普通发送）
- MIP-8 存储页预热：`Eater` struct 字段连续排布，同页冷读一次、其余 slot 100 gas，无需改代码
- 600ms 最终性：投喂体验"秒级到账"

## 设计取舍（答辩要点）

- 等级不存储、按经验现算：派生数据只留一份真相，省 gas 且永远一致
- 事件存证：`Feast` 是每顿饭的永久收据，历史时间线翻事件即可，不用改合约
- 信任模型：数据在 Monad 共识账本上，不在公司服务器；换设备登录同钱包，档案仍在

## 合规与提交清单

- [x] 代码当天编写（合约/测试/前端/脚本/配置/文档均为 2026-11-21 版本）
- [x] 公开 GitHub 仓库
- [ ] 合约部署到 Monad 测试网（需测试 MON 与钱包）
- [ ] GitHub Pages 公开演示链接（推送后自动发布）
- [ ] mojo.devnads.com 项目提交（截止以现场为准：18:30 / 19:00 取早者）
- [ ] 3 分钟演示（PPT 与视频作者后补）

**安全红线**：私钥只放 `.env`，已被 `.gitignore` 排除；永远不要提交、不要贴进任何聊天或表单。