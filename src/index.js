import 'dotenv/config'
import express from "express"
import { dirname, join } from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import upload from "./util/multer.js";
import fileAndKeyValidator from "./util/fileValidator.js";
import errorHandler from "./util/errorHandler.js";
import { v4 as uuidv4 } from 'uuid';
import { s3 } from "./util/aws.js";
import logger from './util/logging.js';
import { checkDbSize, updateDbSize } from './util/db.js';



const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + '/public'));
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

var whitelist = ["https://kirsty-and-niall.love"]

const  corsOptions = {
    origin: function (origin, callback){

        if(whitelist.indexOf(origin) !== -1 )
        {
            callback(null,true);
        }
        else
        {
            callback(new Error("Not allowed by CORS"));
        }
    },
    method: ['GET','POST'],
    credential: true
};

app.options('*', cors(corsOptions));


app.get("/", (req,res) => { 
    const __dirname = dirname(fileURLToPath(import.meta.url));
    res.sendFile(join(__dirname, 'index.html'));
});


app.get("/idgen", (req,res) => {
    let uuid = uuidv4()
    const id = uuid.slice(0,6)
    res.status(200).json({id})
})



app.post("/smalluploads3",cors(corsOptions), upload.single('file'), async (req, res) => {
 
    try {
       console.log("/////////////////////////////////////////////// SMALL Started //////////////////////////////////////////////////////")
       await checkDbSize()
       let err = fileAndKeyValidator(req, "single")
       if(err)
       {
        throw err
       }

       const bucketName = process.env.BUCKET_NAME

       const params = {
            Bucket: bucketName,
            Key: `${req.body.id}-${req.file.originalname}`,
            ContentType: req.file.mimetype
       }
       const command = new PutObjectCommand(params);

       let url = await getSignedUrl(s3,command, {expiresIn: 3600 })
       if(!url)
        {
            throw new Error("wasn't able to get presigned url");
        }
        let a = await fetch(url,{method: 'PUT', body: req.file.buffer, headers: { 'Content-Type':req.file.mimetype}})
        if(!a.ok)
        {
            throw new Error("wasn't able to upload file")
        }
        logger({status: 200, message:"File was successfully uploaded", id:req.body.id, file: req.file.originalname},"main")
        console.log("/////////////////////////////////////////////// SMALL Uploaded //////////////////////////////////////////////////////")
        await updateDbSize(req.body.id,req.file.size,req.file.originalname)
        res.status(200).json({message: `File was successfully uploaded`});
    } catch (error) {
        let returnErr = errorHandler(error) // need to sort out
        logger({status: error.status, message:error.message, id:req.body.id, file: req.file.originalname},"error")
        res.status(error.status).json({error: error, message: error.message, passKeyFailed: error.passKeyFailed})
    }
})






app.post("/startMultipartUpload",cors(corsOptions), async (req, res) => {
    try {
       console.log("/////////////////////////////////////////////// START MULTIPART //////////////////////////////////////////////////////")
       await checkDbSize()
       let err = fileAndKeyValidator(req, "multipartStart")
       if(err)
       {
        throw err
       }

        let key = req.body.name
        const bucketName = process.env.BUCKET_NAME

        const params = {
            Bucket: bucketName,
            Key: `${req.body.id}-${key}`,
        }

        const command = new CreateMultipartUploadCommand(params)
        const multipartUpload = await s3.send(command);
        if(multipartUpload['$metadata'].httpStatusCode === 200)
        {
            res.status(200).json({message: `Files were successfully uploaded`, data: "", uploadId: multipartUpload.UploadId})
        }
        else
        {
            let err = new Error("Files failed to uploaded")
            err.status = 503
            throw err
        }
    } catch (error) {
        let returnErr = errorHandler(error) // need to sort out
        res.status(error.status).json({error: error, message: error.message, passKeyFailed: error.passKeyFailed})
    }
})


