const fileBrowserButton = document.querySelector(".file-browser-button");
const fileBrowserInput = document.querySelector(".file-browser-input");
const fileUploadBox = document.querySelector(".file-upload-box");
const filesCount = document.querySelector(".file-completed-status");
const filesList = document.querySelector(".file-list");
let formSubmit = document.querySelector("#form-submit");
const passkey = document.querySelector("#passkey");
const notify = document.querySelector(".notify");
const notifyError = document.querySelector(".notify-error");
const notifyText = document.querySelector(".update");
const notifyErrorText = document.querySelector(".update-error");
const notifyButton = document.querySelector(".notify-button")
const errorcontainerButton = document.querySelector(".error-list-container-button")
const notifyErrorButton = document.querySelector(".notify-error-button")
const errorbg = document.querySelector(".error-bg")
const errorList = document.querySelector(".error-list")
const loadingBG = document.querySelector(".loading-bg");
const addFilesButton = document.querySelector(".add-files-button")
const loadingUpdating = document.querySelector(".loading-updater")
const block = "/video.svg"
const progressBar = document.querySelector(".progress-bar")
const fileMemory = document.querySelector(".files-memory")
let id = ""


let listMemory = 0

let mediaListMemory = 0
let TempListMemory = 0

let listMemoryUploads = 0

// array of media
let media = [];
let tempMedia = []

//upload results
let globalUploadData = []

//when
fileBrowserInput.addEventListener("change", (e) => handleFiles(e.target.files))
fileBrowserButton.addEventListener("click", () => fileBrowserInput.click())
addFilesButton.addEventListener("click", () => fileBrowserInput.click())

