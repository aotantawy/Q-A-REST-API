//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/QADB", { useNewUrlParser: true, useUnifiedTopology: true });

const questionsSchema = {
    questionHeader: {
        type: String,
        required: [true, "No question Header"],
    },
    questionDescription: String,
    upVote: {
        type: Number,
        default: 0
    },
    downVote: {
        type: Number,
        default: 0
    },
    answers: [{
        answer: String
    }]
}

const QAModel = mongoose.model("QA", questionsSchema);

app.listen(3000, () => {
    console.log("server start listening on port 3000");

});