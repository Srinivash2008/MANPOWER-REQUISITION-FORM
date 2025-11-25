const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Function to ensure a directory exists, creating it if it doesn't.
const ensureDir = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Define storage configuration for multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let uploadPath = 'uploads/mrf/'; // Base directory for MRF uploads

        // Subdirectory based on the field name
        if (file.fieldname === 'requestorSign') {
            uploadPath += 'requestor_signs/';
        } else if (file.fieldname === 'directorSign') {
            uploadPath += 'director_signs/';
        } else if (file.fieldname === 'rampUpFile') {
            uploadPath += 'ramp_up_files/';
        }

        ensureDir(uploadPath); // Ensure the directory exists
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create a unique filename to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize multer with the storage configuration
const mrfUpload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB file size limit
});

module.exports = mrfUpload;