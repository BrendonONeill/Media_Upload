export default function errorHandler(error)
{
    let status = 404
    if(error.status)
    {
        status = error.status
    }
    let passkeyFailed = false
    if(error.passKeyFailed)
    {
        passkeyFailed = error.passKeyFailed
    }
    return {error: error, message: error.message, passkeyFailed, status}
}