const handleFiles = ([...files] = []) =>
{
   
    for(let i = 0; i < files.length; i++)
    {
        
        if((media.length + tempMedia.length) == 20 || tempMedia.length == 20 || media.length == 20 || (mediaListMemory + TempListMemory + files[i].size) >= 5368709120)
        {
            break
        }
        if(files[i].type.startsWith("image"))
        {
            let file = fileSizeChecker(files[i], mediaObjectCreator)
            TempListMemory += file.size
            tempMedia.push(file)
        }
        else if(files[i].type.startsWith("video"))
        {
            let file = fileSizeChecker(files[i], mediaObjectCreator)
            TempListMemory += file.size
            tempMedia.push(file)
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
    if(media.length == 0)
    {
        fileMemory.textContent = `0KB/5GB`
        return
    }
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
    TempListMemory = 0
    mediaListMemory = 0
    fileBrowserInput.value = ''
    media.forEach((m) => {mediaListMemory += m.size})
    fileMemory.textContent = `${fileSize(mediaListMemory)}/5GB`
}


function fileSizeChecker(file, func)
{
    if(file.size > 8388608)
    {
        let newFile = func(file)
        return newFile
    }
    else
    {
        return file
    }
}


function mediaObjectCreator(file)
{
    let mediaChunks = []
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
          let chunk = new File([file.slice(start,(chunkEnd))],file.name,{type: file.type})
          mediaChunks.push(chunk)
          start = start + chunkSize
     }
    return {mediaChunks: mediaChunks, type: file.type, name: file.name, numberOfChunks: id, size: file.size}
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
            <small class="file-name" data-name='${file.name}'>${nameCleanUp(file.name)}</small>
        </div>
        <div class="cancel-button-container">
            <button class="cancel-button" id="photoId-${num}"></button>
        </div>
        <div class="file-size-container">
            <small class="file-size">${fileSize(file.size)}</small>
            <small class="file-type">${file.name.split('.').pop().toUpperCase()}</small>
        </div>`
    li.classList.add("file-item");
    if(file.size >= 2147483648)
    {
        li.classList.add("file-error");
    }
    li.id = `${num}`
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
    else if(file.type.startsWith("image") && file.size >= 8388608)
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
        for(let i= 0; i < data.length; i++)
        {
            if(data[i].data === itemText.dataset.name && data[i].success == true)
            {
                item.remove()
            }
        }
    })
    media = filterMedia(data, media)
    filesCount.textContent = `${media.length}/20 files`
}



function filterMedia(data, media)
{
    for(let i = 0; i < data.length; i++)
    {
        for(let j = 0; j < media.length; j++)
        {
            if(data[i].data == media[j].name && data[i].success === true)
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
        errorFlashCard({message: "No Files were added",nofiles: true})
        return
    }
    if(passkey.value.trim() != "")
    {
        let banned = checkIfBanned()
        if(banned)
        {
            errorFlashCard({message:`Try again at ${banned}`, wrongKey: true})
            return  
        }
        loadingUpdating.textContent = `Uploading... ${0}/${media.length}`
        let uploadData = []
        loadingBG.classList.remove("notify-hide")
        notifyError.classList.add("notify-hide")
        for (const [index,file] of media.entries()) {

            if(file.size >= 2147483648)
            {
                continue
            }
            if(file.size < 8388608)
            { 
              let res = await passKeyCheck(uploadData, smallUpload, file)
              if(!res)
              {
                return
              }
              uploadData = res
            }
            if(file.size >= 8388608)
            {  
              let res = await passKeyCheck(uploadData, largeFileUpload, file)
              if(!res)
              {
                return
              }
              uploadData = res
            }
            progressBar.style.width = `${Math.round(((index+1)/media.length)*100)}%` 
            loadingUpdating.textContent = `Uploading... ${index+1}/${media.length}`
        }
        globalUploadData = uploadData
        removeFromList(uploadData)
        successfulFlashCard(uploadData)
        console.log("I get called anyway")
        document.cookie = "passkey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("passkey")
        handleFiles([])
        return
    }
    else
    {
        errorFlashCard({message:"Passkey wasn't entered.", wrongKey: true})
    }    
})

async function passKeyCheck(uploadData,fn,file)
{
   
    try {
        let returnedValue = await fn(file)
        if(returnedValue.passKeyFailed)
        {
            let banned = passkeyFail()
            if(banned)
            {
                throw new Error(banned)
            }
            else
            {
                throw new Error(returnedValue.error.message)
            }
        }
        uploadData.push(returnedValue)
        return uploadData
       } catch (error) {
        errorFlashCard({message: error.message,wrongKey: true})
        return
       }
}

function errorFlashCard(obj)
{
        if(obj.nofiles == true)
        {
            notifyErrorText.textContent = `${obj.message}`
            notifyErrorButton.classList.add("not-list")
        }
        else if(obj.wrongKey !== true)
        {
            notifyErrorButton.classList.remove("not-list")
            let count = 0
            errorList.innerHTML= ""
            for(let i = 0; i < obj.length; i++)
            {
                if(obj[i].success != true)
                {
                    let listItem = generateErrorCard(obj[i])
                    errorList.append(listItem)
                    count++
                }
            }
            notifyErrorText.textContent = `${count}/${obj.length} files failed.`
        }
        else
        {
            notifyErrorText.textContent = `${obj.message}`
            notifyErrorButton.classList.add("not-list")
        }
        notifyError.classList.remove("notify-hide")
        loadingBG.classList.add("notify-hide");
        notifyError.style.background = "#FBEFEB"
        notifyError.style.border = "2px solid #FC5758"
}

function generateErrorCard(obj)
{
    let li = document.createElement("li")
    li.innerHTML = `
    <div class="error-card">
                    <h3>${obj.error}</h3>
                    <p>${obj.data}</p>
    </div>
    `
    return li
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
    notifyText.textContent = `${count}/${obj.length} files uploaded successfully.`
    setTimeout(() => {
        if(!notify.classList.contains("notify-hide"))
        {
            let errorsFound = false
            for(let i = 0; i < obj.length; i++)
            {
            if(obj[i].success == false)
            {
                errorsFound = true
            }
    }
            notify.classList.add("notify-hide")
            if(errorsFound)
            {
                errorFlashCard(obj)
            }
        }
    },15000)
}

notifyButton.addEventListener("click", (e) => {
    e.preventDefault()
    let errorsFound = false
    for(let i = 0; i < globalUploadData.length; i++)
    {
        if(globalUploadData[i].success == false)
        {
            errorsFound = true
        }
    }
    notify.classList.add("notify-hide")
    if(errorsFound)
    {
        errorFlashCard(globalUploadData)
    }
})

notifyErrorButton.addEventListener("click", (e) => {
    e.preventDefault()
    errorbg.classList.toggle("notify-hide")
})

errorcontainerButton.addEventListener("click", (e) => {
    e.preventDefault()
    errorbg.classList.toggle("notify-hide")
})

errorbg.addEventListener("click", (e) => {
    e.preventDefault()
    errorbg.classList.add("notify-hide")
})


function  calculateUpload()
{

}


async function smallUpload(smallFile)
{
    let formData = new FormData();
    formData.append("passkey",passkey.value.trim())
    formData.append("file", smallFile);
    formData.append("id", id)
    let passKeyFailed = false
    
    try {
        let res = await fetch("/smalluploads3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value.trim()}`}})
        if(res.ok)
        {
            return {data: smallFile.name, success: true}
        }
        else
        {
            let error = await res.json()
            if(error.passKeyFailed)
            {
                passKeyFailed = true
                throw new Error(error.message)
            } 
            throw error.message
        }
    } catch (error) {
        return {data: smallFile.name, success: false, error: error, passKeyFailed: passKeyFailed}
    }
}

