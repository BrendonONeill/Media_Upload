const fileBrowserButton = document.querySelector(".file-browser-button")
const fileBrowserInput = document.querySelector(".file-browser-input")
const fileUploadBox = document.querySelector(".file-upload-box")
const filesCount = document.querySelector(".file-completed-status")
const filesList = document.querySelector(".file-list")
let formSubmit = document.querySelector("#form-submit")
const passkey = document.querySelector("#passkey")
const notify = document.querySelector(".notify")
const notifyText = document.querySelector(".update")
const loadingBG = document.querySelector(".loading-bg")

let photos = []

const handleFiles = ([...files] = []) =>
{
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
    console.log(photos[0].name)
    document.querySelector(".file-list").innerHTML = ""
    for (let i = 0; i < photos.length; i++)
    {
        let img = createThumbnail(photos[i])
        let item = generateListItem(photos[i], i)
        item.querySelector(".file-image").append(img)
        document.querySelector(".file-list").append(item)
    } 
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


formSubmit.addEventListener("click", (e) => {
    e.preventDefault()
    let formData = new FormData();
    if(photos.length == 0)
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
        formData.append("passkey",passkey.value)
        photos.forEach((file) => formData.append("files", file));
        postingData(formData)
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

async function postingData(formData)
{
    loadingBG.classList.remove("notify-hide")
    let res = await fetch("http://localhost:3000/uploadmedia",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
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
    removeFromList(obj.data.photosUploaded)
    notify.classList.remove("notify-hide")
    loadingBG.classList.add("notify-hide");
    notify.style.background = "#F1F8F4"
    notify.style.border = "2px solid #50dc6c"
    notifyText.textContent = obj.message
    setTimeout(() => {
        notify.classList.add("notify-hide");
    },5000)
    
}

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


fileBrowserInput.addEventListener("change", (e) => handleFiles(e.target.files))
fileBrowserButton.addEventListener("click", () => fileBrowserInput.click())


