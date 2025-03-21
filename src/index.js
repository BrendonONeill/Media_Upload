import express from "express"
import { dirname, join } from 'path';
import {fileURLToPath} from 'url';
import cors from 'cors'
import 'dotenv/config'

//import cloudinary from "./util/cloudinary.js";
import { PutObjectCommand, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from "@aws-sdk/client-s3";
import { s3 } from "./util/aws.js";


const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.options('*', cors());

import upload from "./util/multer.js";

app.post("/uploadmedia", upload.array('files', 20), async (req, res) => {
    
    let token  = req.headers.authorization.slice(7,)

    let acceptedPasskey = token == process.env.PASSKEY



    if(acceptedPasskey)
    {
        const info = {photosUploaded: [], photoCount: 0, error: []}
       
        const uploadPromises = req.files.map( async (element) => {
            try {
                    const data = await cloudinary.uploader.upload(element.path, {folder: "Wedding"}, function (err,result){
                        if(err)
                        {
                            console.error("The file wasn't uploaded", err)
                        }
                        else
                        {
                            console.error("Upload successful: ", result)
                        }
                    })
                    return { type: "successful", data:`${data.original_filename}.${data.format}`}
            } catch (error) {
                
            }

        })


        const uploadedFiles = await Promise.all(uploadPromises);

        for (let i = 0; i < uploadedFiles.length; i++) {
            info.photosUploaded.push(uploadedFiles[i].data);
            info.photoCount =+ 1
        }
        
        res.status(200).json({message: `${info.photoCount} Files were successfully uploaded`, data: info})
    }
    else
    {
        res.status(401).json({error:"access was denied",message: "Passkey was incorrect, Please try again."})
    }
})


app.post("/smalluploads3", upload.single('file'), async (req, res) => {

    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(acceptedPasskey)
    {
        const bucketName = process.env.BUCKET_NAME

        const params = {
            Bucket: bucketName,
            Key: req.file.originalname,
            Body: req.file.buffer,
            ContentType: req.file.mimetype
        }
        const command = new PutObjectCommand(params);
        await s3.send(command)
        res.status(200).json({message: `Files were successfully uploaded`, data: ""})
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
            Body: req.file.buffer,
            PartNumber: req.body.partNumber,
        }
    

        const command = new UploadPartCommand(params)

        let resa = await s3.send(command)
        res.status(200).json({message: `Files were successfully uploaded`, data: "", Etag: resa.ETag})
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