async function largeFileUpload(largeFile)
{
    let passKeyFailed = false
    let error = null
    let errorObj = null
    const chunkData= {
        ETag: [],
        PartNumber: []
    }
    let uploadId = null
try {
   let returnObj = await startMultipartUpload(largeFile, passKeyFailed)
   uploadId = returnObj.uploadId
   passKeyFailed = returnObj.passKeyFailed
   error = returnObj.error
   errorObj = returnObj.errorObj
   

   if(error)
   {
    throw error
   }


   returnObj = await partsMultipartUpload(largeFile, uploadId, passKeyFailed)
   passKeyFailed = returnObj.passKeyFailed
   error = returnObj.error
   errorObj = returnObj.errorObj
   if(error)
   {
    throw error
   }
   chunkData.ETag = returnObj.chunkData.ETag
   chunkData.PartNumber = returnObj.chunkData.PartNumber

   returnObj = await finishMultipartUpload(largeFile,uploadId,chunkData,passKeyFailed)

   let complete = returnObj.uploaded
   passKeyFailed = returnObj.passKeyFailed
   error = returnObj.error
   errorObj = returnObj.errorObj

   if(error)
   {
    throw error
   }

   return complete

} catch (error) {
    return errorObj       
}

   
}


async function startMultipartUpload(largeFile, passKeyFailed)
{
    const returnObj = {}
    try {
        let startres = await fetch("/startMultipartUpload",{ method: "POST",body: JSON.stringify({name:`${largeFile.name}`, size:largeFile.size,id:id}), headers: {Authorization: `Bearer ${passkey.value.trim()}`, "Content-Type": "application/json"}})
        if(startres.ok)
        {
            let {uploadId: id} = await startres.json()
            returnObj.uploadId =  id
            returnObj.passKeyFailed = false
            returnObj.error = returnObj.errorObj = null
            return returnObj
        }
        else
        {
            let error = await startres.json()
            console.info("-----------",error)
            if(error.passKeyFailed)
            {
                passKeyFailed = true
            } 
            throw new Error(error.message)
        }    
    } catch (error) {
        returnObj.error = error
        returnObj.passKeyFailed = true
        returnObj.errorObj = {data: largeFile.name, success: false, error: error, passKeyFailed: passKeyFailed}
        return returnObj
    }
}

