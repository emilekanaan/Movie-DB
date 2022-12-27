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

const movies = [
    { title: "Jaws", year: 1975, rating: 8 },
    { title: "Avatar", year: 2009, rating: 7.8 },
    { title: "Brazil", year: 1985, rating: 8 },
    { title: "الإرهاب والكباب‎", year: 1992, rating: 6.2 },
];

app.get("/movies/create", (req, res) => {
    res.send(`create`);
});

app.get("/movies/read", (req, res) => {
    res.send({
        status: 200,
        data: movies,
    });
});

app.get("/movies/update", (req, res) => {
    res.send(`update`);
});

app.get("/movies/delete", (req, res) => {
    res.send(`delete`);
});

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
