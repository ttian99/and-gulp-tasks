# 资源生成说明

## 目录结构
```js
res-origin
|--group
  |--img
    |--sudDir1
  |--tp
    |--sub
  |--font
    |--subDir1
  |--particle
    |--subDir1
  |--audio
    |--subDir1
  |--spine
    |--subDir1
|--res-group.json
```
目录结构说明：
* 目录分为三层
  1. 分组目录
  2. 资源分类目录
  3. 子分组目录(tp是固定放在tp/sub目录下）
* 目前有七种类型的资源，资源必须分门别类的放在目录下
  1. img - 独立图片
  2. tp - texturepacker合图
  3. font - fnt字体
  4. particle - 粒子
  5. audio - 音效
  6. spine - 骨骼
  7. shader - opengl shader
* 基础资源必须放在资源分类的跟目录下（不需要在res-group.json中定义）
* 子分组资源必须放在对应分类的子目录下

## res-group.json
```json
{
  "group": {
    "priority": 0,
    "sub": {
      "sub1": {
        "img": ["dir1/*", "dir2/*"],
        "tp" : ["subTpDir1"...],
        "spine": ["dir1/*"...],
        "audio": ["dir1/*"...],
        "particle": ["dir1/*"...],
        "font": ["dir1/*"...],
        "shader": ["dir1/*"...]
      }
    }
  }
}
```
配置文件说明：
* "group"分组目前只有三个属性
  * priority 用于描述该分组的静态加载优先级，用于runtime和h5，0的优先级最高
  * sub 描述子分组信息，有可能没有
  * noTrimTp ['tpName'], 如果有tp不需要做trim，可开启这个选项
* sub下有可能有多个子分组，也可能一个也没有
* 子分组中的目录相对与对应资源目录的根目录，且只有一层目录结构
* tp 中定义的是文件夹名称

## res-ch.json
如果某些分组或子分组不需要打包到特定渠道中，在这里描述

## resource.js
```js
// 用于上层加载
var res = {
  "group": {
    // img资源
  },
  "tp": {
    // 所有的tp资源
  },
  "spine": {
  },
  "font": {
  },
  "particle": {
  },
  "audio": {
  },
  "shader": {
  }
};

// tp的子图定义
var resIn = {
};

// 用于资源的加载和释放
var resLoad = {
  "group": {},
  "group:sub": {}
}
```

## 加载逻辑
```js
Ltc.loader.load(['group', 'group:sub']);
Ltc.loader.release(['group', 'group:sub']);
```