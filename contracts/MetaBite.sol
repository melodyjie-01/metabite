// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MetaBite 赛博幽灵食堂
/// @notice 把每一顿饭的卡路里变成链上幽灵的投喂经验。
/// @dev Monad Blitz @广州 2026-11-21 当天编写；设计沿用《区块链逻辑架构》文档。
///      等级不存储、按经验现算（派生数据只留一份真相）；
///      每顿饭开一张永久收据（Feast 事件），历史时间线不用改合约就能做；
///      Feast struct 字段连续排布，天然享受 Monad MIP-8 存储页预热。
contract MetaBite {
    /// @notice 单顿卡路里上限，防一次喂爆或误输入
    uint256 public constant MAX_KCAL_PER_MEAL = 5000;

    /// @notice Lv.2~5 的经验门槛；下标 0 即 Lv.1，无门槛
    uint256[4] private LEVEL_THRESHOLDS = [1_000, 5_000, 20_000, 100_000];

    struct Eater {
        uint256 totalKcal; // 累计投喂经验
        uint32 meals;      // 投喂次数（一顿 +1，uint32 约 42 亿顿，足够）
    }

    /// @notice 每个钱包地址公开可查的干饭档案
    mapping(address => Eater) public eaters;

    /// @notice 投喂收据：谁、喂了多少、累计多少、第几顿、何时
    event Feast(
        address indexed diner,
        uint256 kcal,
        uint256 newTotalKcal,
        uint256 mealIndex,
        uint256 timestamp
    );

    error EmptyMeal();
    error MealTooLarge(uint256 provided, uint256 cap);

    /// @notice 投喂一顿饭。钱包签名即本人同意，合约只按规矩记账。
    function feed(uint256 kcal) external {
        if (kcal == 0) revert EmptyMeal();
        if (kcal > MAX_KCAL_PER_MEAL) revert MealTooLarge(kcal, MAX_KCAL_PER_MEAL);

        Eater storage e = eaters[msg.sender];
        e.totalKcal += kcal;
        e.meals += 1;

        emit Feast(msg.sender, kcal, e.totalKcal, e.meals, block.timestamp);
    }

    /// @notice 等级纯推导：饿饿鬼→干饭鬼→大胃王→暴食魔王→宇宙级饭桶
    function levelOf(address diner) public view returns (uint8) {
        uint256 kcal = eaters[diner].totalKcal;
        for (uint8 i = 0; i < LEVEL_THRESHOLDS.length; i++) {
            if (kcal < LEVEL_THRESHOLDS[i]) return i + 1;
        }
        return 5;
    }

    /// @notice 聚合读接口：一次拿回 (累计kcal, 投喂次数, 等级)，前端一次调用刷新全部
    function stats(address diner) external view returns (uint256 totalKcal, uint256 meals, uint8 level) {
        Eater storage e = eaters[diner];
        return (e.totalKcal, e.meals, levelOf(diner));
    }
}