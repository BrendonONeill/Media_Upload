const fileBrowserButton = document.querySelector(".file-browser-button")
const fileBrowserInput = document.querySelector(".file-browser-input")



const handleFiles = (e) =>
{
    console.log(e.target.files)
}

fileBrowserInput.addEventListener("change", handleFiles)
fileBrowserButton.addEventListener("click", () => fileBrowserInput.click())


