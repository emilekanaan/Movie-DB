const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.send(`ok`);
});

app.get("/test", (req, res) => {
    res.send({ status: 200, message: "ok" });
});

app.get("/time", (req, res) => {
    let currentDate = new Date();
    let time = currentDate.getHours() + ":" + currentDate.getMinutes();
    res.send({ status: 200, message: time });
});

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
