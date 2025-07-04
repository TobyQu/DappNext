// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TodoContract {
    // 定义Todo结构
    struct Todo {
        uint256 id;
        address author;
        string message;
        uint256 timestamp;
    }

    // 状态变量
    address payable public owner;
    uint256 public todoID;
    Todo[] public todoList;

    // 事件
    event NewTodo(uint256 todoID, address indexed from, string message, uint256 timestamp);
    event SendMoneyToContract(uint256 todoID, address receiver, string message, uint256 timestamp);

    // 构造函数
    constructor() payable {
        owner = payable(msg.sender);
    }

    // 发布新的Todo，需要支付一定的ETH
    function published(string memory _message) public payable {
        require(msg.value >= 0.1 ether, "Need to pay 0.1 ETH or more to publish");
        require(bytes(_message).length > 0, "Message cannot be empty");

        todoList.push(Todo({
            id: todoID,
            author: msg.sender,
            message: _message,
            timestamp: block.timestamp
        }));

        emit NewTodo(todoID, msg.sender, _message, block.timestamp);
        emit SendMoneyToContract(todoID, address(this), _message, block.timestamp);
        
        todoID++;
    }

    // 获取合约余额
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // 获取Todo列表
    function getTodoList() public view returns (Todo[] memory) {
        return todoList;
    }

    // 只有合约所有者可以提款
    function withdraw() public payable {
        require(msg.sender == owner, "Only owner can withdraw");
        owner.transfer(address(this).balance);
    }

    // 接收ETH
    receive() external payable {}
} 