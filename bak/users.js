const express = require('express');
const router = express.Router();
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken')
const Redis = require('ioredis');
const config = require("../config/server.js")
const {Model} = require("../models")
const {users: User} = Model
const redisClient = new Redis({
    port: 6379,          // Redis服务器端口号
    host: 'localhost',   // Redis服务器IP地址
    password: 'rWXS19971222',  // Redis服务器密码
    db: 0                // Redis默认数据库编号
}); // 创建 Redis 客户端实例

redisClient.on('connect', () => {
    console.log('Redis连接成功');
});

redisClient.on('error', (err) => {
    console.error('Redis连接失败:', err);
});

/* GET users listing. */
router.post('/registry', async function (req, res) {
    const {username, password, email} = req.body;
    console.log('req.body--------->', req.body)
    if (!username || !password || !email) {
        return res.status(400).send({
            message: "You need to include a username and password and email create a user"
        });
    }

    let usernameExists = null
    try {
        usernameExists = await User.findOne({
            where: {
                name: username
            }
        });
    } catch (e) {
        console.log('app----->create user username:', e.message)
    }

    if (usernameExists) {
        return res.status(400).send({
            message: `A user with the username ${username} already exists`
        })
    }

    let emailExists=null
    try{
        emailExists = await User.findOne({
            where: {
                email
            }
        });
    }catch (e) {
        console.log('app----->create user email:', e.message)
    }

    if (emailExists) {
        return res.status(400).send({
            message: `A user with the username ${email} already exists`
        })
    }

    try {
        let newUser = await User.create({
            name: username,
            email,
            password: bcrypt.hashSync(password, 10),
        });
        return res.send(newUser);
    } catch (e) {
        return res.status(500).send({
            message: `Error: ${e.message}`
        });
    }
});

async function login(req, res) {
    // token 已经被注销，拒绝访问
    const {email} = req.body;
    if (!email) {
        return res.status(400).send({
            message: "You need to include a email find a user"
        });
    }

    const user = await User.findOne({
        where: {
            email
        }
    });

    if (!user) {
        return res.status(400).send({
            message: `No user found with the email ${email}`
        })
    }

    // 判断用户提交的登录信息是否正确，此处写死一个账号密码校验，在实际开发中肯定是需要数据库匹配。
    if (req.body.email !== user.email || !bcrypt.compareSync(req.body.password, user.password)) {
        return res.send({status: 1, msg: '登录失败'})
    }

    const {username} = req.body
    const tokenStr = jwt.sign({username: username}, config.secretKey, {expiresIn: '3000s'})
    res.send({
        status: 200,
        message: '登录成功！',
        token: tokenStr, // 要发送给客户端的 token 字符串
    })

}

router.post('/login', async function (req, res) {
    // 从请求中获取 token
    const token = req.headers.authorization.split(' ')[1];
    // 检查 token 是否在 Redis 黑名单中
    redisClient.get(`token:${token}`, (err, result) => {
        if (err) {
            // 处理错误
            login(req, res)
        } else if (result === '1') {
            // token 已经被注销，拒绝访问, 重新能录
            login(req, res)
        } else {
            // token 有效，允许访问
            res.send({
                status: 200,
                message: '登录成功！',
                token: token, // 要发送给客户端的 token 字符串
            })
        }
    });
});

router.get('/logout', function (req, res) {
    // 从请求中获取 token
    const token = req.headers.authorization.split(' ')[1];
    // 将 token 加入黑名单
    redisClient.set(`token:${token}`, '1', 'EX', 3600);
});


module.exports = router;
