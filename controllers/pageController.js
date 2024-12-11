const mongoose = require('mongoose');
const Page = require('../models/Page');
const Section = require('../models/Section');

// Get all pages with their sections
exports.getAllPages = async (req, res) => {
    try {
        const { isArabic } = req.query;
        const pages = await Page.find()
            .sort('order')
            .lean(); // Use lean for better performance

            
        // Populate sections manually for each page
        const populatedPages = await Promise.all(
            pages.map(async (page) => {
                let query = { page: page._id, isActive: true };
                
                if (isArabic) {
                    query.isArabic = true;
                } else {
                    query.$or = [
                        { isArabic: false },
                        { isArabic: { $exists: false } }
                    ];
                }
                const sections = await Section.find(query).sort('order').lean();
                console.log(`Sections for page ${page._id}:`, sections);
                return { ...page, sections }; // Attach sections to the page
            })
        );

        res.status(200).json({
            success: true,
            data: populatedPages,
        });
    } catch (error) {
        console.error('Error fetching all pages:', error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};


// Get a single page with its sections
exports.getPage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id).lean();

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Page not found',
            });
        }

        // Fetch associated sections
        const sections = await Section.find({ page: page._id, isActive: true }).sort('order').lean();
        console.log(`Sections for single page ${page._id}:`, JSON.stringify(sections, null, 2));

        res.status(200).json({
            success: true,
            data: {
                ...page,
                sections,
            },
        });
    } catch (error) {
        console.error('Error fetching page:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error',
        });
    }
};


// Create new page
exports.createPage = async (req, res) => {
    try {
        const page = await Page.create(req.body);
        res.status(201).json({
            success: true,
            data: page
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Page with this slug already exists'
            });
        }
        console.log(error);
        res.status(500).json({
            success: false,
            error: error
        });
    }
};

// Update page
exports.updatePage = async (req, res) => {
    try {
        const page = await Page.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!page) {
            return res.status(404).json({
                success: false,
                error: 'Page not found'
            });
        }

        res.status(200).json({
            success: true,
            data: page
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                error: 'Page with this slug already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete page and its sections
exports.deletePage = async (req, res) => {
    try {
        const { id } = req.params;
    
        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ 
                success: false, 
                error: "Invalid Page ID" 
            });
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Delete all sections associated with this page
            const deletedSections = await Section.deleteMany({ page: id }, { session });
            console.log(`Deleted ${deletedSections.deletedCount} sections`);

            // Delete the page
            const deletedPage = await Page.findByIdAndDelete(id, { session });
            
            if (!deletedPage) {
                await session.abortTransaction();
                return res.status(404).json({ 
                    success: false, 
                    error: "Page not found" 
                });
            }

            // Commit the transaction
            await session.commitTransaction();
            
            res.status(200).json({ 
                success: true, 
                message: "Page and associated sections deleted successfully",
                data: {
                    page: deletedPage,
                    sectionsDeleted: deletedSections.deletedCount
                }
            });
        } catch (error) {
            // If anything fails, abort the transaction
            await session.abortTransaction();
            throw error;
        } finally {
            // End the session
            session.endSession();
        }
    } catch (error) {
        console.error('Delete page error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
};

// Update page order
exports.updatePageOrder = async (req, res) => {
    try {
        const { pages } = req.body;

        for (const page of pages) {
            await Page.findByIdAndUpdate(page._id, { order: page.order });
        }

        res.status(200).json({
            success: true,
            message: 'Page order updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
