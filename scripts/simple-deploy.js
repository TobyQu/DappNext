// 使用最简单的部署脚本
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("开始部署TodoContract合约...");

  // 获取合约工厂
  const TodoContract = await hre.ethers.getContractFactory("TodoContract");
  
  // 部署合约 - 发送0.1 ETH
  const todoContract = await TodoContract.deploy({ 
    value: hre.ethers.utils.parseEther("0.1") 
  });
  
  // 等待合约部署完成
  await todoContract.deployed();
  
  console.log(`TodoContract合约已部署至地址: ${todoContract.address}`);
  
  // 创建或更新.env.local文件
  const envPath = path.resolve(__dirname, '../.env.local');
  const envContent = `
NEXT_PUBLIC_CONTRACT_ADDRESS=${todoContract.address}
NEXT_PUBLIC_IS_CONTRACT_DEPLOYED=true
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_NETWORK_NAME=Localhost
`.trim();
  
  fs.writeFileSync(envPath, envContent);
  console.log(`环境变量已保存至: ${envPath}`);
}

// 运行主函数
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  }); 