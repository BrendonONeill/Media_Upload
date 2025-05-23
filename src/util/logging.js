import fs from "fs"
export default async function logger(data, type)
{
     let loginfo = generateLog(data)
     let content = `[${loginfo.time}] |${loginfo.status}| [${loginfo.UserId}]-${loginfo.file} "${loginfo.message}" \n` 
    if(type === "main")
    {
    
        await fs.appendFile('log.txt', content, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Information was logged');
        });
        return
    }
        await fs.appendFile('errorlog.txt', content, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('Error was logged');
        });
        return
}


function generateLog(data)
{
    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");


    const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

    formattedDateTime;
    return {
        status: data.status,
        message: data.message,
        time: formattedDateTime,
        UserId: data.id,
        file: data.file
    }
}