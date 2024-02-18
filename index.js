const express = require('express');
const authRouter = require('./routes/auth');
const userRouter = require("./routes/user");
const {connection} = require("./database/database");
const paymentRouter = require("./routes/payment");
const app = express();
const PORT = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(async (req, res, next) => {
    const serverQuery = "SELECT status FROM access WHERE id = ?";
    const [serverresult] = await connection.promise().query(serverQuery, "main");
    if(serverresult[0].status == 0){
        return res.status(508).json({error: "Sunucularımız şuanda bakımda.", code: "MAINTANCE"});
    }
    next();
});
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);

app.get("/", (req, res, next) => {
    res.status(200).end("Apay main server running with " + process.version)
})


app.listen(PORT, ()  => {
    console.log('Listening on port ' + PORT);
});