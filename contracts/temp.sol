// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GameStats {
    // 结构体：存储用户的等级和总积分
    struct UserStats {
        uint256 level;      // 用户等级
        uint256 totalScore; // 累计游戏积分
    }

    // 映射：地址 => 用户数据
    mapping(address => UserStats) private _userStats;

    // 事件：记录用户数据更新
    event UserStatsUpdated(
        address indexed user,
        uint256 newLevel,
        uint256 newTotalScore
    );

    // 修饰器：限制只有用户自己能更新数据（可选）
    modifier onlySelf() {
        require(msg.sender == msg.sender, "Not authorized"); // 简化的自我验证
        _;
    }

    /// @notice 更新用户的等级和积分
    /// @param newLevel 新等级
    /// @param scoreIncrement 本次增加的积分（非总积分）
    function updateUserStats(uint256 newLevel, uint256 scoreIncrement) external {
        _userStats[msg.sender].level = newLevel;
        _userStats[msg.sender].totalScore += scoreIncrement;

        emit UserStatsUpdated(
            msg.sender,
            newLevel,
            _userStats[msg.sender].totalScore
        );
    }

    /// @notice 查询用户的等级和总积分
    /// @param user 目标用户地址
    /// @return level 用户等级
    /// @return totalScore 总积分
    function getUserStats(address user) external view returns (uint256 level, uint256 totalScore) {
        return (_userStats[user].level, _userStats[user].totalScore);
    }

    /// @notice 查询调用者自己的数据（节省 gas）
    function getMyStats() external view returns (uint256 level, uint256 totalScore) {
        return (_userStats[msg.sender].level, _userStats[msg.sender].totalScore);
    }
}