const express = require('express');
const { connection } = require("../database/database");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require("../middlewares/auth");
const moment = require('moment'); 

const userRouter = express.Router();


userRouter.get('/', auth, async (req, res) => {
    const userQuery = "SELECT * FROM user WHERE id = ?";
    const [userCheckResult] = await connection.promise().query(userQuery, req.id);

    res.json({"user": userCheckResult[0], token: req.token});
}); 

module.exports = userRouter;
