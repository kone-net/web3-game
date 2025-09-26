const hre = require("hardhat");

async function main() {
  const TicketCollection = await hre.ethers.getContractFactory("TicketCollection");
  const ticketCollection = await TicketCollection.deploy();

  // 等待合约部署完成
  await ticketCollection.waitForDeployment();
  
  // 获取部署后的合约地址
  const contractAddress = await ticketCollection.getAddress();

  console.log("TicketCollection deployed to:", contractAddress);
  console.log(`请在前端应用中使用这个地址替换原有的合约地址：${contractAddress}`);
}

main()
 .then(() => process.exit(0))
 .catch((error) => {
    console.error(error);
    process.exit(1);
  });