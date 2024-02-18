const jwt = require('jsonwebtoken');
const { connection } = require("../database/database");
const bcrypt = require('bcrypt');
const moment = require('moment'); 

const auth = async (req, res, next) => {
try{
    

const token = req.header("x-auth-token");
if(!token || token === ""){
    return res.status(401).json({error: "Lütfen tekrar giriş yapınız.", code: "INVALID_TOKEN"});
} 
const verified = jwt.verify(token, "passwordKey");
if(!verified){
    return res.status(401).json({error: "Lütfen tekrar giriş yapınız.", code: "INVALID_TOKEN"});
} 
    const phoneCheckQuery = 'SELECT password, passwordtry FROM user WHERE phone = ?';
const [phoneCheckResult] = await connection.promise().query(phoneCheckQuery, [verified.phone]);
 
if (phoneCheckResult.length === 0) {
    return res.status(401).json({ "error": "Lütfen tekrar giriş yapınız.", code: "INVALID_TOKEN" });
}

if (phoneCheckResult[0].passwordtry >= 3) {
    return res.status(401).json({ "error": "Lütfen tekrar giriş yapınız.", code: "INVALID_TOKEN" });
}
const isMatch = await bcrypt.compare(verified.password, phoneCheckResult[0].password);

if (!isMatch) {
    const passTryQuery = 'UPDATE user SET passwordtry = ? WHERE phone = ?';
    await connection.promise().query(passTryQuery, [phoneCheckResult[0].passwordtry + 1, phone]);
    return res.status(401).json({ "error": "Lütfen tekrar giriş yapınız.", code: "INVALID_TOKEN" });
}
const currentTime = moment();
const loginTime = moment(verified.time);
const diffInMinutes = currentTime.diff(loginTime, 'minutes');
if (diffInMinutes > 60) {
    return res.status(408).json({ message: 'Oturum Süreniz doldu. Lütfen giriş yapınız.', code: "TOKEN_EXPIRED" });
  }
    req.id = verified.id;
    req.phone= verified.phone;
    req.password = verified.password;
    req.token = token;
    next();
}catch (err){
    console.log(err);
    res.status(500).json({error: err.message});
}
}
 
module.exports = auth; 