async function partsMultipartUpload(largeFile, uploadId, passKeyFailed)
{
    const chunkData= {
        ETag: [],
        PartNumber: []
    }
    const returnObj = {}
    for (const [index,chunk] of largeFile.mediaChunks.entries()) {
        let formData = new FormData();
        formData.append("passkey",passkey.value)
        formData.append("partNumber", index+1)
        formData.append("file", chunk);
        formData.append("name",largeFile.name)
        formData.append("uploadId", uploadId)
        formData.append("id", id)
        try {
            let res = await fetch("/uploadpartss3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value.trim()}`}})
            
            if(res.ok)
            {
                let data = await res.json();
                chunkData.ETag.push(data.Etag)
                chunkData.PartNumber.push(index+1)
            }
            else
            {
                let error = await res.json()
                if(error.passKeyFailed)
                {
                    passKeyFailed = true
                } 
                throw new Error(error.message)
            }
        } catch (error) {
            
            abortMultiPartUpload(uploadId, largeFile.name)
            returnObj.error = error
            returnObj.errorObj = {data: largeFile.name, success: false, error: error, passKeyFailed: passKeyFailed}
            return returnObj
        }
    }
    returnObj.chunkData = chunkData
    returnObj.passKeyFailed = false
    returnObj.error = returnObj.errorObj = null
    return returnObj
}

async function finishMultipartUpload(largeFile,uploadId,chunkData, passKeyFailed)
{
    const returnObj = {}
    let formData = new FormData();
    formData.append("name",largeFile.name)
    formData.append("uploadId", uploadId)
    formData.append("id", id)
    formData.append("size",largeFile.size)
    chunkData.ETag.forEach(e => formData.append("ETag", e))
    chunkData.PartNumber.forEach(p => formData.append("PartNumber", p))
    try {
        let endres = await fetch("/finishMultipartUpload",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value.trim()}`}})
        if(endres.ok)
        {
           await endres.json()
           returnObj.uploaded = {data: largeFile.name, success: true} 
           returnObj.passKeyFailed = false
           returnObj.error = returnObj.errorObj = null
           return returnObj
        }
        else
        {
                let error = await end.json()
                if(error.passKeyFailed)
                {
                    passKeyFailed = true
                } 
                throw new Error(error.message)
        }
    } catch (error) {
        abortMultiPartUpload(uploadId, largeFile.name)
        returnObj.error = error
        returnObj.errorObj = {data: largeFile.name, success: false, error: error, passKeyFailed: passKeyFailed}
        return returnObj
    }
}


async function abortMultiPartUpload(uploadId, key)
{
    let formData = new FormData();
    formData.append("name",key)
    formData.append("id",id)
    formData.append("uploadId", uploadId)
    try {
        let res = await fetch("/abortMultipartUpload",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value.trim()}`}})
        if(res.ok)
        {
            await endres.json()
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

async function getID() {
    const userId = localStorage.getItem('id');
    if (userId) {
        id = userId;
    } else {
        const res = await fetch("/idgen");
        const data = await res.json();
        localStorage.setItem("id", data.id);
        id = data.id;
    }
}


getID()

function checkIfBanned()
{
    let ban = null;
    ban = localStorage.getItem('ban');
    //check ban date compare to date now
    if(ban){
        let now = new Date(Number(ban))
        return `${now.getHours()}:${now.getMinutes()}`
    }
    ban = getCookie('ban')
    if(ban){
        let now = new Date(Number(ban))
        return `${now.getHours()}:${now.getMinutes()}`
    }
}

function banChecker(data)
{
    let count = Number(data[1]) + 1
    if(count < 10)
    {
        return null
    }
    if(count >= 20)
    {
        setCookieItem("ban",`${Date.now() + 3600000}`,3600)
        localStorage.setItem('ban', `${Date.now() + 3600000}`);
        localStorageTimer(3600000)
        var now = new Date(Date.now() + 3600000);
        return `${now.getHours()}:${now.getMinutes()}`
    }
    if(count == 15)
    {
        setCookieItem("ban",`${Date.now() + 600000}`,600)
        localStorage.setItem('ban', `${Date.now() + 600000}`);
        localStorageTimer(600000)
        var now = new Date(Date.now() + 600000);
        return `${now.getHours()}:${now.getMinutes()}`
    }
    if(count == 10)
    {
        setCookieItem("ban",`${Date.now() + 120000}`,120)
        localStorage.setItem('ban', `${Date.now() + 120000}`);
        localStorageTimer(120000)
        var now = new Date(Date.now() + 120000);
        return `${now.getHours()}:${now.getMinutes()}`
    }
}

function passkeyFail()
{   
    let pks = null
    pks = localStorage.getItem('passkey');
    if(!pks)
    {
        pks = getCookie('passkey')
    }
    if(pks)
    {
        let a = pks.split("-")
        let banned = banChecker(a)
        if(!banned)
        {
            if(a[0] !== id)
            {
                a[0] = id
            }
            a[1] = Number(a[1]) + 1
            setCookieItem("passkey",`${a[0]}-${a[1]}`,604800)
            localStorage.setItem('passkey', `${a[0]}-${a[1]}`);
            return null
        }
        else
        {
            a[1] = Number(a[1]) + 1
            setCookieItem("passkey",`${a[0]}-${a[1]}`,604800)
            localStorage.setItem('passkey', `${a[0]}-${a[1]}`);
            return `Try again at ${banned}`
        }
    }
    localStorage.setItem('passkey', `${id}-1`);
    setCookieItem("passkey",`${id}-1`,604800)
    return null
}



function getCookie(name) {

            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
            }
            return null;
        }


function setCookieItem(key,value,time) {
            document.cookie = `${key}=${value}; max-age=${time}; path=/; SameSite=Lax`;
}


function localStorageTimer(time)
{
    setTimeout(() => {
        let ban = null
        ban = localStorage.getItem('ban');
        if(ban){
            localStorage.removeItem('ban');
        }
    },time)
}

function pass()
{
     const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const pk = urlParams.get('pk');
    if(pk)
    {
        passkey.value = pk
    }
}

pass()