var CategoryModel = require('../models/CategoryModel');

module.exports = {

    //Create a category
    create: async function (req, res) {
        if (!req.body.title) {
            return res.status(400).json({ message: "Category name is required" });
        }
        //TODO: check if category already exists
        try {
            var Category = new CategoryModel({
                createdBy: req.verified._id,
                title: req.body.title,
                isActive: true,
                createdOn: new Date()
            });
            Category.save()
            .then(Category =>{
                if(Category){
                    return res.status(201).json({ message: 'Category created successfully', data: Category }); 
                }
            })
            .catch(error => {
                return res.status(500).json({
                    message: 'Error when creating Category',
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


    //Delete a category
    delete: function (req, res) {
        var id = req.params.id;
        CategoryModel.findByIdAndDelete(id)
            .then((category) => {
                if (!category) {
                    return res.status(404).json({
                        message: 'Category not found'
                    });
                }
                return res.json({ message: "Category deleted successfully" });
            })
            .catch((err) => {
                return res.status(500).json({
                    message: 'Error when deleting this Category.',
                    error: err
                });
            });
    },
    

    //Get all categories
    list: async function (req, res) {
        try {
            // Fetch all categories
            const categories = await CategoryModel.find();
    
            // Extract titles as an array of strings
            const categoryTitles = categories.map(category => category.title);
    
            // Return all category titles
            return res.status(200).json({
                message: "All Categories",
                data: categoryTitles,
            });
        } catch (err) {
            // Handle any errors
            return res.status(500).json({
                message: 'Error when fetching categories',
                error: err.message || err, // Provide detailed error message
            });
        }
    }

}