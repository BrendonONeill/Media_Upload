const fileBrowserButton = document.querySelector(".file-browser-button")
const fileBrowserInput = document.querySelector(".file-browser-input")
const fileUploadBox = document.querySelector(".file-upload-box")
const filesCount = document.querySelector(".file-completed-status")
const filesList = document.querySelector(".file-list")
let formSubmit = document.querySelector("#form-submit")
const passkey = document.querySelector("#passkey")
const notify = document.querySelector(".notify")
const notifyText = document.querySelector(".update")

let photos = []

const handleFiles = ([...files] = []) =>
{
    console.log("called")
    console.log("photos",photos)
    if(photos.length <= 0)
    {
        console.log("no photos")
        photos = [...photos, ...files]
    }
    else
    {
        if(files.length > 0)
        {
            console.log("we have files")
            photos = filterFiles(files, photos)
        }
        
    }

    if(photos.length == 0) return
    
    filesCount.textContent = `${photos.length} files`
    document.querySelector(".file-list").innerHTML = ""
    for (let i = 0; i < photos.length; i++)
    {
        let img = createThumbnail(photos[i])
        let item = generateListItem(photos[i], i)
        item.querySelector(".file-extension").append(img)
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
    li.innerHTML = `<div class="file-extension"></div>
    <div class="file-content-wrapper">
        <div class="file-content">
            <div class="file-details">
                <small class="file-name">${file.name}</small>    
            </div>
            <button class="cancel-button" id=photoId-${num}>x</button>
        </div>
        <div class="file-progress-bar">
            <small class="file-size">${fileSize(file.size)}</small>
        </div>
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
    formData.append("passkey",passkey.value)
    photos.forEach((file) => formData.append("files", file));

    for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

    postingData(formData)


})

async function postingData(formData)
{
    console.log(passkey.value)
    let res = await fetch("http://localhost:3000/test",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
    if(!res.ok)
    {
        console.log("there was an Error")
        return
    }
    let data = await res.json()
    removeFromList(data.data.data)
    notify.classList.remove("notify-hide")
    notifyText.textContent = data.message
    setTimeout(() => {
        notify.classList.add("notify-hide")
    },10000)
    
}

function removeFromList(data)
{
    const a = filesList.querySelectorAll("li")
    a.forEach((item) => {
        let test = item.querySelector(".file-name")
        if(data.includes(test.textContent))
        {
            item.remove()
        }
    })
    console.log(data)
}


fileBrowserInput.addEventListener("change", (e) => handleFiles(e.target.files))
fileBrowserButton.addEventListener("click", () => fileBrowserInput.click())


