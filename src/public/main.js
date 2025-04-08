const fileBrowserButton = document.querySelector(".file-browser-button");
const fileBrowserInput = document.querySelector(".file-browser-input");
const fileUploadBox = document.querySelector(".file-upload-box");
const filesCount = document.querySelector(".file-completed-status");
const filesList = document.querySelector(".file-list");
let formSubmit = document.querySelector("#form-submit");
const passkey = document.querySelector("#passkey");
const notify = document.querySelector(".notify");
const notifyText = document.querySelector(".update");
const loadingBG = document.querySelector(".loading-bg");
const addFilesButton = document.querySelector(".add-files-button")
const loadingUpdating = document.querySelector(".loading-updater")
const block = "/video.svg"
const progressBar = document.querySelector(".progress-bar")

let listMemory = 0

// array of media
let media = [];
let tempMedia = []

//when
fileBrowserInput.addEventListener("change", (e) => handleFiles(e.target.files))
fileBrowserButton.addEventListener("click", () => fileBrowserInput.click())
addFilesButton.addEventListener("click", () => fileBrowserInput.click())

const handleFiles = ([...files] = []) =>
{
    for(let i = 0; i < files.length; i++)
    {
        
        if(tempMedia.length == 20)
        {
            break
        }
        if(files[i].type.startsWith("image"))
        {
            tempMedia.push(files[i])
        }
        else if(files[i].type.startsWith("video"))
        {
            let test = videoObjectCreator(files[i])
            tempMedia.push(test)
        }
        else
        {
            errorFlashCard({message: "Please only add Images and videos."})
        }
    }
    if(media.length <= 0)
    {
        media = [...media, ...tempMedia]
    } 
    else
    {
        if(tempMedia.length > 0)
        {
                media = filterFiles(tempMedia, media)
        }
    }     
    if(media.length == 0) return
    filesCount.textContent = `${media.length}/20 files`
    document.querySelector(".file-list").innerHTML = ""
    for (let i = 0; i < media.length; i++)
    {
        let img = createThumbnail(media[i])
        let item = generateListItem(media[i], i)
        item.querySelector(".file-image").append(img)
        document.querySelector(".file-list").append(item)
    } 

    tempMedia = []
    fileBrowserInput.value = ''
    console.log(fileSize(listMemory))
}



function videoObjectCreator(file)
{
    let videoChunks = []
    let start = 0
    let chunkSize = (1024 * 1024) * 8
    let end = file.size
    let id = 0
    while(start < end)
     {
          id += 1
          let chunkEnd = start + chunkSize
          if(chunkEnd > end)
          {
              chunkEnd = end
          }
          let chunk = new File([file.slice(start,(chunkEnd))],file.name,{type: file.type, test: "yes"})
          videoChunks.push(chunk)
          
          start = start + chunkSize
     }
    return {videoChunks, type: file.type, name: file.name, numberOfChunks: id, size: file.size}
}




function filterFiles(files, media)
{
    for(let i = 0; i < media.length; i++)
    {
        files = files.filter((file) => (file.name != media[i].name))
    }
   return [...media, ...files]
}

