var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var QuestionSchema = new Schema({
    'createdOn': { type: Date, default: Date.now },
    'createdBy': { type: Schema.Types.ObjectId, ref: 'User' },
    'updatedBy': { type: Schema.Types.ObjectId, ref: 'User' },
    'updatedOn': { type: Date, default: Date.now },
    'type': {
        type: String,
        enum: ["MULTI_CHOICE", "QNA", "IMAGE", "AUDIO", "VIDEO", "FILE"],
        default: "QNA"
    },
    'image': {
        type: [String], // Allow multiple image files
    },
    'video': {
        type: [String], // Allow multiple video files
    },
    'audio': {
        type: [String], // Allow multiple audio files
    },
    'file': {
        type: [String], // Allow multiple text files or PDF documents
    },
    'multichoiceOptions': [String], // Array of options for multi-choice questions
    'timer': {
        type: Number,
        default: 0, // Default value is 0 minutes
        validate: {
            validator: function(value) {
                // Validate that the timer value is a non-negative number
                return value >= 0;
            },
            message: 'Timer must be a non-negative number (in minutes).'
        }
    },
    'question': String,
    'answer': String,
    'difficulty': {
        type: String,
        enum: ["EASY", "MEDIUM", "HARD"],
        default: "MEDIUM"
    },
    'decks': [{ type: Schema.Types.ObjectId, ref: 'Deck'}],
});


module.exports = mongoose.model('Question', QuestionSchema);