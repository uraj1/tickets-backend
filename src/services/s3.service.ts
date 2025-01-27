import AWS from "aws-sdk";
import * as dotenv from "dotenv";

dotenv.config();

const region = process.env.AWS_REGION || "ap-south-1";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";

AWS.config.update({
  region: region,
  credentials: new AWS.Credentials(accessKeyId, secretAccessKey),
});

const s3 = new AWS.S3();

export const uploadToS3 = async (
  bucketName: string,
  fileBuffer: Buffer,
  fileName: string,
  mimetype: string,
  folder?: string
): Promise<string> => {
  try {
    const key = folder
      ? `${folder}/${fileName}.${mimetype.split('/')[1]}`
      : `${fileName}.${mimetype.split('/')[1]}`;

    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: "public-read",
    };

    const uploadResult = await s3.upload(params).promise();

    return uploadResult.Location;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
};