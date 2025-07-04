#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// 将工作目录设置为项目根目录
process.chdir(path.resolve(__dirname));

console.log('开始部署Todo合约到本地网络...');

try {
  // 编译合约
  console.log('1. 编译合约...');
  execSync('npx hardhat compile', { stdio: 'inherit' });

  // 更新字节码
  console.log('2. 更新合约字节码...');
  execSync('npx hardhat run scripts/updateBytecode.ts', { stdio: 'inherit' });
  
  // 部署合约
  console.log('3. 部署合约到本地网络...');
  execSync('npx hardhat run scripts/deploy.ts --network localhost', { stdio: 'inherit' });
  
  console.log('✅ 部署成功完成！');
} catch (error) {
  console.error('❌ 部署过程中出错:', error.message);
  process.exit(1);
} 