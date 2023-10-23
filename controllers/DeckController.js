var DeckModel = require('../models/DeckModel');


module.exports = {

    //Create a deck
    create: async function (req, res) {
        if (!req.body.title) {
            return res.status(400).json({ message: "Deck name is required." });
        }
        try {
            var Deck = new DeckModel({
                createdBy: req.verified._id,
                updatedBy: req.verified._id,
                title: req.body.title,
                description: req.body.description,
                deckGuests: req.body.guests,
                type: req.body.type,
                status: req.body.status,
            });

            Deck.save(function (err, Deck) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating Deck',
                        error: err
                    });
                }
                return res.status(201).json({ message: 'Deck created successfully', data: Deck });
            });

        } catch (error) {
            return res.status(500).json({
                message: 'Error processing requests.',
                error: error
            });
        }
    },

    //Edit deck details
    update: function (req, res) {
        var id = req.params.id;
        DeckModel.findOne({_id: id}, function (err, Deck) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Deck',
                    error: err
                });
            }
            if (!Deck) {
                return res.status(404).json({
                    message: 'Deck does not exist'
                });
            }

            if(req.verified._id !== Deck.createdBy && Deck.type === "PRIVATE"){
                return res.status(500).json({
                    message: 'Private can only be edited by creator',
                    error: err
                });
            }
            Deck.title = req.body.title ? req.body.title : Deck.title;
			Deck.description = req.body.description ? req.body.description : Deck.description;
			Deck.type = req.body.type ? req.body.type : Deck.type;
            Deck.updatedBy = req.verified._id;
            Deck.status = req.body.status ? req.body.status : Deck.status;
            Deck.deckGuests = req.body.deckGuests ? req.body.deckGuests : Deck.deckGuests,
			
            Deck.save(function (err, Deck) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Deck.',
                        error: err
                    });
                }

                return res.json({ message: "Deck updated successfully", data: Deck});
            });
        });
    },

    //Get one deck
    getone: async function (req, res) {
        var id = req.params.id;
        try{
            let Deck = await DeckModel.find({_id: id}).populate('questions').exec();
            if(req.verified._id !== Deck.createdBy && Deck.type === "PRIVATE"){
                return res.status(500).json({
                    message: 'Private decks can only be gotten by their creators',
                    error: err
                });
            }
            return res.status(200).json({message: "Deck gotten successfully!", data: Deck});
        }
        catch(err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },

    //Delete a deck
    delete: function (req, res) {
        var id = req.params.id;
        DeckModel.findByIdAndRemove(id, function (err) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting this Deck.',
                    error: err
                });
            }
            return res.json({message: "Deck deleted successfully"});
        });
    },

    //Get  deck by a particular user
    userdeck: async function (req, res) {
        try{
            let Deck = await DeckModel.find({createdBy: req.verified._id}).populate('questions').exec();
            return res.status(200).json({data: Deck});
        }
        catch(err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },

    //Get all public decks
    public: async function (req, res) {
        try{
            let alluserdecks = await DeckModel.find({type: "PUBLIC", status: "PUBLISHED"}).populate('questions').exec();
            return res.status(200).json({message:"All Public Decks", data: alluserdecks});
        }
        catch(err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },


}