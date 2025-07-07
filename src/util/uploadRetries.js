export default async function uploadFilesBackOff(postFetch)
{
    const max  = 3
    let retries = 0;

    while(true)
    {
        try {
           let res =  await uploadAttempt(postFetch)
           if(res)
           {
            return res
           }
           else
           {
            throw new Error("failed to upload file")
           }
        } catch (error) {
            if (retries >= max) {
            return {ok:false,status:400}; // Max retries reached, rethrow the error
            }
        }

        const delay = Math.pow(2, retries) * 2000;
        console.log(`Retry ${retries + 1} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        retries++;
    }

}

async function uploadAttempt(postFetch){ 
        let res = await postFetch
        
        if(res.status === 200)
        {
            return res
        }
        else
        {
            return null
        }
}