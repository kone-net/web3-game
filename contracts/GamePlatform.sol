// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GamePlatform {
    // 游戏ID枚举
    enum GameType {
        Game2048,
        FrogGame
    }
    
    // 游戏记录结构体
    struct GameRecord {
        uint256 highScore;   // 游戏最高分
        uint256 totalScore;  // 游戏总积分
        uint256 playCount;   // 游戏次数
        uint256 lastPlayed;  // 最后游玩时间
    }
    
    // 用户统计结构体
    struct UserStats {
        uint256 totalGamesPlayed;  // 总游戏次数
        uint256 totalScore;        // 总积分
        uint256 level;             // 用户等级
    }
    
    // 映射：用户地址 => 游戏类型 => 游戏记录
    mapping(address => mapping(GameType => GameRecord)) private _userGameRecords;
    
    // 映射：用户地址 => 用户统计
    mapping(address => UserStats) private _userStats;
    
    // 映射：用户地址 => 已玩游戏列表
    mapping(address => mapping(GameType => bool)) private _playedGames;
    
    // 已玩游戏数组（用于高效查询）
    mapping(address => GameType[]) private _userGames;
    
    // 事件：记录游戏成绩更新
    event GameScoreUpdated(
        address indexed user,
        GameType gameType,
        uint256 score,
        bool isNewHighScore
    );
    
    // 事件：记录用户等级提升
    event UserLevelUp(address indexed user, uint256 newLevel);
    
    // 更新游戏成绩
    function updateGameScore(GameType gameType, uint256 score) external {
        address user = msg.sender;
        bool isNewHighScore = false;
        
        // 更新游戏记录
        if (score > _userGameRecords[user][gameType].highScore) {
            _userGameRecords[user][gameType].highScore = score;
            isNewHighScore = true;
        }
        
        _userGameRecords[user][gameType].totalScore += score;
        _userGameRecords[user][gameType].playCount += 1;
        _userGameRecords[user][gameType].lastPlayed = block.timestamp;
        
        // 如果是第一次玩这个游戏，添加到已玩游戏列表
        if (!_playedGames[user][gameType]) {
            _playedGames[user][gameType] = true;
            _userGames[user].push(gameType);
        }
        
        // 更新用户统计
        _userStats[user].totalGamesPlayed += 1;
        _userStats[user].totalScore += score;
        
        // 检查并更新等级（每1000分升一级）
        uint256 newLevel = _userStats[user].totalScore / 1000 + 1;
        if (newLevel > _userStats[user].level) {
            _userStats[user].level = newLevel;
            emit UserLevelUp(user, newLevel);
        }
        
        emit GameScoreUpdated(user, gameType, score, isNewHighScore);
    }
    
    // 获取用户游戏记录
    function getUserGameRecord(address user, GameType gameType) external view returns (
        uint256 highScore,
        uint256 totalScore,
        uint256 playCount,
        uint256 lastPlayed
    ) {
        GameRecord storage record = _userGameRecords[user][gameType];
        return (
            record.highScore,
            record.totalScore,
            record.playCount,
            record.lastPlayed
        );
    }
    
    // 获取用户统计信息
    function getUserStats(address user) external view returns (
        uint256 totalGamesPlayed,
        uint256 totalScore,
        uint256 level
    ) {
        UserStats storage stats = _userStats[user];
        return (
            stats.totalGamesPlayed,
            stats.totalScore,
            stats.level
        );
    }
    
    // 获取用户已玩游戏列表
    function getUserGames(address user) external view returns (GameType[] memory) {
        return _userGames[user];
    }
    
    // 获取指定用户的游戏记录（公开查询）
    function getPublicGameRecord(address user, GameType gameType) external view returns (
        uint256 highScore,
        uint256 totalScore,
        uint256 playCount
    ) {
        GameRecord storage record = _userGameRecords[user][gameType];
        return (
            record.highScore,
            record.totalScore,
            record.playCount
        );
    }
}