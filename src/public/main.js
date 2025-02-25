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

// array of media
let media = [];
let photos = []

//when
fileBrowserInput.addEventListener("change", (e) => handleFiles(e.target.files))
fileBrowserButton.addEventListener("click", () => fileBrowserInput.click())

const handleFiles = ([...files] = []) =>
{


    for(let i = 0; i < files.length; i++)
    {
        if(files[i].type.startsWith("image"))
        {
            media.push(files[i])
        }
        if(files[i].type.startsWith("video"))
        {
            let test = videoObjectCreator(files[i])
            media.push(test)
        }
    }
    console.log(media)

    return


        if(photos.length <= 0)
        {
            photos = [...photos, ...files]
        }
        else
        {
            if(files.length > 0)
            {
                photos = filterFiles(files, photos)
            }
            
        }
        if(photos.length == 0) return
        filesCount.textContent = `${photos.length}/20 files`
        console.log(photos)
        document.querySelector(".file-list").innerHTML = ""
        for (let i = 0; i < photos.length; i++)
        {
            let img = createThumbnail(photos[i])
            let item = generateListItem(photos[i], i)
            item.querySelector(".file-image").append(img)
            document.querySelector(".file-list").append(item)
        } 
}



function videoObjectCreator(file)
{
    let videoChunks = []
    let start = 0
    let chunkSize = (1024 * 1024) * 8
    let end = file.size
    let id = 0
    console.log(file, end, start, typeof(file))
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
    return {videoChunks, type: file.type, name: file.name, numberOfChunks: id}
}




function filterFiles(files, photos)
{
    for(let i = 0; i < photos.length; i++)
    {
        files = files.filter((file) => (file.name != photos[i].name))
    }
   return [...photos, ...files]
}

function generateListItem(file, num)
{
    const li = document.createElement("li");
    li.innerHTML = `
        <div class="file-image"></div>
        <div class="file-details">
            <small class="file-name">${file.name}</small>
        </div>
        <div class="cancel-button-container">
            <button class="cancel-button" id="photoId-${num}">x</button>
        </div>
        <div class="file-size-container">
            <small class="file-size">${fileSize(file.size)}</small>
        </div>`
    li.classList.add("file-item")
    li.id = `${num}`
    return li
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
    img.src = URL.createObjectURL(file)
    img.style.width = '100%'
    img.style.height = '100%'
    return img
}




filesList.addEventListener("click", (e) => {
    let test = e.target.id.slice(8,)
    if(e.target.classList.value === "cancel-button")
    {
        let item = e.target.closest("li")
        if(item)
        {
            item.remove()
        }
        console.log(test)
        photos[test] = null
        photos = photos.filter((photo) => (photo != null))
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
    console.log("Drag Leave")
    fileUploadBox.classList.remove("active")
     fileUploadBox.querySelector(".file-instructions").textContent = "Drag file here or"
})






function removeFromList(data)
{
    const listItems = filesList.querySelectorAll("li")
    listItems.forEach((item) => {
        let itemText = item.querySelector(".file-name")
        if(data.includes(itemText.textContent))
        {
            item.remove()
        }
    })
    photos = filterPhotos(data, photos)
    filesCount.textContent = `${photos.length}/20 files`
}

function filterPhotos(data, photos)
{
    for(let i = 0; i < data.length; i++)
    {
        for(let j = 0; j < photos.length; j++)
        {
            if(data[i] == photos[j].name)
            {
                photos[j] = null
                break
            }
        }
    }

    return photos.filter(photo => photo !== null)
    
}



// Form submit 
formSubmit.addEventListener("click", async (e) => {
    e.preventDefault()
    if(media.length == 0)
    {
        notify.classList.remove("notify-hide")
        notifyText.textContent = "No Files were added."
        notify.style.background = "#FBEFEB"
        notify.style.border = "2px solid #FC5758"
        setTimeout(() => {
            notify.classList.add("notify-hide");
        },5000)
        return
    }
    if(passkey.value != "")
    {
        for (const file of media) {

            if(file.type.startsWith("image"))
            { 
                await smallUpload(file)
            }
            if(file.type.startsWith("video"))
            {  
                await largeFileUpload(file)
            }
        }
        return
    }
    else
    {
        notify.classList.remove("notify-hide")
        notifyText.textContent = "Passkey wasn't given."
        notify.style.background = "#FBEFEB"
        notify.style.border = "2px solid #FC5758"
        setTimeout(() => {
            notify.classList.add("notify-hide");
        },5000)
    }    
})


// posting to server
async function postingData(formData)
{
    loadingBG.classList.remove("notify-hide")
    let res = await fetch("http://localhost:3000/uploadmedias3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
    if(!res.ok)
    {
        let obj = await res.json()
        console.log("there was an Error")
        notify.classList.remove("notify-hide")
        loadingBG.classList.add("notify-hide");
        notifyText.textContent = obj.message
        notify.style.background = "#FBEFEB"
        notify.style.border = "2px solid #FC5758"
        
        setTimeout(() => {
            notify.classList.add("notify-hide");
        },5000)
        return
    }
    let obj = await res.json()
    console.log(obj)
    //removeFromList(obj.data.photosUploaded)
    notify.classList.remove("notify-hide")
    loadingBG.classList.add("notify-hide");
    notify.style.background = "#F1F8F4"
    notify.style.border = "2px solid #50dc6c"
    notifyText.textContent = obj.message
    setTimeout(() => {
        notify.classList.add("notify-hide");
    },5000)
    
}


async function smallUpload(smallFile)
{
    let formData = new FormData();
    formData.append("passkey",passkey.value)
    formData.append("file", smallFile);
    loadingBG.classList.remove("notify-hide")
    let res = await fetch("http://localhost:3000/uploadmedias3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
}

async function largeFileUpload(largeFile)
{
    let parts = []
    let startres = await fetch("http://localhost:3000/startMultipartUpload",{ method: "POST",body: JSON.stringify({name:`${largeFile.name}`}), headers: {Authorization: `Bearer ${passkey.value}`, "Content-Type": "application/json"}})
    let {uploadId} = await startres.json()
    console.log(uploadId)
    for (const [index,chunk] of largeFile.videoChunks.entries()) {
        let formData = new FormData();
        formData.append("passkey",passkey.value)
        formData.append("partNumber", index+1)
        formData.append("file", chunk);
        formData.append("name",largeFile.name)
        formData.append("uploadId", uploadId)
        loadingBG.classList.remove("notify-hide")
        let res = await fetch("http://localhost:3000/uploadpartss3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
        let data = await res.json();
        parts.push({ETag: data.Etag, PartNumber: index+1})
    }
    console.log(parts)
    let endres = await fetch("http://localhost:3000/finishMultipartUpload",{ method: "POST",body: JSON.stringify({name:`${largeFile.name}`, uploadId: `${uploadId}`, parts: `${parts}`}), headers: {Authorization: `Bearer ${passkey.value}`, "Content-Type": "application/json"}})
    let end = await endres.json()
    console.log(end)
}