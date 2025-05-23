import { S3Client} from "@aws-sdk/client-s3";

const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.BUCKET_ACCESS_KEY
const secretKey = process.env.BUCKET_SECRET_KEY

export const s3 = new S3Client({
    credentials:{
        accessKeyId: accessKey,
        secretAccessKey: secretKey
    },
    region: bucketRegion
})







