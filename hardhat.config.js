require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:8545",
      // 假设Ganache使用默认账户，这里不设置私钥也可以部署
      // 如果需要指定私钥，可以取消下面的注释并填入Ganache的私钥
      // accounts: ["0x私钥"]
    }
  }
};
