var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var CategorySchema = new Schema({
    'createdOn': { type: Date, default: Date.now },
    'createdBy': { type: Schema.Types.ObjectId, ref: 'User' },
    'title': String,
    'isActive': Boolean,   
});

module.exports = mongoose.model('Category', CategorySchema);