# Next.js DApp - Todo应用

这是一个基于Next.js和Web3技术构建的去中心化Todo应用。用户可以通过连接钱包来发布消息并管理合约资金。

## 功能

- 钱包连接与认证
- 智能合约部署（浏览器内直接部署）
- 发布消息（需支付ETH）
- 查看消息列表
- 合约余额查看与提款（仅合约拥有者）

## 技术栈

- Next.js 15
- React 19
- Ethers.js 5.7
- Hardhat (智能合约开发框架)
- Solidity 0.8.19 (智能合约语言)
- RainbowKit & wagmi (钱包连接)
- Shadcn/UI (组件库)
- Tailwind CSS (样式)

## 快速开始

### 环境配置

1. 复制环境变量示例文件
```bash
cp .env.example .env.local
```

2. 修改`.env.local`文件，配置以下环境变量：

```
# 合约配置
NEXT_PUBLIC_CONTRACT_ADDRESS=你的合约地址
NEXT_PUBLIC_IS_CONTRACT_DEPLOYED=true或false

# 网络配置（可选）
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_NETWORK_NAME=Ethereum Mainnet
```

### 安装依赖

```bash
yarn install
```

### 开发环境运行

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
yarn start
```

## 部署合约

有两种方式可以部署合约：

### 1. 使用浏览器内部署

应用内置了合约部署功能，只需连接钱包，点击"部署合约"按钮即可。部署后会自动存储合约地址并启用合约功能。

### 2. 使用Hardhat部署

如果需要在本地开发环境或测试网络上部署合约，可以使用以下命令：

```bash
# 启动本地开发节点
yarn node

# 部署到本地节点
yarn deploy:local

# 部署到Goerli测试网
yarn deploy:goerli
```

部署成功后，会自动更新`.env.local`文件中的合约地址和部署状态。

### 合约源码

合约源码位于`contracts/TodoContract.sol`，主要功能包括：

- 发布消息（需支付0.1 ETH）
- 查询消息列表
- 查询合约余额
- 提取合约资金（仅合约拥有者）

## 项目结构

- `contracts/` - 智能合约源码
  - `TodoContract.sol` - Todo合约
- `scripts/` - 部署脚本
  - `deploy.ts` - 合约部署脚本
  - `updateBytecode.ts` - 字节码更新脚本
- `src/components/` - React组件
  - `ui/` - Shadcn UI组件
  - `Todo.tsx` - 主应用组件
  - `TodoHeader.tsx` - 头部组件
  - `TodoForm.tsx` - 消息发布表单
  - `TodoList.tsx` - 消息列表
  - `DeployContract.tsx` - 合约部署组件
- `src/lib/` - 工具函数和配置
  - `contract.ts` - 合约ABI和基础功能
  - `contractUtils.ts` - 合约部署和管理工具
  - `config.ts` - 应用配置
- `public/` - 静态资源
- `hardhat.config.ts` - Hardhat配置文件

## 许可证

MIT
