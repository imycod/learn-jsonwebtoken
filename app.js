const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors')
const usersRouter = require('./routes/users');
const expressjwt = require('express-jwt')
const config = require("./config/server.js")
const auth = require("./utils/auth.js")
const {Model} = require("./models.js")
const {users: User} = Model

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors())
app.use(expressjwt({secret: config.secretKey}).unless({path: [/^\/users\/.*$/]}))
// app.use(auth);
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.get('/test',async (req,res)=>{
    const token = req.header('Authorization');
    console.log(token)
    res.send({
        status: 200,
        message: '测试成功',
    })
})

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    // // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // 这次错误是由 token 解析失败导致的
    /**
     * token解析错误
     * token过期
     * token没携带
     */
    if (err.name === 'UnauthorizedError') {
        return res.send({
            status: 401,
            message: '无效的token,请重新能录',
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
