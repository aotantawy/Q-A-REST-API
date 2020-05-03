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


app.get("/", (req, res) => {  // return all Q and A  
    QAModel.find((err, questions) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(202).json({
                questions: questions // returning all questions in array 
            });
        }
    });
});

app.post("/ask", (req, res) => { // adding brand new question 

    const questionHeader = req.body.questionHeader;
    const questionDescription = req.body.questionDescription;

    const newQuestion = new QAModel({
        questionHeader: questionHeader,
        questionDescription: questionDescription
    });
    newQuestion.save((err, result) => {
        if (err) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(202).json({ message: "Question saved", question: result });
        }
    });
});


app.route("/question/:questionID")
    .get((req, res) => { // return a specific question using id  
        QAModel.findById(req.params.questionID, (err, question) => {
            if (err) {
                res.json({ message: err.message });
            } else if (question) {
                res.status(202).json({ question: question });
            }
        });
    })
    .patch((req, res) => { // patching the question (update header or description )
        QAModel.updateOne({ _id: req.params.questionID },
            { $set: req.body },
            (err, result) => {
                console.log(result);
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.status(202).json({ message: "Question Updated", result: result });
                }
            });
    })
    .delete((req, res) => { // delete a specific question by his id 
        QAModel.findByIdAndDelete(req.params.questionID, (err, result) => {
            if (err) {
                res.status(400).json({ message: err.message });
            } else {
                res.status(202).json({ message: "Question Deleted", question: result });
            }
        })
    });


app.listen(3000, () => {
    console.log("server start listening on port 3000");

});