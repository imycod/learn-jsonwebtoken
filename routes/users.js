const express = require('express');
const router = express.Router();
const {Model} = require("../models")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/server");
const {users: User} = Model

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

    let emailExists = null
    try {
        emailExists = await User.findOne({
            where: {
                email
            }
        });
    } catch (e) {
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
router.post('/login', async function (req, res) {
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

    // ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
    if (req.body.email !== user.email || !bcrypt.compareSync(req.body.password, user.password)) {
        return res.send({status: 1, msg: '????????????'})
    }

    const {username} = req.body
    const tokenStr = jwt.sign({username: username}, config.secretKey, {expiresIn: '1h'})
    res.send({
        status: 200,
        message: '???????????????',
        token: tokenStr, // ???????????????????????? token ?????????
    })
});


module.exports = router;
