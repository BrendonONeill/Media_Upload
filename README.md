# Media Upload
This project is for a public event where users can upload images and video to a S3 Bucket on AWS. I tried to focus on User-friendly ideas when creating this project so that people that who arent tech savy can upload.

<img src="https://github.com/BrendonONeill/portfolio/blob/prod-v1.0.2/assets/images/projects/upload-bg.webp" width="500">

## Software used 
- Docker
- Docker Compose
- VPS
- AWS S3
- Nginx
- Node JS

## How I handled Large media
When a user uploads media over the size of 10MB I create chunks of the media to upload separately. 
```
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
          let chunk = new File([file.slice(start,(chunkEnd))],file.name,{type: file.type)
          mediaChunks.push(chunk)
          start = start + chunkSize
     }
    return {mediaChunks: mediaChunks, type: file.type, name: file.name, numberOfChunks: id, size: file.size}
}

```

When the media is chunked it goes through the multipart upload where each chunk is uploaded separately with this function

```
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
            let res = await fetch("/uploadpartss3",{ method: "POST",body: formData, headers: {Authorization: `Bearer ${passkey.value}`}})
            if(res.ok)
            {
                let data = await res.json();
                chunkData.ETag.push(data.Etag)
                chunkData.PartNumber.push(index+1)
            }
            else
            {
                let error = await startres.json()
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
```

## Working on
- Cleaner error message for users.
- Retry upload (3 times)
- Logging
- Database to cap storage limit.


## Testing
- Need to test everything to make sure it works after every new feature. 
  
