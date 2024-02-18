const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'ms6.guzel.net.tr',
    port: 587,
    secure: false,
    
  
    
    auth: {
      user: 'destek@applus.com.tr',
      pass: 'r514AtanY4'

    }
  });

function sendAnEmail(options){
    transporter.sendMail(options, function(error, info) {
        if (error) {
          console.error(error);
        } else {
          console.log('E-posta gönderildi: ' + info.response);
        }
      });
}


module.exports = {sendAnEmail};





