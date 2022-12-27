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

app.get("/hello/:id", (req, res) => {
    res.send({ status: 200, message: `Hello, ${req.params.id}` });
});

app.get("/search", (req, res) => {
    if (req.query.s == undefined || req.query.s == "") {
        res.status(500);
        res.send({
            status: 500,
            error: true,
            message: "you have to provide a search",
        });
    } else {
        res.status(200);
        res.send({ status: 200, message: `ok`, data: req.query.s });
    }
});

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
