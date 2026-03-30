'use strict';

/**
 * autoknit Node.js 入口
 *
 * 通过 CMake 编译的 C++ Native Addon 暴露两个核心功能：
 *   - schedule(args): 将 .st 针织文件转换为 .js 编织指令
 *   - interface(args): 启动带 GUI 的交互式界面（需要图形环境）
 */

const path = require('path');
const addon = require(path.join(__dirname, 'build', 'Release', 'autoknit_node.node'));

/**
 * 运行 schedule 程序
 * @param {Object} opts - 参数选项
 * @param {string} opts.st   - 输入 .st 针织文件路径（必填）
 * @param {string} [opts.js] - 输出 .js 编织指令文件路径
 * @param {string} [opts.outSt] - 输出 .st 文件路径
 * @param {number} [opts.rack=3] - 最大 racking 值
 * @returns {number} 返回码（0 表示成功）
 */
function schedule(opts) {
    if (!opts || !opts.st) {
        throw new Error("schedule: 'st' (input stitches file) is required");
    }

    const args = [];
    args.push('st:' + opts.st);
    if (opts.js)    args.push('js:' + opts.js);
    if (opts.outSt) args.push('out-st:' + opts.outSt);
    if (opts.rack !== undefined) args.push('rack:' + opts.rack);

    return addon.schedule(args);
}

/**
 * 启动 autoknit 交互式界面（需要图形环境）
 * @param {Object} opts - 参数选项
 * @param {string} opts.obj  - 输入 .obj 模型文件路径（必填）
 * @param {string} [opts.constraints]      - 约束文件路径（加载并保存）
 * @param {string} [opts.loadConstraints]  - 加载约束文件路径
 * @param {string} [opts.saveConstraints]  - 保存约束文件路径
 * @param {string} [opts.saveTraced]       - 保存追踪结果文件路径
 * @param {string} [opts.loadTraced]       - 加载追踪结果文件路径
 * @param {number} [opts.objScale]         - obj 模型单位（mm）
 * @param {number} [opts.stitchWidth]      - 针脚宽度（mm）
 * @param {number} [opts.stitchHeight]     - 针脚高度（mm）
 * @param {number} [opts.peelTest]         - 运行 N 轮 peeling 后退出
 * @param {number} [opts.peelStep]         - 运行 N 轮 peeling 后显示界面
 * @returns {number} 返回码（0 表示成功）
 */
function runInterface(opts) {
    if (!opts || !opts.obj) {
        throw new Error("interface: 'obj' (input obj file) is required");
    }

    const args = [];
    args.push('obj:' + opts.obj);
    if (opts.objScale !== undefined)    args.push('obj-scale:' + opts.objScale);
    if (opts.constraints)               args.push('constraints:' + opts.constraints);
    if (opts.loadConstraints)           args.push('load-constraints:' + opts.loadConstraints);
    if (opts.saveConstraints)           args.push('save-constraints:' + opts.saveConstraints);
    if (opts.saveTraced)                args.push('save-traced:' + opts.saveTraced);
    if (opts.loadTraced)                args.push('load-traced:' + opts.loadTraced);
    if (opts.stitchWidth !== undefined) args.push('stitch-width:' + opts.stitchWidth);
    if (opts.stitchHeight !== undefined) args.push('stitch-height:' + opts.stitchHeight);
    if (opts.peelTest !== undefined)    args.push('peel-test:' + opts.peelTest);
    if (opts.peelStep !== undefined)    args.push('peel-step:' + opts.peelStep);

    return addon.interface(args);
}

module.exports = {
    schedule,
    interface: runInterface,
    // 直接暴露底层 addon（高级用法）
    _addon: addon,
};
