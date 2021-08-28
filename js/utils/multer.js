const multer = require('multer');
const path = require('path');
const config = require('../utils/config');

// const TMP_STORAGE_PATH = config.tmp_storage_path;
const FILE_SIZE_LIMIT = config.submission_constraints.max_file_upload_size;

const submissionFileOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!config.submission_constraints.compression_formats.includes(path.extname(file.originalname))) {
            return cb(new Error(`Acceptable file types: ${config.submission_constraints.compression_formats.toString()}`));
        }
        return cb(undefined, true);
    },
});

module.exports = {
    submissionFileOptions,
};