function generateListItem(file, num)
{
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="file-image"></div>
        <div class="file-details">
            <small class="file-name">${nameCleanUp(file.name)}</small>
        </div>
        <div class="cancel-button-container">
            <button class="cancel-button" id="photoId-${num}">x</button>
        </div>
        <div class="file-size-container">
            <small class="file-type">${file.name.split('.').pop()}</small>
            <small class="file-size">${fileSize(file.size)}</small>
        </div>`
    li.classList.add("file-item")
    li.id = `${num}`
    listMemory += file.size
    return li
}


function nameCleanUp(name)
{
    if(name.length < 20)
    {
        return name
    }
    else
    {
        let text = name.slice(0,20) + '...'
        return text
    }
}
function fileSize(bytes)
{
    if(bytes > 1048576)
    {
        let num = bytes/1048576
        return num.toFixed(2)  + "MB"
    }
    else
    {
        let num =  bytes/1024
        return num.toFixed(2) + "KB"
    }
}

function createThumbnail(file)
{
    let img = document.createElement("img")
    if(file.type.startsWith("video"))
    {
        img.src = block
    }
    else
    {
        img.src = URL.createObjectURL(file)
    }
    img.style.maxHeight= '100%'
    img.style.maxWidth = '100%'
    img.style.objectFit = 'contain';
    return img
}




filesList.addEventListener("click", (e) => {
    let id = e.target.id.slice(8,)
    if(e.target.classList.value === "cancel-button")
    {
        let item = e.target.closest("li")
        if(item)
        {
            item.remove()
        }
        media[id] = null
        media = media.filter((m) => (m != null))
        filesCount.textContent = `${media.length}/20 files`
        handleFiles()
    }
})


// drag and drop functions
fileUploadBox.addEventListener("drop", (e) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files) 
    fileUploadBox.classList.add("active")
    fileUploadBox.querySelector(".file-instructions").textContent = "Drop to upload"
})

fileUploadBox.addEventListener("dragover", (e) => {
    e.preventDefault()
    fileUploadBox.classList.add("active")
    fileUploadBox.querySelector(".file-instructions").textContent = "Drop to upload"
})

fileUploadBox.addEventListener("dragleave", (e) => {
    e.preventDefault()
    fileUploadBox.classList.remove("active")
     fileUploadBox.querySelector(".file-instructions").textContent = "Drag file here or"
})






function removeFromList(data)
{
    const listItems = filesList.querySelectorAll("li")
    listItems.forEach((item) => {
        let itemText = item.querySelector(".file-name")
        console.log(data, itemText)
        for(let i= 0; i < data.length; i++)
        {
            if(data[i].data == itemText.textContent)
            {
                console.log(item)
                item.remove()
            }
        }
    })
    media = filterMedia(data, media)
    console.log(media)
    filesCount.textContent = `${media.length}/20 files`
}



function filterMedia(data, media)
{
    for(let i = 0; i < data.length; i++)
    {
        for(let j = 0; j < media.length; j++)
        {
            console.log(data[i].data, " = ", media[j].name)
            if(data[i].data == media[j].name)
            {
                media[j] = {name: ""}
                break
            }
        }
    }
    return media.filter(m => m.name !== "") 
}



// Form submit 
formSubmit.addEventListener("click", async (e) => {
    e.preventDefault()
    if(media.length == 0)
    {
        errorFlashCard({message: "No Files were added"})
        return
    }
    if(passkey.value != "")
    {
        console.log(media)
        loadingUpdating.textContent = `Uploading... ${0}/${media.length}`
        const uploadData = []
        loadingBG.classList.remove("notify-hide")
        for (const [index,file] of media.entries()) {

            if(file.type.startsWith("image"))
            { 
              uploadData.push(await smallUpload(file))
            }
            if(file.type.startsWith("video"))
            {  
                uploadData.push(await largeFileUpload(file))
            }

            progressBar.style.width = `${Math.round(((index+1)/media.length)*100)}%` 
            loadingUpdating.textContent = `Uploading... ${index+1}/${media.length}`
        }
        removeFromList(uploadData)
        successfulFlashCard(uploadData)
        return
    }
    else
    {
        errorFlashCard({message:"Passkey wasn't entered."})
    }    
})


// posting to server
async function postingData(formData)
{
    
    let res = await fetch("http://localhost:3000/uploadmedias3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
    if(!res.ok)
    {
        let obj = await res.json()
        errorFlashCard(obj)
        return
    }
    let obj = await res.json()
    successfulFlashCard(obj)    
}

function errorFlashCard(obj)
{
        notify.classList.remove("notify-hide")
        loadingBG.classList.add("notify-hide");
        notifyText.textContent = obj.message
        notify.style.background = "#FBEFEB"
        notify.style.border = "2px solid #FC5758"
        
        setTimeout(() => {
            notify.classList.add("notify-hide");
        },5000)
}

function successfulFlashCard(obj)
{
    let count = 0
    for(let i = 0; i < obj.length; i++)
    {
        if(obj[i].success == true)
        {
            count++
        }
    }
    notify.classList.remove("notify-hide")
    loadingBG.classList.add("notify-hide");
    notify.style.background = "#F1F8F4"
    notify.style.border = "2px solid #50dc6c"
    notifyText.textContent = `${count}/${obj.length} files upload successfully.`
    setTimeout(() => {
        notify.classList.add("notify-hide");
    },5000)
}


async function smallUpload(smallFile)
{
    let formData = new FormData();
    formData.append("passkey",passkey.value)
    formData.append("file", smallFile);
    
    try {
        let res = await fetch("http://localhost:3000/smalluploads3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
        if(res.ok)
        {
            let obj = await res.json()
            return {data: smallFile.name, success: true}
        }
        else
        {
            throw new Error("handle error")
        }
    } catch (error) {
        return {data: smallFile.name, success: false}
    }
}

async function largeFileUpload(largeFile)
{
    const chunkData= {
        ETag: [],
        PartNumber: []
    }
    let uploadId = null
    try {
        let startres = await fetch("http://localhost:3000/startMultipartUpload",{ method: "POST",body: JSON.stringify({name:`${largeFile.name}`}), headers: {Authorization: `Bearer ${passkey.value}`, "Content-Type": "application/json"}})
        if(startres.ok)
        {
            let {uploadId: id} = await startres.json()
            uploadId = id
        }
        else
        {
            let err = await startres.json()
            throw new Error(err.message)
        }    
    } catch (error) {
        console.error(error)
    }
    for (const [index,chunk] of largeFile.videoChunks.entries()) {
        let formData = new FormData();
        formData.append("passkey",passkey.value)
        formData.append("partNumber", index+1)
        formData.append("file", chunk);
        formData.append("name",largeFile.name)
        formData.append("uploadId", uploadId)
        try {
            let res = await fetch("http://localhost:3000/uploadpartss3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
            if(res.ok)
            {
                let data = await res.json();
                chunkData.ETag.push(data.Etag)
                chunkData.PartNumber.push(index+1)
            }
            else
            {
                throw new Error("")
            }
        } catch (error) {
            // throw flash card
            // abort multipartupload
            abortMultiPartUpload(uploadId, largeFile.name)
        }
        
    }
    let formData = new FormData();
    formData.append("name",largeFile.name)
    formData.append("uploadId", uploadId)
    chunkData.ETag.forEach(e => formData.append("ETag", e))
    chunkData.PartNumber.forEach(p => formData.append("PartNumber", p))
    try {
        let endres = await fetch("http://localhost:3000/finishMultipartUpload",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
        if(endres.ok)
        {
            let end = await endres.json()
            return {data: largeFile.name, success: true}
        }
        else
        {
             throw new Error("")
        }
    } catch (error) {
         // throw flash card
            // abort multipartupload
    }
}


async function abortMultiPartUpload(uploadId, key)
{
    let formData = new FormData();
    formData.append("name",key)
    formData.append("uploadId", uploadId)
    try {
        let res = await fetch("http://localhost:3000/abortMultipartUpload",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
        if(res.ok)
        {
            let end = await endres.json()
        }
        else
        {
             throw new Error("")
        }
    } catch (error) {
         // throw flash card
         return {data: key, success: false}
    }
}







