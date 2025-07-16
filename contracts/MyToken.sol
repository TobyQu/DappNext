// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 导入 OpenZeppelin 的 ERC20 标准合约
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// MyToken 合约，继承自 ERC20
contract MyToken is ERC20 {
    // 构造函数，部署时执行
    // initialSupply: 初始发行量（单位为最小单位，比如 1 ether = 10^18 wei）
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        // 给部署者地址铸造 initialSupply 数量的代币
        _mint(msg.sender, initialSupply);
    }
} 