const multer = require('multer');
const path = require('path');

// Store in memory to easily convert to MongoDB if that's the goal, 
// OR store on disk and save path in MongoDB. 
// Given the user said "saving photo in mongo", we'll store as Buffer/Base64 in the DB 
// but use Multer to handle the multipart/form-data.

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|webp/;
        const mimeType = fileTypes.test(file.mimetype);
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimeType && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpeg, jpg, png, webp) are allowed!'));
    }
});

module.exports = upload;