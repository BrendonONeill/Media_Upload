function fileValidator(file)
{
    if(!file.mimetype.startsWith("image/") && !file.mimetype.startsWith("video/"))
    {
        return false
    }
    if(file.size > 2147483648 || file.size === undefined)
    {
        return false
    }
    return true
}

export default function fileAndKeyValidator(req, action)
{
    if(action !== "multipartStart" && action !== "multipartEnd")
    {
        if(req.file === undefined)
        {
            let err = new Error("No file was given.")
            err.status = 404
            return err
        }
        if(!fileValidator(req.file))
        {
            let err = new Error("File Failed Validation")
            err.status = 415
            return err
        }
    }
    let token  = req.headers.authorization.slice(7,)
    let acceptedPasskey = token == process.env.PASSKEY
    if(!acceptedPasskey)
    {
        let err = new Error("Passkey was incorrect.")
        err.status = 401
        err.passKeyFailed = true
        return err
    }

    return null
}



