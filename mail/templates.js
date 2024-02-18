function welcomeTemplate(to, username){
    return {
        from: `"Apay" <destek@applus.com.tr>`,
        to,
        subject: "Hoş Geldin!",
        html: `
          <!DOCTYPE html>
          <html lang="tr">
          <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Aramıza Hoşgeldin</title>
          </head>
          <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
    
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
              
              <h1 style="color: #3498db; text-align: center;">Hoş Geldin!</h1>
              
              <p style="text-align: center;">Merhaba ${username},</p>
    
              <p style="text-align: justify;">Apay'e hoş geldin! Aramıza katıldığın için çok mutluyuz.</p>
    
              <p style="text-align: center;">
                <a href="https://applus.com.tr/#app" style="display: inline-block; padding: 10px 20px; background-color: #3498db; color: #fff; text-decoration: none; border-radius: 5px;">Uygulamaya git</a>
              </p>
    
              <p style="text-align: justify;">Eğer herhangi bir sorunla karşılaşırsan veya yardıma ihtiyacın olursa bize her zaman ulaşabilirsin. İyi zamanlar geçirmen dileğiyle!</p>
    
              <p style="text-align: center;">Bol bol sevgilerle,<br> Apay Ekibi</p>
    
            </div>
    
          </body>
          </html>
        `,
      };
}
function loginNotificationTemplate(to, username, ipAddress) {
    return {
      from: `"Apay" <destek@applus.com.tr>`,
      to: to, 
      subject: 'Giriş Bilgilendirme',
      html: `
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Giriş Bilgilendirme</title>
        </head>
        <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; color: #333; padding: 20px;">
  
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
            
            <h1 style="color: #3498db; text-align: center;">Giriş Bilgilendirme</h1>
            
            <p style="text-align: justify;">Merhaba ${username},</p>
  
            <p style="text-align: justify;">Bu e-mail, hesabınıza giriş yapıldığını bildirmek amacıyla gönderilmiştir. Kayıtlı mail adresiniz ile Apay hesabınıza giriş yapılmıştır.</p>
  
            <p style="text-align: left;">Giriş Zamanı: ${new Date().toLocaleString()}</p>
            <p style="text-align: left;">Giriş yapan IP Adresi: ${ipAddress}</p>
            <p style="text-align: left;">Giriş yapan Kullanıcı: ${to}</p>
  
            <p style="text-align: justify;">Eğer bu işlem bilginiz dışındaysa, lütfen en kısa sürede bizimle iletişime geçiniz: destek@applus.com.tr</p>
  
            <p style="text-align: center;">Bolca sevgiler,<br> Apay ekibi</p>
  
          </div>
  
        </body>
        </html>
      `,
    };
  }



  function paymentCode1(to, name, buyid, estimated, amount) {
    return {
      from: `"Apay" <destek@applus.com.tr>`,
      to: to, 
      subject: 'Ödeme Bilgilendirme',
      html: `<!DOCTYPE html>
      <html lang="tr">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Ödeme Bilgilendirme</title>
          <style>
              body {
                  font-family: 'Arial', sans-serif;
                  background-color: #f4f4f4;
                  margin: 0;
                  padding: 0;
              }
      
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  border-radius: 10px;
                  padding: 20px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
      
              h2 {
                  color: #333;
              }
      
              p {
                  color: #555;
              }
          </style>
      </head>
      <body>
      
          <div class="container">
              <h2>Ödemeniz Alındı!</h2>
              <p>Merhaba ${name},</p>
              <p>Bakiye yükleme isteğiniz başarıyla alınmıştır. İşte ödeme detayları:</p>
      
              <p><strong>İşlem Numarası:</strong> ${buyid}</p>
              <p><strong>Tarih:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Hesabınıza yansıma tarihi:</strong> ${estimated}</p>
      
              <p><strong>Ödeme tutarı: </strong>${amount} TL</p>
      
              <p>Teşekkür ederiz!</p>
              <p>İyi günler dileriz.</p>
      
              <p>Not: Bakiyenize aktarıldığında e-posta ile bilgilendirileceksiniz.</p>
          </div>
      
      </body>
      </html>
      
      `,
    };
  }
  
module.exports = {welcomeTemplate, loginNotificationTemplate, paymentCode1}

