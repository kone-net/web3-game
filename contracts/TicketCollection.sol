// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TicketCollection {
    // 例如，一个映射来存储用户的车票（字符串链接格式）
    mapping(address => string[]) private tickets;
    string[] private publicUrls;

    // 函数来添加车票到用户的收藏
    function addTicket(string calldata ticketUrl) public {
        tickets[msg.sender].push(ticketUrl);
    }

    // 函数来获取用户的车票
    function getTickets() public view returns (string[] memory) {
        return tickets[msg.sender];
    }

    function addUrl(string calldata url) public {
        // 使用 push() 方法添加新字符串
        publicUrls.push(url);
    }

    function getAllUrls() public view returns (string[] memory) {
        return publicUrls;
    }
}