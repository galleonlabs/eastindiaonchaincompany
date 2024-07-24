require("@nomicfoundation/hardhat-toolbox");
const { vars } = require("hardhat/config");

const BASESCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");

module.exports = {
  solidity: "0.8.24",
  networks: {
    base: {
      url: `https://mainnet.base.org`,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiUrl: "https://mainnet.basescan.org",
    apiKey: BASESCAN_API_KEY,
  },
};