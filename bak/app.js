const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const usersRouter = require('./routes/users');
const expressjwt = require('express-jwt')
const config = require("./config/server.js")
const bcrypt = require("bcryptjs");
const {Model} = require("./models")
const jwt = require("jsonwebtoken");
const {users: User} = Model

var app = express();
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     next();
// });
app.use(cors())
app.use(expressjwt({secret: config.secretKey}).unless({path: [/^\/registry/, /^\/login/,/^\/$/]}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);

app.post('/registry', async function (req, res) {
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
app.post('/login', async function (req, res) {
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
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // 这次错误是由 token 解析失败导致的
    if (err.name === 'UnauthorizedError') {
        return res.send({
            status: 401,
            message: '无效的token',
        })
    }
    res.send({
        code: err.status || 500,
        result: 'error'
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})
