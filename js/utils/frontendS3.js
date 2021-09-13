const { S3 } = require('aws-sdk');

const bucketName = process.env.BULLETIN_FRONTEND_BUCKET || '';

const s3 = new S3({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.BULLETIN_BUCKET_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.BULLETIN_BUCKET_SECRET_ACCESS_KEY || '',
    },
});

const uploadFile = async (filename, buffer) => {
    const uploadParams = {
        Bucket: bucketName,
        Body: buffer,
        Key: `${filename}_${Date.now()}`,
    };
    return s3.upload(uploadParams).promise();
};

const getFileStream = async (fileKey) => {
    const downloadParams = {
        Key: fileKey,
        Bucket: bucketName,
    };
    return s3.getObject(downloadParams).createReadStream();
};

const removeFile = async (fileKey) => {
    const deleteParams = {
        Key: fileKey,
        Bucket: bucketName,
    };
    return s3.deleteObject(deleteParams).promise();
};

module.exports = {
    uploadFile,
    getFileStream,
    removeFile,
};