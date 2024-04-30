var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var DeckSchema = new Schema({
    'createdOn': { type: Date, default: Date.now },
    'createdBy': { type: Schema.Types.ObjectId, ref: 'User' },
    'updatedBy': { type: Schema.Types.ObjectId, ref: 'User' },
    'updatedOn': { type: Date, default: Date.now, default: Date.now  },
    'questions': [{ type: Schema.Types.ObjectId, ref: 'Question', default: []}],
    'title': String,
    'description': String,
    'deckGuests': [{ type: Schema.Types.ObjectId, ref: 'User', default: []}],
    'type': {
        type: String,
        enum: ["PRIVATE", "PUBLIC"],
        default: "PRIVATE"
    },
    'playCount': { type: Number, default: 0 },
    'likes': [
        {
            type: Schema.Types.ObjectId,
            ref: 'User' 
        }
    ],
    'status': {
        type: String,
        enum: ["DRAFT", "PUBLISHED"],
        default: "DRAFT"
    },
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
    }
});

module.exports = mongoose.model('Deck', DeckSchema);