const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware, uploadImage } = require('../controllers/uploadController');

// Controllers
const {
    getAllSections,
    getSection,
    createSection,
    updateSection,
    deleteSection,
    updateSectionOrder
} = require('../controllers/sectionController');

const {
    register,
    login,
    getMe,
    updateUser
} = require('../controllers/userController');

const {
    getAllPages,
    getPage,
    createPage,
    updatePage,
    deletePage,
    updatePageOrder
} = require('../controllers/pageController');

// Upload routes
router.post('/upload', protect, uploadMiddleware, uploadImage);

// Page routes
router.route('/pages')
    .get(getAllPages)
    .post(protect, createPage);

router.route('/pages/:id')
    .get(protect, getPage)
    .put(protect, authorize('admin'), updatePage)
    .delete(protect, authorize('admin'), deletePage);
 
router.put('/pages/order', protect, authorize('admin'), updatePageOrder);

// Section routes
router.route('/sections')
    .get(getAllSections)
    .post(protect, authorize('admin', 'editor'), createSection);

router.route('/sections/:id')
    .get(getSection)
    .put(protect, authorize('admin', 'editor'), updateSection)
    .delete(protect, authorize('admin', 'editor'), deleteSection);

router.put('/sections/order', protect, authorize('admin', 'editor'), updateSectionOrder);

// Auth routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.put('/auth/update', protect, updateUser);

module.exports = router;
