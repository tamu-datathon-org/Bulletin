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

const submissionPhotoOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!config.submission_constraints.image_formats.test(file.originalname)) {
            return cb(new Error('Photo does not have an acceptable extension'));
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
        if (!config.submission_constraints.image_formats.test(file.originalname)) {
            return cb(new Error('Icon does not have an acceptable extension'));
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
        if (!config.submission_constraints.markdown_formats.test(file.originalname)) {
            return cb(new Error('Markdown does not have an acceptable extension'));
        }
        return cb(undefined, true);
    },
});

const submissionSourceCodeOptions = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: FILE_SIZE_LIMIT,
    },
    fileFilter(req, file, cb) {
        if (!config.submission_constraints.sourceCode_formats.test(file.originalname)) {
            return cb(new Error('SourceCode does not have an acceptable extension'));
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
    submissionPhotoOptions,
    submissionIconOptions,
    submissionMarkdownOptions,
    submissionSourceCodeOptions,
    adminUploadOptions,
};