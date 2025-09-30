require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // 加载.env文件中的环境变量

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
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