app.post("/uploadpartss3",cors(corsOptions), upload.single('file'), async (req, res) => {
    try {
        console.log("/////////////////////////////////////////////// MULTIPART Upload //////////////////////////////////////////////////////")
        let err = fileAndKeyValidator(req, "multipart")
        if(err)
        {
            throw err
        }
        const bucketName = process.env.BUCKET_NAME

        const params = {
            Bucket: bucketName,
            Key: `${req.body.id}-${req.body.name}`,
            UploadId: req.body.uploadId,
            PartNumber: req.body.partNumber,
        }
        
        const command = new UploadPartCommand(params)

        let url = await getSignedUrl(s3,command, {expiresIn: 3600 })
        if(!url)
        {
            let err =  new Error("wasn't able to get presigned url");
            err.status = 503
            throw err
        }
        let resa = await fetch(url,{method: 'PUT', body: req.file.buffer, headers: { 'Content-Type':req.file.mimetype}})
        if(resa.status === 200)
        {
            const Etag = resa.headers.get('ETag')
            res.status(200).json({message: `Files were successfully uploaded`, data: "", Etag})
        }
        else
        {
            let err =  new Error("failed to upload");
            err.status = 400
            throw err
        }
    } catch (error) {
        let returnErr = errorHandler(error) // need to sort out
        res.status(error.status).json({error: error, message: error.message, passKeyFailed: error.passKeyFailed})
    }
})


app.post("/finishMultipartUpload",cors(corsOptions), upload.single('file'), async (req, res) => {
    try {
        console.log("/////////////////////////////////////////////// MULTIPART End //////////////////////////////////////////////////////")
        let err = fileAndKeyValidator(req, "multipartEnd")
        if(err)
        {
            throw err
        }
        let Parts = []
        for(let i = 0; i < req.body.ETag.length; i++)
        {
            Parts.push({ETag: req.body.ETag[i], PartNumber: req.body.PartNumber[i]})
        }
        const bucketName = process.env.BUCKET_NAME
        const params = {
            Bucket: bucketName,
            Key: `${req.body.id}-${req.body.name}`,
            UploadId: req.body.uploadId,
            MultipartUpload: { Parts: Parts}
        }
    
        const command = new CompleteMultipartUploadCommand(params);

        let resa = await s3.send(command)
        if(resa['$metadata'].httpStatusCode === 200)
        {
            await updateDbSize(req.body.id,req.body.size,req.body.name)
            res.status(200).json({message: `Files were successfully uploaded`})
        }
        else
        {
            let err =  new Error("failed to upload file");
            err.status = 501
            throw err
        }
        


    } catch (error) {
        let returnErr = errorHandler(error) // need to sort out
        res.status(error.status).json({error: error, message: error.message, passKeyFailed: error.passKeyFailed})
    }
})

app.post("/abortMultipartUpload",cors(corsOptions), upload.single('file'), async (req, res) => {
    try {
        console.log("/////////////////////////////////////////////// MULTIPART Aborted //////////////////////////////////////////////////////")
        let err = fileAndKeyValidator(req, "multipartEnd")
        if(err)
        {
            throw err
        }
        const bucketName = process.env.BUCKET_NAME
        const params = {
            Bucket: bucketName,
            Key: `${req.body.id}-${req.body.name}`,
            UploadId: req.body.uploadId,
        }
    
        const command = new AbortMultipartUploadCommand(params);

        let resa = await s3.send(command)
        if(resa['$metadata'].httpStatusCode === 204){
            logger({status: 204, message:"MultipartUpload was aborted", id:req.body.id, file: req.body.name},"error")
            res.status(204).json({message: `MultipartUpload was aborted`, data: ""})
        }
        else
        {
            let err = new Error("Abort failed")
            err.status = 500
            throw err
        }
    } catch (error) {
        let returnErr = errorHandler(error) // need to sort out
        res.status(error.status).json(error)
    }
})




app.use((err,req,res,next) => {
  console.error('An error occurred:');
  console.error('Status:', err.status);
  console.error('Message:', err.message);

  if(err.status === 413)
  {
    res.status(413).json({error:"Media was too large", message: "Media was too large", passKeyFailed: "false"});
  }
  if(err.status === 415)
  {
      res.status(415).json({error:err.message, message: err.message, passKeyFailed: "false"});
  }
  next()
})


app.listen("3000" ,() =>{
    console.log("running on 3000")
})
