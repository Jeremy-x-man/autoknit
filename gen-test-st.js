'use strict';

/**
 * gen-test-st.js
 *
 * 生成一个最小化的合法 .st 文件，用于测试 schedule 功能。
 * .st 文件格式（每行一个 stitch）：
 *   yarn type direction in[0] in[1] out[0] out[1] at.x at.y at.z
 *
 * Stitch type 说明（来自 Stitch.hpp）：
 *   Knit=0, Tuck=1, Miss=2
 * Direction 说明：
 *   CW=0 (clockwise), CCW=1 (counter-clockwise)
 * in/out 值：-1 (4294967295) 表示无连接
 *
 * 这里生成一个简单的 4 针单排管状编织测试用例。
 */

const fs = require('fs');
const path = require('path');

const outFile = process.argv[2] || path.join(__dirname, 'test-sample.st');

// 生成一个简单的线性针织序列
// 格式: yarn type dir in0 in1 out0 out1 x y z
// type: 's'=Start, 'e'=End, 'k'=Knit, 't'=Tuck, 'm'=Miss, 'i'=Increase, 'd'=Decrease
// dir:  'c'=CW(Clockwise), 'a'=AC(Anticlockwise)
// -1 用 -1 表示（load_stitches 读取为 int32_t）
const NONE = -1;

const stitches = [];

// 创建 4 个起始针脚（无 in，有 out 指向下一排）
// 排 0: 针脚 0-3（起始行，in=-1，type='s'）
for (let i = 0; i < 4; i++) {
    stitches.push({
        yarn: 1,
        type: 's',   // Start
        dir: 'c',    // CW
        in0: NONE,
        in1: NONE,
        out0: 4 + i,
        out1: NONE,
        x: i * 1.0,
        y: 0.0,
        z: 0.0,
    });
}

// 排 1: 针脚 4-7（中间行，in 指向上一排，out 指向下一排，type='k'）
for (let i = 0; i < 4; i++) {
    stitches.push({
        yarn: 1,
        type: 'k',   // Knit
        dir: 'c',    // CW
        in0: i,
        in1: NONE,
        out0: 8 + i,
        out1: NONE,
        x: i * 1.0,
        y: 1.0,
        z: 0.0,
    });
}

// 排 2: 针脚 8-11（结束行，in 指向上一排，out=-1，type='e'）
for (let i = 0; i < 4; i++) {
    stitches.push({
        yarn: 1,
        type: 'e',   // End
        dir: 'c',    // CW
        in0: 4 + i,
        in1: NONE,
        out0: NONE,
        out1: NONE,
        x: i * 1.0,
        y: 2.0,
        z: 0.0,
    });
}

// 写出 .st 文件
const lines = stitches.map(s =>
    `${s.yarn} ${s.type} ${s.dir} ${s.in0} ${s.in1} ${s.out0} ${s.out1} ${s.x} ${s.y} ${s.z}`
);

fs.writeFileSync(outFile, lines.join('\n') + '\n');
console.log(`Generated test .st file: ${outFile} (${stitches.length} stitches)`);
