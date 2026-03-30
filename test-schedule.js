'use strict';

/**
 * test-schedule.js
 *
 * 测试 schedule 功能：将 .st 针织文件转换为 .js 编织指令
 * 用法：node test-schedule.js <input.st> [output.js]
 */

const path = require('path');
const fs   = require('fs');
const autoknit = require('./index.js');

const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Usage: node test-schedule.js <input.st> [output.js]');
    process.exit(1);
}

const stFile  = path.resolve(args[0]);
const jsFile  = args[1] ? path.resolve(args[1]) : stFile.replace(/\.st$/, '.js');

if (!fs.existsSync(stFile)) {
    console.error(`ERROR: input file not found: ${stFile}`);
    process.exit(1);
}

console.log(`Running schedule:`);
console.log(`  Input  .st : ${stFile}`);
console.log(`  Output .js : ${jsFile}`);

try {
    const ret = autoknit.schedule({
        st: stFile,
        js: jsFile,
    });
    if (ret === 0) {
        console.log(`\nschedule completed successfully (return code: ${ret})`);
        if (fs.existsSync(jsFile)) {
            const size = fs.statSync(jsFile).size;
            console.log(`Output file written: ${jsFile} (${size} bytes)`);
        }
    } else {
        console.error(`\nschedule returned non-zero exit code: ${ret}`);
        process.exit(ret);
    }
} catch (e) {
    console.error(`\nERROR: ${e.message}`);
    process.exit(1);
}
