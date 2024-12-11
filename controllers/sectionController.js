const mongoose = require('mongoose');
const Section = require('../models/Section');

// Get all sections for a specific page
exports.getAllSections = async (req, res) => {
    try {
        const { pageId, isArabic } = req.query;
        const sections = await Section.find({
            page: pageId,
        }).sort('order');

        res.status(200).json({
            success: true,
            data: sections
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get single section
exports.getSection = async (req, res) => {
    try {
        const { isArabic } = req.query;
        const section = await Section.findOne({
            _id: req.params.id
        }).populate('page', 'name slug');

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }
        res.status(200).json({
            success: true,
            data: section
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Create new section
exports.createSection = async (req, res) => {
    try {
        // Get the current highest order for the page
        const maxOrderSection = await Section.findOne({
            page: req.body.page,
            isArabic: req.body.isArabic || false
        })
            .sort('-order')
            .limit(1);

        const order = maxOrderSection ? maxOrderSection.order + 1 : 0;

        const section = await Section.create({
            ...req.body,
            order
        });

        res.status(201).json({
            success: true,
            data: section
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Update section
exports.updateSection = async (req, res) => {
    try {
        const section = await Section.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!section) {
            return res.status(404).json({
                success: false,
                error: 'Section not found'
            });
        }

        res.status(200).json({
            success: true,
            data: section
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Delete section
exports.deleteSection = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid Section ID"
            });
        }

        // Delete the section
        const deletedPage = await Section.findByIdAndDelete(id);

        if (!deletedPage) {
             
            return res.status(404).json({
                success: false,
                error: "Section not found"
            });
        }
 

        res.status(200).json({
            success: true,
            message: "section deleted successfully",
            data: ''

        })
    } catch (error) {
            console.error('Delete section error:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    };

    // Update section order
    exports.updateSectionOrder = async (req, res) => {
        try {
            const { sections } = req.body;

            for (const section of sections) {
                await Section.findByIdAndUpdate(section._id, { order: section.order });
            }

            res.status(200).json({
                success: true,
                message: 'Section order updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Server Error'
            });
        }
    };
