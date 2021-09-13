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
        return cb(undefined, true);
    },
});

const submissionPhotosOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!config.submission_constraints.photo_compression_formats.includes(path.extname(file.originalname))) {
            return cb(new Error(`Acceptable file types: ${config.submission_constraints.photo_compression_formats.toString()}`));
        }
        return cb(undefined, true);
    },
});

const submissionIconOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!config.submission_constraints.icon_compression_formats.includes(path.extname(file.originalname))) {
            return cb(new Error(`Acceptable file types: ${config.submission_constraints.icon_compression_formats.toString()}`));
        }
        return cb(undefined, true);
    },
});

const submissionMarkdownOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!config.submission_constraints.icon_compression_formats.includes(path.extname(file.originalname))) {
            return cb(new Error(`Acceptable file types: ${config.submission_constraints.markdown_formats.toString()}`));
        }
        return cb(undefined, true);
    },
});

const adminUploadOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!['.png', '.jpg'].includes(path.extname(file.originalname))) {
            return cb(new Error('Acceptable file types: .png & .jpg'));
        }
        return cb(undefined, true);
    },
});

module.exports = {
    submissionFileOptions,
    submissionPhotosOptions,
    submissionIconOptions,
    submissionMarkdownOptions,
    adminUploadOptions,
};