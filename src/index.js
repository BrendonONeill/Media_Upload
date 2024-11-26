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

app.post("/test", upload.array('data', 20), (req, res) => {
    req.files.forEach(element => {
        cloudinary.uploader.upload(element.path, {folder: "Wedding"}, function (err,result){
            if(err)
            {
                console.log(err)
                return res.status(500).json({
                    success: false,
                    message: "Error"
                })
            }
    
            res.status(200).json({
                data:result
            })
    })
    
    
    
    });
})

app.get("/showfile", (req,res) => { 
    const __dirname = dirname(fileURLToPath(import.meta.url));
    res.sendFile(join(__dirname, 'index.html'));
});


app.listen("3000" ,() =>{
    console.log("running on 3000")
})