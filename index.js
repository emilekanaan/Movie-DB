require("dotenv").config();
const express = require("express");
const app = express();
const PORT = 3000;
const mongoose = require("mongoose");
const { Schema } = mongoose;

mongoose.set("strictQuery", true);

mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
        console.log("Successfully connected to database");
    })
    .catch((error) => {
        console.log("database connection failed. exiting now...");
        console.error(error);
        process.exit(1);
    });

const moviesSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
            min: 1900,
            max: 2100,
        },
        rating: {
            type: Number,
            default: 4,
            min: 0,
            max: 10,
        },
    },
    { versionKey: false }
);

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

// const movies = [
//     { title: "Jaws", year: 1975, rating: 8 },
//     { title: "Avatar", year: 2009, rating: 7.8 },
//     { title: "Brazil", year: 1985, rating: 8 },
//     { title: "الإرهاب والكباب‎", year: 1992, rating: 6.2 },
// ];

const moviesModel = mongoose.model("movies", moviesSchema);
// moviesModel.create(movies, moviesSchema);

app.post("/movies/add", async (req, res) => {
    let newMovie = {};
    newMovie.title = req.query.title;
    newMovie.year = parseInt(req.query.year);
    if (req.query.rating) {
        newMovie.rating = parseFloat(req.query.rating);
    }
    try {
        let addedMovie = new moviesModel(newMovie);
        await addedMovie.save();
        const movies = await moviesModel.find({});
        res.send(movies);
    } catch (error) {
        console.log(error.message);
        res.status(403);
        res.send({
            status: 403,
            error: true,
            message: error.message,
        });
    }
});

app.get("/movies/read", async (req, res) => {
    try {
        const movies = await moviesModel.find({});
        res.send({
            status: 200,
            data: movies,
        });
    } catch (error) {
        res.status(500);
        res.send({
            status: 500,
            error: true,
            message: error.message,
        });
    }
});

app.get("/movies/read/by-date", async (req, res) => {
    try {
        const movies = await moviesModel.find({});
        let sorted = movies.sort((a, b) => a.year - b.year);
        res.send({
            status: 200,
            data: sorted,
        });
    } catch (error) {
        res.status(500);
        res.send({
            status: 500,
            error: true,
            message: error.message,
        });
    }
});

app.get("/movies/read/by-rating", async (req, res) => {
    try {
        const movies = await moviesModel.find({});
        let sorted = movies.sort((a, b) => b.rating - a.rating);
        res.send({
            status: 200,
            data: sorted,
        });
    } catch (error) {
        res.status(500);
        res.send({
            status: 500,
            error: true,
            message: error.message,
        });
    }
});

app.get("/movies/read/by-title", async (req, res) => {
    try {
        const movies = await moviesModel.find({});
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
    } catch (error) {
        res.status(500);
        res.send({
            status: 500,
            error: true,
            message: error.message,
        });
    }
});

app.get("/movies/read/id/:id", async (req, res) => {
    try {
        const movies = await moviesModel.find({});
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
    } catch (error) {
        res.status(500);
        res.send({
            status: 500,
            error: true,
            message: error.message,
        });
    }
});

app.get("/movies/update", (req, res) => {
    res.send(`you have to enter update/< _id >?title=< NEW_TITLE > `);
});

app.patch("/movies/update/:id", async (req, res) => {
    const filter = { _id: req.params.id };
    const { title, year, rating } = req.query;
    const update = {};

    if (title) update.title = title;
    if (
        year &&
        year.toString().length === 4 &&
        !isNaN(year) &&
        year >= 1900 &&
        year <= 2100
    ) {
        update.year = year;
    } else if (year < 1900 || year > 2100) {
        res.status(400);
        return res.send(`${year} is not an accepted year`);
    }
    if (rating && !isNaN(rating) && rating >= 0 && rating <= 10) {
        update.rating = parseFloat(rating);
    } else if (rating < 0 || rating > 10) {
        res.status(400);
        return res.send(`${rating} is not an accepted rating`);
    }

    try {
        const movie = await moviesModel.findOneAndUpdate(filter, update, {
            new: true,
        });
        const movies = await moviesModel.find({});
        if (!movie) {
            res.status(404);
            res.send({
                status: 404,
                error: true,
                message: `ID:${req.params.id} not found`,
            });
        } else {
            moviesModel.findOneAndUpdate(filter, update, { new: true });
            res.send(movies);
        }
    } catch (error) {
        res.status(500);
        res.send(err.message);
    }
});

app.get("/movies/delete", (req, res) => {
    res.send(`you have to enter delete/< _id > `);
});

app.delete("/movies/delete/:id", async (req, res) => {
    try {
        await moviesModel.deleteOne({ _id: req.params.id });
        const movies = await moviesModel.find({});
        res.send(movies);
    } catch (error) {
        res.status(404);
        res.send({
            status: 404,
            error: true,
            message: error.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
