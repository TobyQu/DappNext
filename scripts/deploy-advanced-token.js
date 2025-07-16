// 引入 Hardhat 的 ethers.js 工具
const { ethers } = require("hardhat");

async function main() {
  // 获取部署者地址
  const [deployer] = await ethers.getSigners();
  console.log("使用地址部署合约:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());

  // 设置代币参数
  const tokenName = "Advanced Token";       // 代币名称
  const tokenSymbol = "ADV";                // 代币符号
  const tokenDecimals = 18;                 // 代币小数位数（通常是 18）
  const initialSupply = ethers.utils.parseUnits("1000000", tokenDecimals);  // 初始发行量：100 万
  const maxSupply = ethers.utils.parseUnits("10000000", tokenDecimals);     // 最大供应量：1000 万（0 表示无上限）
  const owner = deployer.address;           // 合约所有者地址

  console.log("代币名称:", tokenName);
  console.log("代币符号:", tokenSymbol);
  console.log("代币小数位:", tokenDecimals);
  console.log("初始供应量:", ethers.utils.formatUnits(initialSupply, tokenDecimals));
  console.log("最大供应量:", ethers.utils.formatUnits(maxSupply, tokenDecimals));
  console.log("合约所有者:", owner);

  // 获取合约工厂
  const AdvancedToken = await ethers.getContractFactory("AdvancedToken");
  
  // 部署合约
  console.log("开始部署合约...");
  const token = await AdvancedToken.deploy(
    tokenName,
    tokenSymbol,
    tokenDecimals,
    initialSupply,
    maxSupply,
    owner
  );

  // 等待部署完成
  await token.deployed();
  
  // 输出合约地址
  console.log("高级代币合约已部署到地址:", token.address);
  
  // 验证合约部署
  console.log("\n开始验证合约部署...");
  
  // 获取代币信息
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  const maxTokenSupply = await token.maxSupply();
  
  console.log("验证代币名称:", name);
  console.log("验证代币符号:", symbol);
  console.log("验证代币小数位:", decimals);
  console.log("验证总供应量:", ethers.utils.formatUnits(totalSupply, decimals));
  console.log("验证最大供应量:", ethers.utils.formatUnits(maxTokenSupply, decimals));
  
  // 获取部署者余额
  const deployerBalance = await token.balanceOf(deployer.address);
  console.log("部署者代币余额:", ethers.utils.formatUnits(deployerBalance, decimals));
  
  console.log("\n部署和验证完成!");
  console.log("在前端代码中使用此合约地址:", token.address);
}

// 执行 main 函数，并捕获异常
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  }); 