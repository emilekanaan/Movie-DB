require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 3000;
const mongoose = require("mongoose");
const { Schema } = mongoose;
let $authenticate = false;

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

// the original array of movies
// const movies = [
//     { title: "Jaws", year: 1975, rating: 8 },
//     { title: "Avatar", year: 2009, rating: 7.8 },
//     { title: "Brazil", year: 1985, rating: 8 },
//     { title: "الإرهاب والكباب‎", year: 1992, rating: 6.2 },
// ];

// users array
// FOR TESTING PURPOSES: username: "admin" & password: "password"
const users = [
    {
        username: "admin",
        password: "$2a$10$eRuPFJ6vJ8i31rpaJmDcP.pysqf2ewDdlY1fnpFwaazbNvPGPlwHO",
    },
    {
        username: "hooo",
        password: "$2a$10$4EvKqqX6PFhS7Fay868D9OsJg7f8KAFz4.ay8hAboLqS2voz2X60q",
    },
    {
        username: "hello",
        password: "$2a$10$qftEoTJDoSxWicLwxxR3ievq7PlXnFLVFupLRDxHe0BybrNxtNhm.",
    },
    {
        username: "hellows",
        password: "$2a$10$jbdRt7PGw70Muzk1TLdTQOBluUTSBO0xXkD8a5qK9flSB0cRh.ZMW",
    },
];

const moviesModel = mongoose.model("movies", moviesSchema);
// moviesModel.create(movies, moviesSchema);

// add a new user
app.post("/user/create", async (req, res) => {
    let { username, password } = req.query;
    if (username && password) {
        console.log(users.find((u) => u.username == username));
        if (users.find((u) => u.username == username)) {
            res.send(
                `Error! this username is already taken... please chose another one`
            );
        } else {
            let encryptedPassword = await bcrypt.hash(password, 10);
            users.push({ username: username, password: encryptedPassword });
            res.send(`Account created successfully!`);
            console.log(users);
        }
    } else {
        res.send(`Error! Please enter a valid username and password`);
    }
});

//logging in
app.post("/user/login", async (req, res) => {
    let { username, password } = req.query;
    if (username && password) {
        let checking = users.find((u) => u.username == username);
        if (users.find((u) => u.username == username)) {
            let passCheck = await bcrypt.compare(password, checking["password"]);
            if (checking["username"] == username && passCheck) {
                $authenticate = true;
                console.log(`logged in`);
                res.send(`Logged in successfully!`);
            } else {
                res.send(`Error! wrong username or password`);
            }
        } else {
            res.send(`Error! wrong username or password`);
        }
    } else {
        res.send(`Error! Please enter a valid username and password`);
    }
});

// logout
app.post("/user/logout", (req, res) => {
    if (!$authenticate) {
        res.send(`you are already logged out`);
    } else if ($authenticate) {
        $authenticate = false;
        console.log(`logged in`);
        res.send(`Logged out successfully!`);
    }
});

// list all the users
app.get("/user/read", (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    } else {
        res.send(users);
    }
});

// delete a user
app.delete("/user/delete", (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    } else {
        let { username } = req.query;
        try {
            if (username) {
                let checking = users.find((u) => u.username == username);
                const index = users.findIndex(
                    (element) => element.username === username
                );
                if (checking["username"] == username) {
                    users.splice(index, 1);
                    res.send(users);
                } else {
                    res.send(`Error! Please enter a valid username`);
                }
            } else {
                res.send(`Error! Please enter a valid username`);
            }
        } catch (error) {
            res.send(error.message);
        }
    }
});

// update the username and password
app.patch("/user/update/:id", async (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    }
    {
        let { id } = req.params;
        let { username, password } = req.query;
        try {
            if (id < users.length && id >= 0) {
                if (id && username && password) {
                    let encryptedPassword = await bcrypt.hash(password, 10);
                    users[id] = { username: username, password: encryptedPassword };
                    res.send(users);
                } else {
                    res.send(
                        `Error! Please enter the id of the user you want to update and the new username and new password`
                    );
                }
            } else {
                res.send(`Error! This id is not in the list`);
            }
        } catch (error) {
            res.send(error.message);
        }
    }
});

// add movies to the database
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

// list all the movies from the database
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

// list all the movies sorted by date
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

// list all the movies sorted by rating
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

// list all the movies sorted by title
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

// list one movie by _id
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

// how to edit a movie in the database
app.get("/movies/update", (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    } else {
        res.send(`you have to enter update/< _id >?title=< NEW_TITLE > `);
    }
});

// edit a movie in the database
app.patch("/movies/update/:id", async (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    } else {
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
    }
});

// how to delete a movie from the database by _id
app.get("/movies/delete", (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    } else {
        res.send(`you have to enter delete/< _id > `);
    }
});

// delete a movie from the database by _id
app.delete("/movies/delete/:id", async (req, res) => {
    if (!$authenticate) {
        return res.send(`Access denied! Please login.`);
    } else {
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
    }
});

app.listen(PORT, () => {
    console.log(`listening at http://localhost:${PORT}`);
});
