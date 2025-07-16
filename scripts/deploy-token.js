// 引入 Hardhat 的 ethers.js 工具
const { ethers } = require("hardhat");

async function main() {
  // 设置初始发行量，这里是 100 万个代币（注意 18 位小数）
  const initialSupply = ethers.utils.parseUnits("1000000", 18);

  // 获取合约工厂
  const Token = await ethers.getContractFactory("MyToken");

  // 部署合约，并传入初始发行量
  const token = await Token.deploy(initialSupply);

  // 等待部署完成
  await token.deployed();

  // 输出合约地址
  console.log("Token deployed to:", token.address);
}

// 执行 main 函数，并捕获异常
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 