const defaultConfig = {
    siteName: 'Bulletin',
    submission_constraints: {
        max_participants: 5,
        compression_formats: ['.tar', '.zip'],
        start_time: null,
        end_time: null,
    },
    database: {
        url: null,
        database_name: 'bulletin',
        collection_names: {
            submissions: 'submissions',
        },
    },
};

const addConfigData = () => {
    defaultConfig.submission_constraints.start_time = (new Date('16 October 2021 12:00 UTC')).toISOString();
    defaultConfig.submission_constraints.end_time = (new Date('17 October 2021 12:00 UTC')).toISOString();
    return defaultConfig;
};

module.exports = addConfigData();
