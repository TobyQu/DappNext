const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function main() {
  console.log("开始部署TodoContract合约...");

  // 获取合约工厂
  const TodoContract = await ethers.getContractFactory("TodoContract");
  
  // 部署合约 - 发送0.1 ETH
  const todoContract = await TodoContract.deploy({ value: ethers.utils.parseEther("0.1") });
  
  // 等待合约部署完成
  await todoContract.deployed();
  
  console.log(`TodoContract合约已部署至地址: ${todoContract.address}`);
  
  // 更新环境变量 - 创建或更新.env.local文件
  updateEnvFile(todoContract.address);
  
  // 可选：验证合约
  const networkName = (await ethers.provider.getNetwork()).name;
  if (networkName !== "unknown" && networkName !== "hardhat") {
    console.log("等待区块确认后开始验证合约...");
    
    // 等待5个区块确认
    await todoContract.deployTransaction.wait(5);
    
    console.log("开始验证合约...");
    try {
      await verifyContract(todoContract.address);
      console.log("合约验证成功！");
    } catch (error) {
      console.error("合约验证失败:", error);
    }
  }
}

// 更新环境变量文件
function updateEnvFile(contractAddress) {
  const envPath = path.resolve(__dirname, "../.env.local");
  let envContent = "";
  
  // 如果文件存在，读取内容
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }
  
  // 更新环境变量
  const envVars = {
    NEXT_PUBLIC_CONTRACT_ADDRESS: contractAddress,
    NEXT_PUBLIC_IS_CONTRACT_DEPLOYED: "true"
  };
  
  // 为每个环境变量生成一行
  for (const [key, value] of Object.entries(envVars)) {
    // 如果已存在该环境变量，则替换值
    if (envContent.includes(`${key}=`)) {
      const regex = new RegExp(`${key}=.*`, "g");
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      // 否则添加新的环境变量
      envContent += `\n${key}=${value}`;
    }
  }
  
  // 写入文件
  fs.writeFileSync(envPath, envContent.trim());
  console.log(`环境变量已更新: ${envPath}`);
}

// 验证合约
async function verifyContract(contractAddress) {
  try {
    const network = await ethers.provider.getNetwork();
    execSync(
      `npx hardhat verify --network ${network.name} ${contractAddress}`,
      { stdio: "inherit" }
    );
  } catch (error) {
    console.error("合约验证出错:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 