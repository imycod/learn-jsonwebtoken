'use strict';
const child_process = require('child_process');
const env = process.env.NODE_ENV || 'development';
const {databases} = require(__dirname + '/config/db.js')[env];
const { exec } = child_process;
const modelName = process.argv[2];
const database = {
    // [required] * 数据库地址
    host: databases.host,
    // [required] * 数据库名称
    database: databases.database,
    // 数据库用户名
    user: databases.username,
    // 数据库密码
    pass: databases.password,
    // 数据库端口号
    port: databases.port,
    // Sequelize的构造函数“options”标记对象的JSON文件路径
    config: '',
    // 输出文件路径
    output: './models',
    // 数据库类型：postgres, mysql, sqlite
    dialect: databases.dialect,
    // 包含在model的配置参数中define的模型定义的JSON文件路径
    additional: '',
    // 表名,多个表名逗号分隔
    tables: modelName || '',
    // 要跳过的表名，多个表名逗号分隔
    'skip-tables': '',
    // 使用驼峰命名模型和字段
    camel: true,
    // 是否写入文件
    'no-write': false,
    // 从中检索表的数据库架构
    schema: false,
    // 将模型输出为typescript文件
    typescript: false,
    // 指定是否将数据库表名和字段名转换为下划线命名法
    // underscored: false,
    // 关闭生成的model有timestamps字段
    'no-timestamps':false,
};

let connectShell = 'npx sequelize-auto';
for (const i in database) {
    const value = database[i];
    if (value) {
        if (value === true) {
            connectShell += ` --${i}`;
        } else {
            connectShell += ` --${i} ${value}`;
        }
    }
}
exec(connectShell, (err, stdout, stderr) => {
    console.log(`connectShell: ${connectShell}`)
    console.log(`stderr: ${stderr}`);
    console.log(`stdout: ${stdout}`);
    if (err) {
        console.log(`exec error: ${err}`);
    }
});
