# 在web3下的游戏珍藏链
这是一个基于web3的游戏珍藏链，用户可以在链上收藏自己的游戏，也可以查看其他用户收藏的游戏。也可以简单玩游戏。

## Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

## 部署合约代码到ganache
```shell
会使用到 hardhat.config.js里面的配置 和 scripts/deploy.js脚本
npx hardhat run scripts/deploy.js --network ganache
```

## 编译合约
```shell
npx hardhat compile
```

## 部署到github pages时空白页面
* 修改vite.config.js 添加 base: '/web3-game/',

## github page默认是 / 或者 /docs 目录，编译时默认放到/docs下，在vite.config.js中添加
```shell
build: {
    outDir: '../docs', // 默认是 dist，可修改为自定义路径（如 'build'、'public' 等）
  },
```
## 在线合约调试
https://remix.ethereum.org/