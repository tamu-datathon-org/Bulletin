const os = require('os');

const defaultConfig = {
    siteName: 'bulletin',
    submission_constraints: {
        max_participants: 5,
        source_code_formats: ['.tar', '.zip'],
        photo_formats: ['.zip'],
        icon_formats: ['.jpg', '.png'],
        markdown_formats: ['.md'],
        submission_upload_types: {
            sourceCode: 'sourceCode',
            photos: 'photos',
            icon: 'icon',
            markdown: 'markdown',
        },
        start_time: null,
        end_time: null,
        max_tags: 12,
        max_links:  12,
        max_file_upload_size: 1000 * 1000 * 30, // 30 Mb
        submission_fields: ['title', 'users', 'challenges', 'links', 'tags', 'sourceCodeFile', 'iconFile', 'photosFile', 'markdownFile'],
        submission_queries: ['submissionId', 'titles', 'users', 'timespan', 'links', 'challenges', 'tags', 'numComments', 'numLikes'],
    },
    database: {
        name: 'bulletin',
        collections: {
            submissions: 'submissions',
            likes: 'likes',
            comments: 'comments',
            userSubmissionLinks: 'user-submission-links',
            accolades: 'accolades',
            challenges: 'challenges',
        },
        bucket_name: 'fs',
        entryID_length: 24,
    },
    tmp_download_path: null,
    redirect_url: 'https://tamudatathon.com/',
};

const addConfigData = () => {
    defaultConfig.submission_constraints.start_time = (new Date('16 October 2021 12:00 UTC')).toISOString();
    defaultConfig.submission_constraints.end_time = (new Date('17 October 2021 12:00 UTC')).toISOString();
    defaultConfig.tmp_download_path = os.tmpdir();
    return defaultConfig;
};

module.exports = addConfigData();
