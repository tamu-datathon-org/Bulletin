const defaultConfig = {
    siteName: 'bulletin',
    submission_constraints: {
        max_participants: 4,
        image_formats: /\.(gif|jpe?g|tiff?|png|webp|bmp)$/i,
        markdown_formats: /\.(md)$/i,
        sourceCode_formats: /\.(zip|tar|tar(.gz)?)$/i,
        submission_upload_types: {
            sourceCode: 'sourceCode',
            icon: 'icon',
            markdown: 'markdown',
        },
        max_tags: 12,
        max_links: 12,
        max_file_upload_size: 1000 * 1000 * 30, // 30 Mb
        max_submission_photos: 3,
    },
    database: {
        name: 'bulletin',
        collections: {
            submissions: 'submissions',
            likes: 'likes',
            comments: 'comments',
            userSubmissionLinks: 'userSubmissionLinks',
            accolades: 'accolades',
            challenges: 'challenges',
            events: 'events',
        },
        bucket_name: 'fs',
        entryID_length: 24,
    },
    event: {
        fields: ['name', 'description', 'start_time', 'end_time'],
        imagePrefix: 'EVENT_IMAGE',
    },
    challenges: {
        imagePrefix: 'CHALLENGE_IMAGE',
        max_places: 3,
        place_emojis: {
            1: '🥇',
            2: '🥈',
            3: '🥉',
        },
    },
    redirect_url: 'https://tamudatathon.com/bulletin',
};

module.exports = defaultConfig;
