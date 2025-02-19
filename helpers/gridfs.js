const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
var uniqid = require("uniqid");
const { PassThrough } = require('stream');
const mime = require('mime-types');
const { saveConfig, getConfig } = require('./config')

module.exports.doUpload = async (image_file, folderName) => {
  try {
    const DB_NAME = process.env.DATABASE_NAME
    const BUCKET_NAME  = "images";

    // MongoDB client connection
    const client = new MongoClient(process.env.MONGODB_URL);
    await client.connect();

    const db = client.db(DB_NAME);
    const bucket = new GridFSBucket(db, {
      chunkSizeBytes: 256 * 1024,
      bucketName: BUCKET_NAME,
    });

    const originalFilename = image_file.name; 
    const uniqueFilename = uniqid()+'.'+originalFilename.split('.')[1];

    // Creating a folder path within the bucket
    const folderPath = folderName ? `${folderName}/` : '';
    const filePath = folderPath + uniqueFilename; 

    // Stream pipeline for efficient upload
    const fileStream = new PassThrough();
    fileStream.end(image_file.data);

    const currentTimestamp = new Date();

    const uploadStream = bucket.openUploadStream(filePath);

    // Upload promise that resolves when upload is finished
    const uploadPromise = new Promise((resolve, reject) => {
      fileStream.pipe(uploadStream)
        .on('finish', () => {
          console.log("Upload complete. Image path:", filePath);  // Log the full path (with folder name)
          resolve(filePath);  // Resolve with the full image path
        })
        .on('error', (err) => {
          console.log('Upload error:', err);
          reject(err);  // Reject on error
        });
    });

    const fileId = await uploadPromise;

    // Update the top-level fields in the files collection
    var imageData = await db.collection(`${BUCKET_NAME}.files`).findOneAndUpdate(
      { filename: fileId },
      {
        $set: {
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        },
      }
    );

    await db.collection(`${BUCKET_NAME}.chunks`).updateMany(
      { files_id: mongoose.Types.ObjectId(imageData.value._id) },
      {
        $set: { createdAt: currentTimestamp,
          updatedAt: currentTimestamp, },
      }
    );

    const imagePath = await uploadPromise;
    client.close();
    return imagePath;
  } catch (err) {
    console.log('Error:', err);
    throw new Error('Internal Server Error');
  }
};


module.exports.getUpload =async (filename, req, res,) => {
    try {
      
      const DB_NAME = process.env.DATABASE_NAME
      const BUCKET_NAME  = "images";
      const COLLECTION_NAME = BUCKET_NAME+'.files'

      const client = new MongoClient(process.env.MONGODB_URL);
      await client.connect();

      const db = client.db(DB_NAME);
      const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

      // Find the file in GridFS by its filename
      const files = await db.collection(COLLECTION_NAME).aggregate([
        { $match: { filename } }
      ]).toArray();

      if (files.length === 0) {
        return res.status(404).send('File not found');
      }

      const file = files[0]; // The first matching file (assuming filenames are unique)

      // Create a download stream
      const downloadStream = bucket.openDownloadStream(file._id);

      var contentType = mime.lookup(file.filename) || 'application/octet-stream';
      console.log("sdadasdasd",contentType)

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
      
      // Pipe the file from GridFS to the response
      downloadStream.pipe(res);

      downloadStream.on('end', () => {  
          console.log('File downloaded successfully');
          client.close();
      });

      downloadStream.on('error', (err) => {
          console.log('Error downloading file:', err);
          client.close();
          return err
      });

    } catch (err) {
      console.log('Error:', err);
      return err
    }
}

module.exports.doDelete = async (filename, req, res) => {
    try {

      const DB_NAME = process.env.DATABASE_NAME;
      const BUCKET_NAME  = "images";
      const COLLECTION_NAME = BUCKET_NAME+'.files'

      const client = new MongoClient(process.env.MONGODB_URL);
      await client.connect();

      const db = client.db(DB_NAME);

      const [files] = await db.collection(COLLECTION_NAME).aggregate([
        { $match: { filename } }
      ]).toArray();

      if(!files){
        return res.status(404).send('File not found');
      }

      const fileId = files._id; // The file ID to delete, passed as a URL parameter

      // Validate the provided ObjectId
      if (!ObjectId.isValid(fileId)) {
        return res.status(400).send('Invalid file ID');
      }

      const objectId = new ObjectId(fileId);

      // Delete the file metadata
      const deleteFileResult = await db.collection(`${COLLECTION_NAME}`).deleteOne({ _id: objectId });

      // Delete the file chunks
      const deleteChunksResult = await db.collection(`${BUCKET_NAME}.chunks`).deleteMany({ files_id: objectId });

      console.log(
        `File deleted successfully: ${deleteFileResult.deletedCount} metadata and ${deleteChunksResult.deletedCount} chunks`
      );

      client.close();
      return res
    } catch (err) {
      console.error('Error:', err);
      return err
    }
}