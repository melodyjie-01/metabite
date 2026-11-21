/* MetaBite ABI 内联版 · 2026-11-21 当天编写 · 部署后由 scripts/deploy.js 自动覆盖 address */
window.METABITE = {
  "address": "0x0000000000000000000000000000000000000000",
  "abi": [
    { "inputs": [{ "internalType": "uint256", "name": "kcal", "type": "uint256" }], "name": "feed", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "diner", "type": "address" }], "name": "levelOf", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "diner", "type": "address" }], "name": "stats", "outputs": [{ "internalType": "uint256", "name": "totalKcal", "type": "uint256" }, { "internalType": "uint256", "name": "meals", "type": "uint256" }, { "internalType": "uint8", "name": "level", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "eaters", "outputs": [{ "internalType": "uint256", "name": "totalKcal", "type": "uint256" }, { "internalType": "uint32", "name": "meals", "type": "uint32" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "MAX_KCAL_PER_MEAL", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "provided", "type": "uint256" }, { "internalType": "uint256", "name": "cap", "type": "uint256" }], "name": "MealTooLarge", "type": "error" },
    { "inputs": [], "name": "EmptyMeal", "type": "error" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "diner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "kcal", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newTotalKcal", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "mealIndex", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "Feast", "type": "event" }
  ]
};