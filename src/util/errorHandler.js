export default function errorHandler(error)
{
    console.log(error)
    let status = 404
    if(error.status)
    {
        status = error.status
    }
    let passKeyFailed = false
    if(error.passKeyFailed)
    {
        passKeyFailed = error.passKeyFailed
    }
    return {error: error, message: error.message, passKeyFailed, status}
}