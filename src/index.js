import express from "express"
import { dirname, join } from 'path';
import {fileURLToPath} from 'url';
import 'dotenv/config'
import upload from "./util/multer.js";
import cloudinary from "./util/cloudinary.js";


const app = express()
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/test", upload.array('files', 20), (req, res) => {
    
    let token  = req.headers.authorization.slice(7,)

    let acceptedPasskey = token == process.env.PASSKEY



    if(acceptedPasskey)
    {
        const info = {data: [], dataCount: 0, error: []}
        req.files.forEach( async element => {
            let promise =  await new Promise((res,rej) => {
                cloudinary.uploader.upload(element.path, {folder: "Wedding"}, function (err,result){
                    if(err)
                    {
                        console.log(err)
                        return rej(err)
                    }
                    else
                    {
                        return res(result)
                    }
            
                    
            })
            })
            // Need to fix async problem check
            //console.log("hello am i getting called: ",promise)
            info.data.push(`${promise.original_filename}.${promise.format}`)
        });


        req.files.map( async (element) => {
            try {
                    const [err,data] = await cloudinary.uploader.upload(element.path, {folder: "Wedding"}, function (err,result){
                    if(err)
                    {
                        return [err,null]
                    }
                    else
                    {
                        return [null,result]
                    }
                    })
            } catch (error) {
                
            }

        })

        res.status(200).json({message: "Files were successfully uploaded", data: info})
    }
    else
    {
        res.status(401).json({error:"access was denied"})
    }
})

app.get("/showfile", (req,res) => { 
    const __dirname = dirname(fileURLToPath(import.meta.url));
    res.sendFile(join(__dirname, 'index.html'));
});


app.listen("3000" ,() =>{
    console.log("running on 3000")
})