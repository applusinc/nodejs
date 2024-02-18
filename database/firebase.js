const admin = require('firebase-admin');
const serviceAccount = require('../firebase_secret.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: '',
  });



async function checkEmailVerification(uid){
    try{
        const userRecord = await admin.auth().getUser(uid);
        return userRecord.emailVerified;
    }catch(e){  
        return false;
    }
}

async function checkPhoneVerification(uid){
    try{
        const userRecord = await admin.auth().getUser(uid);
        return userRecord.phoneNumber;
    }catch(e){
        return false;
    }
}

async function generateUniqueUid() {
    const uidPattern = /^1182\d{8}$/; // Desen kontrolü için bir Regex
  
    let uid = '';
    do {
      uid = '11' + Math.floor(10000000 + Math.random() * 90000000); // 12 haneli sayı
    } while (!uidPattern.test(uid)&& await !checkUID(uid)); // Desene uymadığı sürece tekrar oluştur
  
    return uid;
  }


  async function checkUID(uid){
    const existingUser = await admin.auth().getUser(uid).catch(() => null);
    if (existingUser) {
      return false;
    }else {
        return true;
    }
  }
async function organizeFirebaseAccount(uid, email, phone){
    try{
        await admin.auth().deleteUser(uid);
    let customUid = await generateUniqueUid();
    await admin.auth().createUser({
        uid: customUid,
        phoneNumber: "+"+phone,
        email: email,
        emailVerified: true
      });
    return customUid;
    }catch(error){
        console.log(error)
        return null;
    }
}

module.exports = {checkEmailVerification, checkPhoneVerification, organizeFirebaseAccount}