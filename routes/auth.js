// auth.js
const express = require('express');
const { connection } = require("../database/database");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require("../middlewares/auth");
const moment = require('moment'); 
const mail = require('../mail/mail');
const mailTemplates = require('../mail/templates');
const firebaseAuth = require('../database/firebase');


const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        const {id, name, surname, email, hashedPassword, phone, tckn, birthday, serial, validUntil} = req.body;

        if (!id || !name || !surname || !email || !hashedPassword || !phone || !tckn || !birthday || !serial || !validUntil) {
            return res.status(400).json({ "error": "Gönderilen veriler eksik veya yanlış." });
        }
        console.log(id);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ "error": "E-mail yanlış formatta." });
        }

        if(hashedPassword.length != 6){
            return res.status(400).json({ "error": "Şifre 6 haneli olmalıdır." });
        }

        if(phone.length != 12){
            return res.status(400).json({ "error": "Telefon numarası yanlış formatta." });
        }
const tcRegex = /^[1-9][0-9]{9}[02468]$/;
        if(!tcRegex.test(tckn)){
            return res.status(400).json({ "error": "TCKN yanlış formatta." });
        }

    
        // E-posta (email) kontrolü
        const emailCheckQuery = 'SELECT * FROM user WHERE email = ?';
        const [emailCheckResult] = await connection.promise().query(emailCheckQuery, [email]);

        if (emailCheckResult.length > 0) {
            return res.status(400).json({ "error": "Bu e-posta adresi zaten kullanılıyor." });
        }

        // Telefon (phone) kontrolü
        const phoneCheckQuery = 'SELECT * FROM user WHERE phone = ?';
        const [phoneCheckResult] = await connection.promise().query(phoneCheckQuery, [phone]);

        if (phoneCheckResult.length > 0) {
            return res.status(400).json({ "error": "Bu telefon numarası zaten kullanılıyor." });
        }

        // TCKN kontrolü
        const tcknCheckQuery = 'SELECT * FROM user WHERE tckn = ?';
        const [tcknCheckResult] = await connection.promise().query(tcknCheckQuery, [tckn]);

        if (tcknCheckResult.length > 0) {
            return res.status(400).json({ "error": "Bu TCKN zaten kullanılıyor." });
        }

        phoneVerified = await firebaseAuth.checkPhoneVerification(id);
        if(!phoneVerified){
            return res.status(400).json({ "error": "Telefon numaranız doğrulanmadı." });
        }

        emailVerified = await firebaseAuth.checkEmailVerification(id);
        if(!emailVerified){
            return res.status(400).json({ "error": "E-mail adresiniz doğrulanmadı." });
        }



        
        const hashedPassword2 = await bcrypt.hash(hashedPassword, 8);
       //****************************************************************************** */

        newUid = await firebaseAuth.organizeFirebaseAccount(id, email, phone);
        const insertUserQuery = 'INSERT INTO user (id, name, surname, email, password, phone, tckn, birthday, serial, validuntil, type, notificationid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const [result] = await connection.promise().query(insertUserQuery, [newUid, name, surname, email, hashedPassword2, phone, tckn, birthday, serial, validUntil, "2", "@"]);
       
        
        const selectUserQuery = 'SELECT * FROM user WHERE id = ?'; 
        const [userResult] = await connection.promise().query(selectUserQuery, [newUid]);
        mail.sendAnEmail(mailTemplates.welcomeTemplate(email, name));
        res.status(200).json({user: userResult [0]});
        
    } catch (error) {
        console.log(error)
        res.status(500).json({ "error": error.message });
    }
});






