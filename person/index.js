const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const p1 = require('./p1');
const port = 3000;
const path = require('path');

const app = express();


app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

console.log("server working");



app.get("/", (req, res) => {
    res.render("home");
});


app.get("/about", (req, res) => {
    res.render("about");
});
