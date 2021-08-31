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
        submission_fields: [{
            field: 'title',
            description: 'The name of the submission',
            type: 'String',
            required: true,
        }, {
            field: 'users',
            description: 'Discord tags of the people in the group',
            type: 'List<String>',
            required: true,
        }, {
            field: 'challenges',
            description: 'Names of the challenge(s) name(s) that this submission if for',
            type: 'List<String>',
            required: false,
        }, {
            field: 'links',
            description: 'Links associated with this submission ie. Github, Google Collab, etc.',
            type: 'List<String>',
            required: false,
        }, {
            field: 'tags',
            description: 'Tags that help people find this submission ie. \'Image Recognition\', \'Django\', etc.',
            type: 'List<String>',
            required: false,
        }],
        submission_queries: [{
            field: 'titles',
            description: 'Title(s) of the submission(s)',
            type: 'List<String>',
        }, {
            field: 'users',
            description: 'Discord Tags of the people that submitted',
            type: 'List<String>',
        }, {
            field: 'timespan',
            description: 'Time interval that the submissions were submitted, ie. [2020-07-25T04:45:07, 2020-07-25T07:45:07]',
            type: 'List<ISOString>',
        }, {
            field: 'links',
            description: 'Links that submission(s) contained',
            type: 'List<String>',
        }, {
            field: 'challenges',
            description: 'Names of challenges that submission(s) entered',
            type: 'List<String>',
        }, {
            field: 'tags',
            description: 'Tags that submission(s) included',
            type: 'List<String>',
        }, {
            field: 'numComments',
            description: 'Number of comments (or more) that submission(s) have',
            type: 'Integer',
        }, {
            field: 'numLikes',
            description: 'Number of likes (or more) that submission(s) have',
            type: 'Integer',
        }],
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
