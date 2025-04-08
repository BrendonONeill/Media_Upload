import express from "express"
import { dirname, join } from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors'
import 'dotenv/config'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3 } from "./util/aws.js";
import upload from "./util/multer.js";

const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.options('*', cors());

app.post("/smalluploads3", upload.single('file'), async (req, res) => {

    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(acceptedPasskey)
    {
        const bucketName = process.env.BUCKET_NAME

        const params = {
            Bucket: bucketName,
            Key: req.file.originalname,
            ContentType: req.file.mimetype
        }
        const command = new PutObjectCommand(params);
        try {
            let url = await getSignedUrl(s3,command, {expiresIn: 3600 })
            if(!url)
            {
                throw new Error("wasn't able to get presigned url");
            }
            let a = await fetch(url,{method: 'PUT', body: req.file.buffer, headers: { 'Content-Type':req.file.mimetype}})
            res.status(200).json({message: `Files were successfully uploaded`, data: ""});
            
        } catch (error) {
            res.status(400).json({error, message: "failed to upload"})
        }  
    }
    else
    {
        res.status(401).json({error:"access was denied",message: "Passkey was incorrect, Please try again."})
    }
})

app.post("/startMultipartUpload", async (req, res) => {

    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(acceptedPasskey)
    {
    console.log("/////////////////////////////////////////////// START //////////////////////////////////////////////////////")
        let key = req.body.name
        const bucketName = process.env.BUCKET_NAME

        const params = {
            Bucket: bucketName,
            Key: key,
        }

        const command = new CreateMultipartUploadCommand(params)
        const multipartUpload = await s3.send(command);
        res.status(200).json({message: `Files were successfully uploaded`, data: "", uploadId: multipartUpload.UploadId})
    }
    else
    {
        res.status(401).json({error:"access was denied",message: "Passkey was incorrect, Please try again."})
    }
})


app.post("/uploadpartss3", upload.single('file'), async (req, res) => {
    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(acceptedPasskey)
    {

        console.log("/////////////////////////////////////////////// MIDDLE //////////////////////////////////////////////////////")
        const bucketName = process.env.BUCKET_NAME

        const params = {
            Bucket: bucketName,
            Key: req.body.name,
            UploadId: req.body.uploadId,
            PartNumber: req.body.partNumber,
        }
        
        const command = new UploadPartCommand(params)

        try {
            let url = await getSignedUrl(s3,command, {expiresIn: 3600 })
            if(!url)
            {
                throw new Error("wasn't able to get presigned url");
            }
            let resa = await fetch(url,{method: 'PUT', body: req.file.buffer, headers: { 'Content-Type':req.file.mimetype}})
            const Etag = resa.headers.get('ETag')
            res.status(200).json({message: `Files were successfully uploaded`, data: "", Etag})
            
        } catch (error) {
            res.status(400).json({error, message: "failed to upload"})
        }  
        
    }
    else
    {
        res.status(401).json({error:"access was denied",message: "Passkey was incorrect, Please try again."})
    }
    
})

app.post("/finishMultipartUpload", upload.single('file'), async (req, res) => {
    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(acceptedPasskey)
    {
        console.log("/////////////////////////////////////////////// END //////////////////////////////////////////////////////")
        let Parts = []
        for(let i = 0; i < req.body.ETag.length; i++)
        {
            Parts.push({ETag: req.body.ETag[i], PartNumber: req.body.PartNumber[i]})
        }
        const bucketName = process.env.BUCKET_NAME
        const params = {
            Bucket: bucketName,
            Key: req.body.name,
            UploadId: req.body.uploadId,
            MultipartUpload: { Parts: Parts}
        }
    
        const command = new CompleteMultipartUploadCommand(params);

        let g = await s3.send(command)
        res.status(200).json({message: `Files were successfully uploaded`, data: ""})
    }
    else
    {
        res.status(401).json({error:"access was denied",message: "Passkey was incorrect, Please try again."})
    }
})

app.post("/abortMultipartUpload", upload.single('file'), async (req, res) => {
    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(acceptedPasskey)
    {
        console.log("/////////////////////////////////////////////// Aborting //////////////////////////////////////////////////////")
        const bucketName = process.env.BUCKET_NAME
        const params = {
            Bucket: bucketName,
            Key: req.body.name,
            UploadId: req.body.uploadId,
        }
    
        const command = new AbortMultipartUploadCommand(params);

        let g = await s3.send(command)
        res.status(200).json({message: `MultipartUpload was aborted`, data: ""})
    }
    else
    {
        res.status(401).json({error:"access was denied",message: "Passkey was incorrect, Please try again."})
    }
})


app.get("/showfile", (req,res) => { 
    const __dirname = dirname(fileURLToPath(import.meta.url));
    res.sendFile(join(__dirname, 'index.html'));
});


app.listen("3000" ,() =>{
    console.log("running on 3000")
})