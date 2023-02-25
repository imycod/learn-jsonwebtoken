const jwt = require('jsonwebtoken');
const config = require("../config/server");

function auth(req, res, next) {
    if (req.path.startsWith('/users')){
       return next()
    }
    // 获取 JWT，如果不存在则返回错误,这两个字段和前端headers要保持一致
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        // 验证 JWT 的有效性
        const decoded = jwt.verify(token, config.secretKey);

        // 将解密后的用户信息存储在请求对象中
        req.user = decoded;

        // 调用下一个中间件函数
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
}

module.exports = auth
