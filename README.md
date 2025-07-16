# DappNext

基于 Next.js 的去中心化应用开发框架，集成了 Hardhat、Ethers.js 和 RainbowKit，用于快速开发以太坊 DApp。

## 功能特点

- 📱 响应式 UI，基于 Next.js 和 Tailwind CSS
- 🔗 内置钱包连接功能，使用 RainbowKit
- 📝 智能合约开发和部署，使用 Hardhat
- 🧩 模块化组件设计

## 项目结构

```
DappNext/
├── contracts/            # 智能合约代码
│   ├── TodoContract.sol  # 示例 Todo 合约
│   ├── MyToken.sol       # 基础 ERC-20 代币合约
│   └── AdvancedToken.sol # 高级 ERC-20 代币合约（带铸造和销毁功能）
├── scripts/              # 部署和测试脚本
│   ├── deploy.js         # 部署脚本
│   ├── deploy-token.js   # 部署基础代币脚本
│   └── deploy-advanced-token.js # 部署高级代币脚本
├── src/                  # 前端源代码
│   ├── app/              # Next.js 应用页面
│   ├── components/       # React 组件
│   └── lib/              # 工具库和合约交互
└── hardhat.config.cjs    # Hardhat 配置
```

## 快速开始

### 安装依赖

```bash
npm install
# 或
yarn
```

### 启动本地开发链

```bash
npx hardhat node
```

### 部署合约到本地链

```bash
# 部署 Todo 合约
npx hardhat run scripts/deploy.js --network localhost

# 部署基础 ERC-20 代币
npx hardhat run scripts/deploy-token.js --network localhost

# 部署高级 ERC-20 代币
npx hardhat run scripts/deploy-advanced-token.js --network localhost
```

### 启动前端开发服务器

```bash
npm run dev
# 或
yarn dev
```

## 代币开发指南

本项目包含两种代币合约实现：

### 1. 基础 ERC-20 代币 (MyToken.sol)

- 标准 ERC-20 实现
- 初始供应量在部署时设定
- 支持基本的转账和余额查询功能

部署和使用：
```bash
# 部署合约
npx hardhat run scripts/deploy-token.js --network localhost

# 更新合约地址
# 将输出的合约地址复制到 src/lib/tokenContract.ts 中的 TOKEN_CONTRACT_ADDRESS 变量
```

访问 `/token` 路径使用基础代币功能。

### 2. 高级 ERC-20 代币 (AdvancedToken.sol)

- 扩展的 ERC-20 实现
- 支持自定义名称、符号和小数位数
- 支持铸造新代币（仅合约所有者）
- 支持销毁代币
- 支持设置最大供应量

部署和使用：
```bash
# 部署合约
npx hardhat run scripts/deploy-advanced-token.js --network localhost

# 更新合约地址
# 将输出的合约地址复制到 src/lib/advancedTokenContract.ts 中的 ADVANCED_TOKEN_CONTRACT_ADDRESS 变量
```

访问 `/advanced-token` 路径使用高级代币功能。

## 测试网部署

要部署到以太坊测试网（如 Goerli、Sepolia），请更新 `hardhat.config.cjs` 文件，添加相应的网络配置和私钥。

```javascript
module.exports = {
  // ...
  networks: {
    // ...
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [PRIVATE_KEY]
    }
  }
};
```

然后运行：

```bash
npx hardhat run scripts/deploy-token.js --network goerli
```

## 许可证

MIT
