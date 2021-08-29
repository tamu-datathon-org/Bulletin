const os = require('os');

const defaultConfig = {
    siteName: 'bulletin',
    submission_constraints: {
        max_participants: 5,
        compression_formats: ['.tar', '.zip'],
        photo_compression_formats: ['.zip'],
        icon_compression_formats: ['.jpg', '.png'],
        start_time: null,
        end_time: null,
        max_tags: 12,
        max_file_upload_size: 1000 * 1000 * 30, // 30 Mb
        submission_fields: ['title', 'names', 'challenges', 'links', 'tags'],
        submission_queries: ['titles', 'entryID', 'names', 'timespan', 'links', 'challenges', 'tags', 'numComments', 'numLikes'],
    },
    database: {
        url: null,
        name: 'bulletin',
        collections: {
            submissions: 'submissions',
        },
        bucket_name: 'fs',
        entryID_length: 24,
    },
    tmp_download_path: null,
};

const addConfigData = () => {
    defaultConfig.submission_constraints.start_time = (new Date('16 October 2021 12:00 UTC')).toISOString();
    defaultConfig.submission_constraints.end_time = (new Date('17 October 2021 12:00 UTC')).toISOString();
    defaultConfig.tmp_download_path = os.tmpdir();
    return defaultConfig;
};

module.exports = addConfigData();
