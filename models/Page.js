const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        // required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    metaTitle: String,
    metaDescription: String,
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create URL-friendly slug from name
pageSchema.pre('save', function (next) {
    console.log(this.name);
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    next();
});

module.exports = mongoose.model('Page', pageSchema);
