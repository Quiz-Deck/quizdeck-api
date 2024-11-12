var DeckModel = require('../models/DeckModel');
var UserModel = require('../models/UserModel');

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
                timer: req.body.timer,
                category: req.body.category
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
        var { id } = req.params;
        var { userId } = req.query;
    
        try {
            let deck = await DeckModel.findOne({ _id: id })
                .populate({
                    path: 'questions'
                })
                .populate({
                    path: 'createdBy',
                    select: 'userName email'
                })
                .populate({
                    path: 'deckGuests',
                    select: 'userName email'
                })
                .exec();
    
            if (!deck) {
                return res.status(404).json({
                    message: 'Deck not found'
                });
            }
    
            // Check if the deck is private and the user is neither the creator nor a guest
            if (deck.type === "PRIVATE" && userId.toString() !== deck.createdBy._id.toString() && !deck.deckGuests.some(guest => guest._id.toString() === userId.toString())) {
                return res.status(403).json({
                    message: 'Private decks can only be accessed by their creators or guests'
                });
            }
    
            // Get the count of likes the deck has received
            const likeCount = deck.likes.length;
            const userLiked = userId && deck.likes.length > 0 ? deck.likes.includes(userId) : false;
            deck = deck.toObject();
            delete deck.likes;
    
            return res.status(200).json({ message: "Deck gotten successfully!", data: { ...deck, likeCount, userLiked } });
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
        const { popular, category } = req.query;
        const page = parseInt(req.query.page) || 1; // Current page, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10
        let filter = { createdBy: userId };
        if (category) {
            filter.category = category;
        }

        let guestFilter = { createdBy: userId };
        if (category) {
            guestFilter .category = category;
        }

        try {
            // Query for decks created by the user
            let createdDecksQuery = DeckModel.find(filter)
                .populate({
                    path: 'questions'
                })
                .populate({
                    path: 'createdBy',
                    select: 'userName email'
                })
                .populate({
                    path: 'deckGuests',
                    select: 'userName email'
                });
    
            // Query for decks where the user is a guest
            let guestDecksQuery = DeckModel.find(guestFilter)
                .populate({
                    path: 'questions'
                })
                .populate({
                    path: 'createdBy',
                    select: 'userName email'
                })
                .populate({
                    path: 'deckGuests',
                    select: 'userName email'
                });

            
    
            // Apply sorting based on the query parameter
            if (popular) {
                createdDecksQuery.sort({ likeCount: -1 });
                guestDecksQuery.sort({ likeCount: -1 });
            } else {
                createdDecksQuery.sort({ updatedOn: -1 });
                guestDecksQuery.sort({ updatedOn: -1 });
            }
    
            // Fetch decks
            const createdDecks = await createdDecksQuery.exec();
            const guestDecks = await guestDecksQuery.exec();
    
            // Merge and remove duplicates
            let allDecks = [...createdDecks, ...guestDecks];
            const deckIds = new Set();
            allDecks = allDecks.filter(deck => {
                if (deckIds.has(deck._id.toString())) {
                    return false;
                }
                deckIds.add(deck._id.toString());
                return true;
            });
    
            // Count total number of documents matching the merged result
            const totalItems = allDecks.length;
    
            // Calculate total pages
            const totalPages = Math.ceil(totalItems / limit);
    
            // Ensure page number is within valid range
            if (page < 1 || page > totalPages) {
                return res.status(400).json({ message: 'Invalid page number' });
            }
    
            // Calculate the index of the first item in the current page
            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, totalItems);
    
            // Fetch a subset of the results based on pagination parameters
            const paginatedDecks = allDecks.slice(startIndex, endIndex).map(deck => {
                const userLiked = userId && deck.likes.length > 0 ? deck.likes.includes(userId) : false;
                const likeCount = deck.likes.length;
                deck = deck.toObject();
                delete deck.likes;
                return {
                    ...deck,
                    userLiked,
                    likeCount
                };
            });
    
            // Return paginated data along with pagination metadata
            return res.status(200).json({
                data: paginatedDecks,
                currPage: page,
                totalPages: totalPages,
                pageSize: paginatedDecks.length
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Error when getting Deck.',
                error: err
            });
        }
    },
    
    

    //Get all public decks
    public: async function (req, res) {
        const userId = req?.verified?._id;
        const { popular, category } = req.query;
        const page = parseInt(req.query.page) || 1; // Current page, default is 1
        const limit = parseInt(req.query.limit) || 10; // Number of items per page, default is 10

        let filter = { type: "PUBLIC", status: "PUBLISHED" };
        if (category) {
            filter.category = category;
        }
    
        try {
            let query = DeckModel.find(filter)
                .populate({
                    path: 'questions'
                })
                .populate({
                    path: 'createdBy',
                    select: 'userName email'
                })
                .populate({
                    path: 'deckGuests',
                    select: 'userName email'
                });
    
            if (popular) {
                query.sort({ likeCount: -1 });
            } else {
                query.sort({ updatedOn: -1 });
            }
    
            // Count total number of documents matching the query
            const totalItems = await DeckModel.countDocuments(filter);
    
            // Calculate total pages
            const totalPages = Math.ceil(totalItems / limit);
    
            // Ensure page number is within valid range
            if (page < 1 || page > totalPages) {
                return res.status(400).json({ message: 'Invalid page number' });
            }
    
            // Calculate the index of the first item in the current page
            const startIndex = (page - 1) * limit;
    
            // Fetch a subset of the results based on pagination parameters
            const allPublicDecks = await query.skip(startIndex).limit(limit).exec();
    
            // Iterate through each deck and check if the user has liked it
            const paginatedDecks = allPublicDecks.map(deck => {
                const userLiked = userId ? deck.likes.includes(new ObjectId(userId)) : false;
                const likeCount = deck.likes.length;
                deck = deck.toObject();
                delete deck.likes;
                return {
                    ...deck,
                    userLiked,
                    likeCount
                };
            });
    
            // Return paginated data along with pagination metadata
            return res.status(200).json({
                message: "All Public Decks",
                data: paginatedDecks,
                currPage: page,
                totalPages: totalPages,
                pageSize: paginatedDecks.length
            });
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
    },
    

    // Invite user to a deck
    inviteUser: async function (req, res) {
        const {email, deckId} = req.body
        try {
            // Ensure user exists and fetch their _id
            let user = await UserModel.findOne({ email });
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
        
            // Check if the user is the owner of the deck
            if (user._id.toString() === req.verified._id.toString()) {
                return res.status(400).json({ message: `You (${email}) own this deck. Owners cannot be guests.` });
            }
        
            // Update the deck to add user to deckGuests if not already present
            let updatedDeck = await DeckModel.findOneAndUpdate(
                { _id: deckId, deckGuests: { $ne: user._id } },
                { $addToSet: { deckGuests: user._id } },   
                { new: true }
            );
        
            if (!updatedDeck) {
                return res.status(404).json({ message: 'Error adding user to deck' });
            }
        
            return res.status(200).json({ message: 'Invite sent to user successfully!', deck: updatedDeck });
        } catch (error) {
            return res.status(500).json({ message: 'Error adding user to deck', error: error.message });
        }
        
    }
        
}