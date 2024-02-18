const { connection } = require("../database/database");


const depositCC = async (req, res, next) => {
    const perQuery = "SELECT depositcc FROM permissions WHERE uid = ?";
    const [perResult] = await connection.promise().query(perQuery, req.id);
    if(perResult.length == 0) return res.status(401).json({error: "Bunu yapmanız için izniniz yok, erişim reddedildi.", code: "PERMISSION_DENIED"});
    if(perResult[0].depositcc == 0) return res.status(401).json({error: "Bunu yapmanız için izniniz yok, erişim reddedildi."});
    next()
}

 
module.exports = depositCC; 