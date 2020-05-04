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

/**
 * Find all Q&A
 * @return {Array} questions - questions document 
 */
app.get("/", (req, res) => {
    QAModel.find((err, questions) => {
        if (err) {
            res.status(500).json({ message: err.message });
        } else {
            res.status(202).json({
                questions: questions
            });
        }
    });
});

/**
 * Add new Question 
 * @body {String} questionHeader - header of the question 
 * @body {String} questionDescription - description of the question
 * @response {Object} contains message state and saved question  
 */
app.post("/ask", (req, res) => {

    const questionHeader = req.body.questionHeader;
    const questionDescription = req.body.questionDescription;

    const newQuestion = new QAModel({
        questionHeader: questionHeader,
        questionDescription: questionDescription
    });
    newQuestion.save((err, result) => {
        if (err) {
            res.json({ message: err.message });
        } else {
            res.status(202).json({ message: "Question saved", question: result });
        }
    });
});


app.route("/question/:questionID")

    /**
     * get a specific question 
     * @path {String} questionID - id of the question  
     * @response {Object} contains question
     */
    .get((req, res) => {
        QAModel.findById(req.params.questionID,
            (err, question) => {
                if (err) {
                    res.json({ message: err.message });
                } else if (question) {
                    res.status(202).json({ question: question });
                }
            });
    })

    /**
     * Add answer to specific post (question)
     * @path {String} questionID - id of the question
     * @body {String} answer - posted answer  
     * @response {String} - confirmation message
     */
    .post((req, res) => {
        const answer = req.body.answer;
        // to handle sending answer = ""
        if (answer) {
            QAModel.updateOne({ _id: req.params.questionID },
                { $push: { answers: { answer: answer } } },
                err => {
                    if (err) {
                        res.json({ message: err.message });
                    } else {
                        res.status(202).json({ message: "Answer Added" });
                    }
                });
        } else {
            res.json({ message: "Answer body Not Found" });
        }
    })

    /**
     * update specific question (header, description or both)
     * @path {String} questionID - id of the question 
     * @body {object} body - that contains the update parts
     * @response {String} - confirmation message 
     */
    .patch((req, res) => {
        QAModel.updateOne({ _id: req.params.questionID },
            { $set: req.body },
            err => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.status(202).json({ message: "Question Updated" });
                }
            });
    })

    /**
     * delete specific question 
     * @path {String} questionID - id of the question
     * @response {String} - confirmation message and deleted message content 
     */
    .delete((req, res) => {
        QAModel.findByIdAndDelete(req.params.questionID,
            (err, result) => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.status(202).json({ message: "Question Deleted", question: result });
                }
            })
    });


app.route("/question/:questionID/answer/:answerID")

    /**
     * update answer for a certain question
     * @path {String} questionID - id of the question
     * @path {String} answerID - id of the answer 
     * @body {String} newAnswer - modified answer
     * @response {String} - confirmation message
     */
    .patch((req, res) => {
        QAModel.updateOne({
            _id: req.params.questionID,
            answers: { $elemMatch: { _id: req.params.answerID } }
        },
            { $set: { "answers.$.answer": req.body.answer } },
            err => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.status(202).json({ message: "Answer Updated" });
                }
            });
    })

    /**
     * delete answer on question 
     * @path {String} questionID - id of the question 
     * @path {String} answerID - id of the answer 
     * @response {String} - confirmation message
     */
    .delete((req, res) => {
        QAModel.updateOne({ _id: req.params.questionID },
            { $pull: { answers: { _id: req.params.answerID } } },
            err => {
                if (err) {
                    res.json({ message: err.message });
                } else {
                    res.status(202).json({ message: "Answer Deleted" });
                }
            });
    });

/**
 * make find query to get number of voters on a certain question 
 * @param {String} questionID - id of the question 
 * @param {String} voteType - type of vote whether it's upvote or downvote 
 * @return {Promise} number of voters , error message 
 */
function findVote(questionID, voteType) {

    let promise = new Promise((resolve, reason) => {
        QAModel.findOne({ _id: questionID }, voteType, (err, result) => {
            if (err) {
                reason(err.message);
            } else {
                resolve(result);
            }
        })
    });
    return promise;
}

/**
 * make update query to modify number of voters on a certain question 
 * @param {String} questionID 
 * @param {Object} updateQuery 
 * @returns {Promise} 
 */
function updateVote(questionID, updateQuery) {
    let promise = new Promise((resolve, reject) => {
        QAModel.updateOne(
            { _id: questionID },
            updateQuery,
            (err, result) => {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(result);
                }
            });
    });
    return promise;
}


app.route("/question/:questionID/upvote")

    /**
     * get value of upvotes on a certain question 
     * @path {String} questionID - id of the question 
     * @response {String} - number of voters 
     */
    .get((req, res) => {

        const findVoteFunction = findVote(req.params.questionID, "upVote");

        findVoteFunction.then(resolve => {
            res.status(202).json({ message: resolve });
        }, reject => {
            res.json({ message: reject });
        })

    })

    /**
     * update number of upvoters
     * @path {String} questionID - id of the question 
     * @body {String} currentVoteValue - current value of upvote
     * @body {String} addToCurrentVote - value to be added on current value 
     * @response {String} 
     */
    .put((req, res) => {
        const currentValue = parseInt(req.body.current);
        const addToCurrentVote = parseInt(req.body.add);
        const updateVoteFunction = updateVote(req.params.questionID, { "upVote": currentValue + addToCurrentVote });

        updateVoteFunction.then(resolve => {
            res.status(202).json({ message: "Upvotes value updated" });
        }, reject => {
            res.json({ message: reject });
        });
    });


app.route("/question/:questionID/downvote")

    /**
     * get value of downvotes on a certain question
     * @path {String} questionID - id of the question
     * @response {Object} message - message contains number of voters
     */
    .get((req, res) => {

        const findVoteFunction = findVote(req.params.questionID, "downVote");
        findVoteFunction.then(
            resolved => {
                res.status(202).json({ message: resolved });
            }, reject => {
                res.json({ message: reject });
            }
        )

    })

    /**
    * update number of downvoters
    * @path {String} questionID - id of the question
    * @body {String} currentVoteValue - current value of downvoters
    * @body {String} addToCurrentVote - value to be added on current value
    * @response {String}
    */
    .put((req, res) => {

        const currentVoteValue = parseInt(req.body.current);
        const addToCurrentVote = parseInt(req.body.add);
        const updateVoteFunction = updateVote(req.params.questionID, { "downVote": currentVoteValue + addToCurrentVote });
        updateVoteFunction.then(
            resolved => {
                res.status(202).json({ message: resolved });
            }, rejected => {
                res.json({ message: rejected });
            }
        )
    });



app.listen(3000, () => {
    console.log("server start listening on port 3000");

});