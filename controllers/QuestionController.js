var QuestionModel = require('../models/QuestionModel');
var DeckModel = require('../models/DeckModel');

module.exports = {

    //Create a question
    create: async function (req, res) {
        // Check if the request body contains an array of questions
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ message: "Invalid request format. An array of questions is required." });
        }
    
        try {
            // Initialize an array to store the created questions
            let createdQuestions = [];
    
            // Iterate over each question in the array
            for (let questionData of req.body) {
                // Validate if the required fields are present in the request
                if (!questionData.question || !questionData.answer || !questionData.type || !req.params.deckId) {
                    return res.status(400).json({ message: "Incomplete question data. Question, answer, type, and deckId are required." });
                }
    
                // Check if the deck exists
                const deck = await DeckModel.findOne({ _id: req.params.deckId });
                if (!deck) {
                    return res.status(404).json({ message: 'Deck does not exist' });
                }
    
                // Create a new question based on the request data
                let newQuestion = new QuestionModel({
                    question: questionData.question,
                    type: questionData.type,
                    deck: req.params.deckId,
                    multichoiceOptions: questionData.multichoiceOptions,
                    answer: questionData.answer
                });
    
                // Save the new question to the database
                await newQuestion.save();
    
                // Update the deck to include the newly created question
                await DeckModel.findOneAndUpdate(
                    { _id: req.params.deckId },
                    { $push: { "questions": newQuestion._id } }
                );
    
                // Add the created question to the array of created questions
                createdQuestions.push(newQuestion);
            }
    
            // Return the array of created questions
            return res.status(201).json({ message: 'Questions created successfully', data: createdQuestions });
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