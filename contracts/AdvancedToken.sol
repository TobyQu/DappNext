// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 导入 OpenZeppelin 的 ERC20 标准合约
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// 导入 Ownable 合约，用于访问控制
import "@openzeppelin/contracts/access/Ownable.sol";
// 导入 ERC20Burnable 合约，提供销毁功能
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

/**
 * @title AdvancedToken
 * @dev 高级 ERC20 代币合约，包含铸造和销毁功能
 * 继承自 ERC20, ERC20Burnable, Ownable
 */
contract AdvancedToken is ERC20, ERC20Burnable, Ownable {
    // 代币的小数位数
    uint8 private _decimals;
    
    // 最大供应量（0 表示无上限）
    uint256 public maxSupply;
    
    // 记录铸造事件
    event TokensMinted(address indexed to, uint256 amount);
    
    // 记录销毁事件
    event TokensBurned(address indexed from, uint256 amount);
    
    /**
     * @dev 构造函数
     * @param name_ 代币名称
     * @param symbol_ 代币符号
     * @param decimals_ 代币小数位数
     * @param initialSupply 初始供应量
     * @param maxTokenSupply 最大供应量（0 表示无上限）
     * @param owner 合约所有者地址
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        uint256 initialSupply,
        uint256 maxTokenSupply,
        address owner
    ) ERC20(name_, symbol_) Ownable(owner) {
        _decimals = decimals_;
        maxSupply = maxTokenSupply;
        
        // 如果初始供应量大于 0，则铸造代币给所有者
        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
    }
    
    /**
     * @dev 覆盖 decimals() 函数，返回自定义的小数位数
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
    
    /**
     * @dev 铸造新代币（只有合约所有者可以调用）
     * @param to 接收新代币的地址
     * @param amount 铸造的代币数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        // 检查是否设置了最大供应量且铸造后不会超过最大供应量
        if (maxSupply > 0) {
            require(totalSupply() + amount <= maxSupply, "Exceeds maximum supply");
        }
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev 销毁自己的代币（覆盖 ERC20Burnable 的 burn 函数，添加事件）
     * @param amount 要销毁的代币数量
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(_msgSender(), amount);
    }
    
    /**
     * @dev 从指定地址销毁代币（覆盖 ERC20Burnable 的 burnFrom 函数，添加事件）
     * @param account 要从中销毁代币的地址
     * @param amount 要销毁的代币数量
     */
    function burnFrom(address account, uint256 amount) public override {
        super.burnFrom(account, amount);
        emit TokensBurned(account, amount);
    }
    
    /**
     * @dev 更新最大供应量（只有合约所有者可以调用）
     * @param newMaxSupply 新的最大供应量（0 表示无上限）
     */
    function setMaxSupply(uint256 newMaxSupply) public onlyOwner {
        // 如果设置了新的上限，确保不低于当前供应量
        if (newMaxSupply > 0) {
            require(newMaxSupply >= totalSupply(), "New max supply cannot be less than current supply");
        }
        
        maxSupply = newMaxSupply;
    }
} 