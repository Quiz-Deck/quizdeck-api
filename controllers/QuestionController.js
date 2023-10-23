var QuestionModel = require('../models/QuestionModel');
var DeckModel = require('../models/DeckModel');

module.exports = {

    //Create a question
    create: async function (req, res) {
        if (!req.body.question) {
            return res.status(400).json({ message: "You cannnot create a question without asking a question" });
        }
        if (!req.params.deckId) {
            return res.status(400).json({ message: "Deck id is required" });
        }
        if (!req.body.answer) {
            return res.status(400).json({ message: "You need to provide an answer for your question" });
        }
        if (!req.body.type) {
            return res.status(400).json({ message: "What type of question do you want to create?" });
        }
        try {

            DeckModel.findOne({_id: req.params.deckId}, function (err, Deck) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Deck.',
                        error: err
                    });
                }
                if (!Deck) {
                    return res.status(404).json({
                        message: 'Deck does not exist'
                    });
                }
                var Question = new QuestionModel({
                    question: req.body.question,
                    type: req.body.type,
                    deck: req.params.deckId,
                    multichoiceOptions: req.body.multichoiceOptions,
                    answer: req.body.answer
                });
    
                Question.save(async function (err, Question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating Question',
                        error: err
                    });
                }
                    let updatedeck = await DeckModel.findOneAndUpdate({_id: req.params.deckId}, {$push: {"questions" : Question._id}}).exec();
                    if(updatedeck){
                        return res.status(201).json({ message: 'Question created successfully', data: Question });
                    }
                  
                });
            });

        } catch (error) {

            return res.status(500).json({
                message: 'Error processing requests.',
                error: error
            });
        }
    },


    //Edit a question
        update: function (req, res) {
            var id = req.params.id;
            QuestionModel.findOne({_id: id}, function (err, Question) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Question',
                        error: err
                    });
                }
                if (!Question) {
                    return res.status(404).json({
                        message: 'Question does not exist'
                    });
                }
    
                Question.question = req.body.question ? req.body.question : Question.question;
                Question.type = req.body.type ? req.body.type : Question.type;
                Question.multichoiceOptions = req.body.multichoiceOptions ? req.body.multichoiceOptions : Question.multichoiceOptions;
                Question.answer = req.body.answer ? req.body.answer : Question.answer;
                
                Question.save(function (err, Question) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when updating Question.',
                            error: err
                        });
                    }
    
                    return res.json({ message: "Question updated successfully", data: Question});
                });
            });
        },

    //Delete a question
    delete: function (req, res) {
        var id = req.params.id;
        QuestionModel.findByIdAndRemove(id, function (err) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting this Question.',
                    error: err
                });
            }
            return res.json({message: "Question deleted successfully"});
        });
    },

    //Get one question
    getone: function (req, res) {
        var id = req.params.id;
        QuestionModel.findOne({_id: id}, function (err, Question) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Question.',
                    error: err
                });
            }
            if (!Question) {
                return res.status(404).json({
                    message: 'No such Question found'
                });
            }
            return res.json({message: "Found this Question", data: Question});
        });
    },

}