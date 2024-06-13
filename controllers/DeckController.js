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
                timer: req.body.timer
            });
            Deck.save()
            .then(deck =>{
                if(deck){
                    return res.status(201).json({ message: 'Deck created successfully', data: Deck }); 
                }
            })
            .catch(error => {
                return res.status(500).json({
                    message: 'Error when creating Deck',
                    error: error
                });
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
        DeckModel.findOne({ _id: id })
        .then((deck)=>{
            if (!deck) {
                return res.status(404).json({
                    message: 'Deck does not exist'
                });
            }
    
            if (req.verified._id.toString() !== deck.createdBy.toString() && deck.type === "PRIVATE") {
                return res.status(500).json({
                    message: 'Private decks can only be edited by creator'
                });
            }
            deck.title = req.body.title || deck.title;
            deck.description = req.body.description || deck.description;
            deck.type = req.body.type || deck.type;
            deck.updatedBy = req.verified._id;
            deck.status = req.body.status || deck.status;
            deck.deckGuests = req.body.deckGuests || deck.deckGuests;
            deck.timer = req.body.timer || deck.timer;
            
            deck.save()
            .then((updatedDeck)=>{
                return res.json({ message: "Deck updated successfully", data: updatedDeck });
            })
            .catch((saveError)=>{
                return res.status(500).json({
                    message: 'Error when updating Deck.',
                    error: saveError
                });
            });
            
        })
        .catch((findError)=>{
            return res.status(500).json({
                message: 'Error when getting Deck',
                error: findError
            });
        });
    },
    

    //Get one deck
    getone: async function (req, res) {
        var {id} = req.params;
        var {userId} = req.query;
        try {
            let Deck = await DeckModel.findOne({ _id: id })
            .populate({
                path: 'questions'
            })
            .populate({
                path: 'createdBy',
                select: 'userName email'
            })
            .exec();

            if (!Deck) {
                return res.status(404).json({
                    message: 'Deck not found'
                });
            }
            if (Deck.type === "PRIVATE" && userId.toString() !== Deck.createdBy.toString()) {
                return res.status(403).json({
                    message: 'Private decks can only be accessed by their creators'
                });
            }

            // Get the count of likes the deck has received
            const likeCount = Deck.likes.length;
            const userLiked = Deck.likes.includes(userId);

            Deck = Deck.toObject();
            delete Deck.likes;


            return res.status(200).json({ message: "Deck gotten successfully!", data: { ...Deck, likeCount, userLiked } });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },

    

    //Delete a deck
    delete: async function (req, res) {
        try {
            var id = req.params.id;
            const deletedDeck = await DeckModel.findOneAndDelete({ _id: id });
            if (!deletedDeck) {
                return res.status(404).json({
                    message: 'Deck not found'
                });
            }
            return res.json({ message: "Deck deleted successfully" });
        } catch (error) {
            return res.status(500).json({
                message: 'Error when deleting this Deck.',
                error: error
            });
        }
    },
    
    //Get  deck by a particular user
    userdeck: async function (req, res) {
        const userId = req?.verified?._id;
        try {
            let allUserDecks = await DeckModel.find({ createdBy: req.verified._id })
            .populate({
                path: 'questions'
            })
            .populate({
                path: 'createdBy',
                select: 'userName email'
            })
            .sort({ updatedOn: -1 })
            .exec();
           allUserDecks =allUserDecks.map(deck => {
                const userLiked = deck.likes.includes(userId);
                const likeCount = deck.likes.length;
                deck = deck.toObject();
                delete deck.likes;
                return {
                    ...deck,
                    userLiked,
                    likeCount
                };
            });
            return res.status(200).json({ data: allUserDecks });
        }
        catch (err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },

    //Get all public decks
    public: async function (req, res) {
        const userId = req?.verified?._id;
        try {
            let allPublicDecks = await DeckModel.find({ type: "PUBLIC", status: "PUBLISHED" })
            .populate({
                path: 'questions'
            })
            .populate({
                path: 'createdBy',
                select: 'userName email'
            })
            .sort({ updatedOn: -1 })
            .exec();


            // Iterate through each deck and check if the user has liked it
            allPublicDecks = allPublicDecks.map(deck => {
                const userLiked = userId ? deck.likes.includes(userId) : false;
                const likeCount = deck.likes.length;
                deck = deck.toObject();
                delete deck.likes;
                return {
                    ...deck,
                    userLiked,
                    likeCount
                };
            });

            return res.status(200).json({ message: "All Public Decks", data: allPublicDecks });
        }
        catch (err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },

    // Like or unlike a deck
    toggleLike: async function (req, res) {
        try {
            const deckId = req.params.deckId;
            const userId = req.verified._id;

            let deck = await DeckModel.findById(deckId);
            if (!deck) {
                return res.status(404).json({ message: 'Deck not found' });
            }

            // Check if the user has already liked the deck
            const index = deck.likes.indexOf(userId);
            if (index === -1) {
                // User hasn't liked the deck, so add their ID to the likes array
                deck.likes.push(userId);
                await deck.save();
                return res.status(200).json({ message: 'Deck liked successfully' });
            } else {
                // User has already liked the deck, so remove their ID from the likes array
                deck.likes.splice(index, 1);
                await deck.save();
                return res.status(200).json({ message: 'Deck unliked successfully' });
            }
        } catch (error) {
            return res.status(500).json({ message: 'Error processing request', error: error });
        }
    },

    // Play deck
    playDeck: async function (req, res) {
        try {
            const deckId = req.params.deckId;
            const userId = req.verified._id;
    
            let deck = await DeckModel.findById(deckId);
            if (!deck) {
                return res.status(404).json({ message: 'Deck not found' });
            }
            
            deck.playCount++;
            await deck.save();
    
            return res.status(200).json({ message: 'Deck play count incremented successfully' });
        } catch (error) {
            return res.status(500).json({ message: 'Error playing a deck', error: error.message });
        }
    }
    

}