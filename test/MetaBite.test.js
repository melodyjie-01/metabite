// MetaBite 单元测试 · Monad Blitz @广州 2026-11-21 当天编写
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MetaBite 赛博幽灵食堂", function () {
  let metabite;
  let alice;
  let bob;

  beforeEach(async function () {
    [alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MetaBite");
    metabite = await Factory.deploy();
    await metabite.waitForDeployment();
  });

  it("投喂一次：经验、次数、收据事件都正确", async function () {
    await expect(metabite.connect(alice).feed(650))
      .to.emit(metabite, "Feast")
      .withArgs(alice.address, 650, 650, 1, (v) => v > 0);

    const [kcal, meals, level] = await metabite.stats(alice.address);
    expect(kcal).to.equal(650);
    expect(meals).to.equal(1);
    expect(level).to.equal(1);
  });

  it("多次投喂：经验累加、收据带累计值与顿数序号", async function () {
    await metabite.connect(alice).feed(600);
    await expect(metabite.connect(alice).feed(400))
      .to.emit(metabite, "Feast")
      .withArgs(alice.address, 400, 1000, 2, (v) => v > 0);

    const [kcal, meals, level] = await metabite.stats(alice.address);
    expect(kcal).to.equal(1000);
    expect(meals).to.equal(2);
    expect(level).to.equal(2); // 到 1000 升 Lv.2
  });

  it("等级门槛：1000/5000/20000/100000 恰好升级", async function () {
    const cases = [
      [999, 1],
      [1000, 2],
      [4999, 2],
      [5000, 3],
      [19999, 3],
      [20000, 4],
      [99999, 4],
      [100000, 5],
    ];
    for (const [target, level] of cases) {
      const Factory = await ethers.getContractFactory("MetaBite");
      const fresh = await Factory.deploy();
      await fresh.waitForDeployment();
      // 用若干顿合法投喂凑到目标值（单顿上限 5000）
      let left = target;
      while (left > 0) {
        const bite = Math.min(left, 5000);
        await fresh.connect(bob).feed(bite);
        left -= bite;
      }
      expect(await fresh.levelOf(bob.address)).to.equal(level);
    }
  });

  it("边界：空饭与超大饭都被拒绝", async function () {
    await expect(metabite.feed(0)).to.be.revertedWithCustomError(metabite, "EmptyMeal");
    await expect(metabite.feed(5001)).to.be.revertedWithCustomError(metabite, "MealTooLarge");
    await expect(metabite.feed(5000)).to.emit(metabite, "Feast"); // 上限本身合法
  });

  it("隔离：别人的投喂不影响我的档案", async function () {
    await metabite.connect(alice).feed(650);
    const [kcal, meals, level] = await metabite.stats(bob.address);
    expect(kcal).to.equal(0);
    expect(meals).to.equal(0);
    expect(level).to.equal(1);
  });
});