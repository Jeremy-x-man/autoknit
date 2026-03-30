# autoknit — CMake + Node.js 构建说明

本文档说明如何使用 **CMake** 将 C++ 代码编译为库，并通过 **Node.js** 方式运行 JS 代码。

> **注意**：本项目已将 `kit` 和 `eigen` 从 git submodule 改为直接内嵌代码，克隆后无需执行 `git submodule update`。

---

## 构建架构概览

```
autoknit/
├── CMakeLists.txt          ← 根 CMake 配置
├── libgeodesic/
│   └── CMakeLists.txt      ← libgeodesic 子库 CMake 配置
├── kit/                    ← kit 库代码（直接内嵌，非 submodule）
├── addon.cpp               ← Node.js Native Addon 绑定层
├── index.js                ← Node.js 入口（封装 C++ 接口）
├── test-schedule.js        ← schedule 功能测试脚本
├── gen-test-st.js          ← 生成测试用 .st 文件
└── build/Release/
    └── autoknit_node.node  ← 编译产物（Node.js 可加载的 C++ 扩展）
```

### 编译目标

| 目标 | 类型 | 说明 |
|------|------|------|
| `geodesic` | 静态库 | libgeodesic 测地距离计算库 |
| `autoknit_core` | 静态库 | 所有 C++ 核心逻辑（kit + autoknit + schedule） |
| `autoknit_node` | Node.js 模块（.node） | 通过 N-API 暴露给 JS 的动态扩展 |

---

## 环境依赖

### 系统依赖（apt）

```bash
sudo apt-get install -y \
    cmake build-essential \
    libeigen3-dev \
    libglm-dev \
    libpng-dev \
    zlib1g-dev \
    libgl-dev
```

### SDL3（需从源码编译）

```bash
git clone https://github.com/libsdl-org/SDL.git -b preview-3.1.3
cd SDL && mkdir build && cd build
cmake .. -DBUILD_SHARED_LIBS=ON -DCMAKE_POSITION_INDEPENDENT_CODE=ON
make -j$(nproc) && sudo make install
sudo ldconfig
```

### Node.js 依赖

```bash
npm install
# 自动安装 cmake-js 和 node-addon-api
```

---

## 编译步骤

```bash
cd autoknit

# 1. 安装 Node.js 依赖
npm install

# 2. 使用 cmake-js 编译 C++ 扩展
npm run build
```

编译成功后，产物位于：

```
build/Release/autoknit_node.node
```

---

## Node.js 使用方式

### 引入模块

```js
const autoknit = require('./index.js');
```

### 运行 schedule（.st → .js）

```js
const ret = autoknit.schedule({
    st: 'path/to/input.st',   // 必填：输入针织文件
    js: 'path/to/output.js',  // 可选：输出编织指令 JS 文件
    rack: 3,                  // 可选：最大 racking 值（默认 3）
});
console.log('exit code:', ret); // 0 表示成功
```

### 启动交互界面（需图形环境）

```js
const ret = autoknit.interface({
    obj: 'path/to/model.obj',          // 必填：输入 OBJ 模型
    constraints: 'path/to/cons',       // 可选：约束文件
    saveTraced: 'path/to/output.st',   // 可选：保存追踪结果
    objScale: 10.0,                    // 可选：模型单位（mm/unit）
    stitchWidth: 3.66,                 // 可选：针脚宽度（mm）
    stitchHeight: 1.73,                // 可选：针脚高度（mm）
    peelTest: -1,                      // 可选：自动 peeling 后退出
});
```

---

## 完整工作流（命令行）

```bash
# 1. 运行 autoknit 界面，生成 .st 文件（需图形环境）
node -e "require('./index.js').interface({
    obj: 'model.obj',
    constraints: 'model.cons',
    objScale: 10.0,
    stitchWidth: 3.66,
    stitchHeight: 1.73,
    saveTraced: 'model.st',
    peelTest: -1
})"

# 2. 运行 schedule，将 .st 转换为 .js 编织指令
node test-schedule.js model.st model.js

# 3. 运行生成的 JS 文件，输出 .k knitout 文件
node model.js
```

---

## 测试

```bash
# 生成测试用 .st 文件（12 个针脚的简单管状编织）
node gen-test-st.js test-sample.st

# 运行 schedule 测试
node test-schedule.js test-sample.st test-sample.js

# 运行生成的 JS 编织指令
node test-sample.js
# 输出：test-sample.k（knitout 格式编织指令）
```

---

## 与原始构建方式对比

| 方面 | 原始（Maekfile.js） | 新方案（CMake + Node.js） |
|------|---------------------|--------------------------|
| 构建工具 | 自定义 Maek（Node.js 脚本） | CMake 3.14+ 标准构建系统 |
| 依赖管理 | nest-libs + git submodule | 系统 apt 包（无外部子模块） |
| 输出产物 | 独立可执行文件（`dist/interface`, `dist/schedule`） | Node.js 扩展模块（`autoknit_node.node`） |
| 调用方式 | 命令行子进程 | Node.js `require()` 直接调用 |
| 跨平台 | 需要手动适配 | CMake 自动处理 |
| 集成性 | 独立进程，需要 IPC | 同进程调用，无需序列化 |

---

## 常见问题

**Q: `libSDL3.so.0: cannot open shared object file`**

SDL3 安装后需更新动态链接库缓存：
```bash
sudo ldconfig
```

**Q: `cmake: command not found`**

```bash
sudo apt-get install -y cmake
```

**Q: `node-addon-api` 找不到**

```bash
npm install
```
