require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox');
const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/xx";  // 你也可以使用其他可靠的Sepolia RPC端点，可从节点提供商处获取
const PRIVATE_KEY = "xx";  // 替换为你自己的以太坊钱包私钥，要妥善保管私钥

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,  // Sepolia的链ID是11155111
    },
    ganache: {
      url: "http://127.0.0.1:8545",
      // 假设Ganache使用默认账户，这里不设置私钥也可以部署
      // 如果需要指定私钥，可以取消下面的注释并填入Ganache的私钥
      // accounts: ["0x私钥"]
    }
  }
};
