"""MetaBite 链上交互（Python / web3.py）· Monad Blitz @广州 2026-11-21 当天编写

用法：
    pip install web3 python-dotenv
    python interact.py feed 650
    python interact.py stats 0x你的地址

.env（上级目录）提供：
    PRIVATE_KEY=仅测试网小额私钥，严禁主网资产私钥，严禁提交
    MONAD_TESTNET_RPC=可选，默认官方测试网 RPC
    CONTRACT_ADDRESS=可选，留空则读 frontend/abi/MetaBite.json
"""
import json
import os
import sys

from dotenv import load_dotenv
from web3 import Web3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(ROOT, ".env"))

RPC_URL = os.getenv("MONAD_TESTNET_RPC", "https://testnet-rpc.monad.xyz")
CHAIN_ID = 10143
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
LEVEL_NAMES = {1: "饿饿鬼", 2: "干饭鬼", 3: "大胃王鬼", 4: "赛博饕餮", 5: "宇宙级饭桶"}

w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    sys.exit(f"❌ 连不上 RPC: {RPC_URL}")

with open(os.path.join(ROOT, "frontend", "abi", "MetaBite.json"), encoding="utf-8") as f:
    deployed = json.load(f)

address = os.getenv("CONTRACT_ADDRESS") or deployed["address"]
if not Web3.is_address(address) or int(address, 16) == 0:
    sys.exit("❌ 没有有效合约地址：先跑 npx hardhat run scripts/deploy.js --network monad-testnet")

contract = w3.eth.contract(address=Web3.to_checksum_address(address), abi=deployed["abi"])


def feed(kcal: int) -> None:
    if not 1 <= kcal <= 5000:
        sys.exit("❌ 卡路里必须在 1~5000 之间")
    if not PRIVATE_KEY:
        sys.exit("❌ 请在 .env 配置 PRIVATE_KEY（仅测试网小额私钥）")
    acct = w3.eth.account.from_key(PRIVATE_KEY)
    tx = contract.functions.feed(kcal).build_transaction({
        "from": acct.address,
        "nonce": w3.eth.get_transaction_count(acct.address),
        "chainId": CHAIN_ID,
        "gas": 150_000,
        "gasPrice": w3.eth.gas_price,
    })
    signed = acct.sign_transaction(tx)
    raw = getattr(signed, "raw_transaction", None) or signed.rawTransaction
    tx_hash = w3.eth.send_raw_transaction(raw)
    print(f"⏳ 已发送，等待 Monad 600ms 最终性... {tx_hash.hex()}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"✅ 确认于区块 {receipt.block_number} · gas {receipt.gas_used}")
    stats(acct.address)


def stats(addr: str) -> None:
    total, meals, level = contract.functions.stats(Web3.to_checksum_address(addr)).call()
    print(f"{addr}\n累计 {total} kcal · 投喂 {meals} 次 · Lv.{level} {LEVEL_NAMES.get(level, '?')}")


if __name__ == "__main__":
    if len(sys.argv) >= 3 and sys.argv[1] == "feed":
        feed(int(sys.argv[2]))
    elif len(sys.argv) >= 3 and sys.argv[1] == "stats":
        stats(sys.argv[2])
    else:
        print(__doc__)