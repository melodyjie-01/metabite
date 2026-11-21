/* MetaBite 前端接真链 · ethers v6 · Monad Blitz @广州 2026-11-21 当天编写
 * 页面先引入 ethers UMD 与 abi-inline.js（window.METABITE = {address, abi}）。
 * 用本地服务器或 GitHub Pages 打开页面；file:// 双击打开时浏览器限制较多。
 */
(function () {
  'use strict';

  var MONAD_TESTNET = {
    chainId: 10143,
    chainName: 'Monad Testnet',
    nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
    rpcUrls: ['https://testnet-rpc.monad.xyz'],
    blockExplorerUrls: ['https://testnet.monadvision.com', 'https://testnet.monadscan.com']
  };
  var EXPLORER_TX = 'https://testnet.monadvision.com/tx/';

  var provider = null;
  var signer = null;
  var contract = null;

  function requireEnv() {
    if (typeof window.ethereum === 'undefined') throw new Error('未检测到钱包扩展（MetaMask / Phantom 等）');
    if (typeof ethers === 'undefined') throw new Error('ethers 未加载（检查网络或 CDN）');
    var cfg = window.METABITE;
    if (!cfg || !cfg.address || /^0x0+$/.test(cfg.address)) throw new Error('合约尚未部署：address 为占位符');
    return cfg;
  }

  async function ensureNetwork(p) {
    try {
      await p.send('wallet_switchEthereumChain', [{ chainId: '0x' + MONAD_TESTNET.chainId.toString(16) }]);
    } catch (err) {
      if (err && err.code === 4902) {
        await p.send('wallet_addEthereumChain', [MONAD_TESTNET]);
      } else {
        throw err;
      }
    }
  }

  // 连接钱包 + 切到 Monad 测试网 + 读回链上档案
  async function connect() {
    var cfg = requireEnv();
    provider = new ethers.BrowserProvider(window.ethereum);
    await ensureNetwork(provider);
    await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
    contract = new ethers.Contract(cfg.address, cfg.abi, signer);
    var s = await contract.stats(signer.address);
    return {
      account: signer.address,
      totalKcal: Number(s[0]),
      meals: Number(s[1]),
      level: Number(s[2])
    };
  }

  // 投喂：优先 Monad 原生 eth_sendRawTransactionSync（同步回执），不支持则回退普通发送
  async function feed(kcal) {
    if (!contract) await connect();
    var tx = await contract.feed.populateTransaction(kcal);
    var signed = await signer.signTransaction(tx);
    var receipt;
    try {
      receipt = await provider.send('eth_sendRawTransactionSync', [signed]);
    } catch (err) {
      var sent = await signer.sendTransaction(tx);
      receipt = await sent.wait();
    }
    var s = await contract.stats(signer.address);
    return {
      receipt: receipt,
      totalKcal: Number(s[0]),
      meals: Number(s[1]),
      level: Number(s[2])
    };
  }

  window.MetaBiteConnect = {
    connect: connect,
    feed: feed,
    explorerTx: function (hash) { return EXPLORER_TX + hash; },
    network: MONAD_TESTNET
  };
})();