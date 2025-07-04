import * as fs from 'fs';
import * as path from 'path';
import { ethers } from 'hardhat';

/**
 * 该脚本在合约编译后自动更新前端代码中的合约字节码
 * 运行方法：npx hardhat run scripts/updateBytecode.ts
 */
async function main() {
  console.log('开始更新合约字节码...');

  // 获取合约工厂
  const TodoContract = await ethers.getContractFactory("TodoContract");
  
  // 获取字节码
  const bytecode = TodoContract.bytecode;
  
  // 要更新的文件路径
  const contractUtilsPath = path.resolve(__dirname, '../src/lib/contractUtils.ts');
  
  // 读取文件内容
  let content = fs.readFileSync(contractUtilsPath, 'utf8');
  
  // 替换字节码
  const bytecodeRegex = /export const CONTRACT_BYTECODE = "0x[0-9a-fA-F]*";/;
  const newBytecode = `export const CONTRACT_BYTECODE = "${bytecode}";`;
  
  if (bytecodeRegex.test(content)) {
    // 如果已存在字节码行，替换它
    content = content.replace(bytecodeRegex, newBytecode);
  } else {
    // 如果不存在，找到导入语句后添加
    const importRegex = /import config from '.\/config';/;
    content = content.replace(
      importRegex,
      `import config from './config';\n\n// 合约字节码 - 由Hardhat编译后自动更新\n${newBytecode}`
    );
  }
  
  // 写回文件
  fs.writeFileSync(contractUtilsPath, content);
  
  console.log(`合约字节码已更新到: ${contractUtilsPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 