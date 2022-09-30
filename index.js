const AWS = require('aws-sdk');
const sharp = require('sharp');

const s3 = new AWS.S3();

exports.handler = async (event, context, done) => {
    const Bucket = event.Records[0].s3.bucket.name;
    const Key = event.Records[0].s3.object.key;
    const filename = Key.split('/')[Key.split('/').length - 1];

    const ext = Key.split('.')[Key.split('.').length - 1];
    const format = ext === 'jpg' ? 'jpeg' : ext; 

    try {
        const s3Object = await s3.getObject({ Bucket, Key }).promise(); 

        const resizedImage = await sharp(s3Object.Body) 
            .resize(600, 600, { fit: 'inside' })
            .toFormat(format)
            .toBuffer();

        await s3.putObject(
            { 
                Bucket,
                Key: `comment-resized/${filename}`,
                Body: resizedImage,
            }
        ).promise();

        return done(null, `comment-resized/${filename}`);
    } catch (error) {
        return done(error);
    }
};
