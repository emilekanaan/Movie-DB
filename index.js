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

app.get("/movies/add", (req, res) => {
    let newMovie = { title: "", year: null, rating: 4 };
    newMovie.title = req.query.title;
    newMovie.year = parseInt(req.query.year);
    if (
        req.query.title !== undefined &&
        req.query.title !== "" &&
        !isNaN(req.query.year) &&
        req.query.year !== "" &&
        req.query.year.length == 4
    ) {
        if (req.query.rating == undefined) {
            movies.push(newMovie);
            res.send(movies);
        } else {
            newMovie.rating = parseFloat(req.query.rating);
            movies.push(newMovie);
            res.send(movies);
        }
    } else {
        res.status(403);
        res.send({
            status: 403,
            error: true,
            message: "you cannot create a movie without providing a title and a year",
        });
    }
});

app.get("/movies/read", (req, res) => {
    res.send({
        status: 200,
        data: movies,
    });
});

app.get("/movies/read/by-date", (req, res) => {
    let sorted = movies.sort((a, b) => a.year - b.year);
    res.send({
        status: 200,
        data: sorted,
    });
});

app.get("/movies/read/by-rating", (req, res) => {
    let sorted = movies.sort((a, b) => b.rating - a.rating);
    res.send({
        status: 200,
        data: sorted,
    });
});

app.get("/movies/read/by-title", (req, res) => {
    let sorted = movies.sort((a, b) => {
        let ta = a.title.toLowerCase();
        let tb = b.title.toLowerCase();
        if (ta < tb) {
            return -1;
        }
        if (ta > tb) {
            return 1;
        }
        return 0;
    });
    res.send({
        status: 200,
        data: sorted,
    });
});

app.get("/movies/read/id/:id", (req, res) => {
    if (movies[req.params.id] == undefined) {
        res.status(404);
        res.send({
            status: 404,
            error: true,
            message: `the movie ${req.params.id} does not exist`,
        });
    } else {
        res.send({
            status: 200,
            data: movies[req.params.id],
        });
    }
});

app.get("/movies/update", (req, res) => {
    res.send(`update`);
});

app.get("/movies/delete", (req, res) => {
    res.send(`you have to enter delete/< ID > `);
});

app.get("/movies/delete/:id", (req, res) => {
    if (isNaN(req.params.id)) {
        res.status(404);
        res.send({
            status: 404,
            error: true,
            message: `please enter a valid id number`,
        });
    } else if (req.params.id < 0 || req.params.id > movies.length - 1) {
        res.status(404);
        res.send({
            status: 404,
            error: true,
            message: `the movie ${req.params.id} does not exist`,
        });
    } else {
        movies.splice(req.params.id, 1);
        res.send(movies);
    }
});

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
