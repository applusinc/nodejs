const express = require('express');
const paymentRouter = express.Router();
const { Shopier } = require('shopier-api')
const shopier = new Shopier('2bcf528a0a91f60d6ccaa85b7c1dee60', 'cc191c0545633ac81b65527ea8f3c878');

const {connection} = require("../database/database");
const auth = require("../middlewares/auth");
const permissions = require("../middlewares/permissions");
const mail = require('../mail/mail');
const mailTemplates = require('../mail/templates');

const fs = require('fs');

function logToFile(text, filePath) {
  // Metni belirtilen dosyaya ekler
  fs.appendFileSync(filePath, `${text}\n`, 'utf8');
}


function generateRandomNumber() {
  const prefix = '12'; // Başlangıç değeri
  const randomDigits = Math.floor(1000000000 + Math.random() * 9000000000); // Rastgele 10 haneli sayı

  const randomNumber = prefix + randomDigits.toString().slice(0, 10);
  return randomNumber;
}

paymentRouter.get('/pay', auth, permissions, async (req, res) => {
  const amount = req.header("amount");
  if (!amount) res.status(400).end("Hatalı işlem.")
  const userQuery = "SELECT * FROM user WHERE id = ?";
  const [userCheckResult] = await connection.promise().query(userQuery, req.id);
  const payID = generateRandomNumber()
  shopier.setBuyer({
    buyer_id_nr: payID,
    product_name: 'Bakiye Yükleme',
    buyer_name: userCheckResult[0].name,
    buyer_surname: userCheckResult[0].surname,
    buyer_email: userCheckResult[0].email,
    buyer_phone: userCheckResult[0].phone.toString()
  });
  
  
  const insertUserQuery = 'INSERT INTO purchase (buyid, buyerid, amount, status, createdtime, updatedtime) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)';
  await connection.promise().query(insertUserQuery, [payID, req.id, amount, 0]);


  
  const paymentPage = shopier.generatePaymentHTML(amount); 
  res.end(paymentPage);
  
  });

  paymentRouter.post('/callback', async(req, res) => {
    try{
      const strJson = JSON.stringify(req.body);
      const callback = shopier.callback(JSON.parse(strJson), 'cc191c0545633ac81b65527ea8f3c878');
      const paymentQuery = 'UPDATE purchase SET status = ?, updatedtime = CURRENT_TIMESTAMP WHERE buyid = ?';
      await connection.promise().query(paymentQuery, [1, callback.order_id]);

      const paymentCheckQuery = "SELECT * FROM purchase WHERE buyid = ?";
      const [paymentCheckResult] = await connection.promise().query(paymentCheckQuery, callback.order_id);
      
      const userQuery = "SELECT * FROM user WHERE id = ?";
      const [userCheckResult] = await connection.promise().query(userQuery, paymentCheckResult[0].buyerid);
      
      mail.sendAnEmail(mailTemplates.paymentCode1(userCheckResult[0].email, userCheckResult[0].name, callback.order_id, "En geç bir iş günü içinde.", paymentCheckResult[0].amount));
      res.status(200).end("success");
      
    }catch(err){
      const logText = err.message + "\n"+ strJson ;
      const logFilePath = 'failpayments.txt';

      logToFile(logText, logFilePath);  
      console.log(err);
      
      res.status(500).end("error");
    }
  
  });

module.exports = paymentRouter;