authRouter.post("/signin", async (req, res) => {
    try {
        const {phone, hashedPassword, notificationid} = req.body;
  
if (!hashedPassword || !phone || !notificationid) {
    return res.status(400).json({ "error": "Gönderilen veriler eksik veya yanlış." });
}

if (hashedPassword.length !== 6) {
    return res.status(400).json({ "error": "Şifre 6 haneli olmalıdır." });
}

if (phone.length !== 12) {
    return res.status(400).json({ "error": "Telefon numarası yanlış formatta." });
}

// Telefon (phone) kontrolü
const phoneCheckQuery = 'SELECT password, passwordtry FROM user WHERE phone = ?';
const [phoneCheckResult] = await connection.promise().query(phoneCheckQuery, [phone]);

if (phoneCheckResult.length === 0) {
    return res.status(400).json({ "error": "Bu telefon numarasına ait hesap bulunamıyor." });
}

if (phoneCheckResult[0].passwordtry >= 3) {
    return res.status(400).json({ "error": "Fazla sayıda şifre denediniz. Lütfen şifrenizi sıfırlayınız." });
}

const isMatch = await bcrypt.compare(hashedPassword, phoneCheckResult[0].password);

if (!isMatch) {
    const passTryQuery = 'UPDATE user SET passwordtry = ? WHERE phone = ?';
    await connection.promise().query(passTryQuery, [phoneCheckResult[0].passwordtry + 1, phone]);
    const remain = 2 - phoneCheckResult[0].passwordtry;
    var returnText = "";
    if(remain == 0){
         returnText = `Daha fazla şifre deneyemezsiniz.`
    }else {
         returnText = `${remain} hakkınız kaldı.`
    }
    
    return res.status(400).json({ "error": `Yanlış şifre. ${returnText}` });
}
const loginTime = moment();
const userQuery = "SELECT * FROM user WHERE phone = ?";
const [userCheckResult] = await connection.promise().query(userQuery, [phone]);
const token = jwt.sign({id: userCheckResult[0].id, phone: userCheckResult[0].phone, password: hashedPassword, time: loginTime}, "passwordKey");
if(notificationid != userCheckResult[0].notificationid){
    mail.sendAnEmail(mailTemplates.loginNotificationTemplate(userCheckResult[0].email, userCheckResult[0].name, req.ip));
}
const passTryQuery = 'UPDATE user SET passwordtry = ?, notificationid = ? WHERE phone = ?';
await connection.promise().query(passTryQuery, [0, notificationid, phone]);

res.status(200).json({user: userCheckResult[0], token: token});
    
    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
});


authRouter.post("/tokenisvalid", async (req, res) => {
    try {
        const token = req.header('x-auth-token');
if(!token) return res.json(false);
const verified = jwt.verify(token, "passwordKey");
    if(!verified) return res.json(false);

    const userQuery = "SELECT * FROM user WHERE id = ?";
    const [userCheckResult] = await connection.promise().query(userQuery, [verified.id]);
if(userCheckResult == 0) return res.json(false);
res.json(true);

    } catch (error) {
        res.status(400).json(false);
    }
});


authRouter.post("/checkphone", async (req, res) => {
    try {
        const {phone} = req.body;

if (!phone) {
    return res.status(400).json({ "error": "Gönderilen veriler eksik veya yanlış." });
}



if (phone.length !== 12) {
    return res.status(400).json({ "error": "Telefon numarası yanlış formatta." });
}

// Telefon (phone) kontrolü
const phoneCheckQuery = 'SELECT password FROM user WHERE phone = ?';
const [phoneCheckResult] = await connection.promise().query(phoneCheckQuery, [phone]);

if (phoneCheckResult.length === 0) {
    return res.status(200).json({ "result": "false" });
}

return res.status(200).json({ "result": "true" });


    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
});


authRouter.post("/checktckn", async (req, res) => {
    try {
        const {tckn} = req.body;

if (!tckn) {
    return res.status(400).json({ "error": "Gönderilen veriler eksik veya yanlış." });
}



if (tckn.length !== 11) {
    return res.status(400).json({ "error": "Gönderilen veriler eksik veya yanlış." });
}

// Telefon (phone) kontrolü
const tcknCheckQuery = 'SELECT passwordtry FROM user WHERE tckn = ?';
const [tcknCheckResult] = await connection.promise().query(tcknCheckQuery, [tckn]);

if (tcknCheckResult.length === 0) {
    return res.status(200).json({ "result": "false" });
}

return res.status(200).json({ "result": "true" });


    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
});


authRouter.post("/checkphone", async (req, res) => {
    try {
        const {phone} = req.body;

if (!phone) {
    return res.status(400).json({ "error": "Gönderilen veriler eksik veya yanlış." });
}



if (phone.length !== 12) {
    return res.status(400).json({ "error": "Telefon numarası yanlış formatta." });
}

// Telefon (phone) kontrolü
const phoneCheckQuery = 'SELECT password FROM user WHERE phone = ?';
const [phoneCheckResult] = await connection.promise().query(phoneCheckQuery, [phone]);

if (phoneCheckResult.length === 0) {
    return res.status(200).json({ "result": "false" });
}

return res.status(200).json({ "result": "true" });


    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
});


authRouter.post("/checkemail", async (req, res) => {
    try {
        const {email} = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ "error": "E-mail yanlış formatta." });
        }





// email kontrolü
const emailCheckQuery = 'SELECT passwordtry FROM user WHERE email = ?';
const [emailCheckResult] = await connection.promise().query(emailCheckQuery, [email]);

if (emailCheckResult.length === 0) {
    return res.status(200).json({ "result": "false" });
}

return res.status(200).json({ "result": "true" });


    } catch (error) {
        res.status(500).json({ "error": error.message });
    }
});





authRouter.post("/tokenisvalid", async (req, res) => {
    try {
        const token = req.header('x-auth-token');
if(!token) return res.json(false);
const verified = jwt.verify(token, "passwordKey");
    if(!verified) return res.json(false);
    const userQuery = "SELECT * FROM user WHERE id = ?";
    const [userCheckResult] = await connection.promise().query(userQuery, [verified.id]);
if(userCheckResult == 0) return res.json(false);
res.json(true);

    } catch (error) {
        res.status(500).json(false);
    }
});

 



module.exports = authRouter;
