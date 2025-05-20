import pg from 'pg'
const { Client } = pg
const connectionString = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/${process.env.POSTGRES_DB}`

export async function checkDbSize()
{
   const client = new Client({
    connectionString,
   })
 
await client.connect()

const query = {
  text: 'SELECT filesize from uploads',
  values: [],
  rowMode: 'array',
}
 
const res = await client.query(query)
let a = res.rows.flat(2)
let count = 0 
for(let i = 0; i < a.length; i++)
{
 count += a[i]
}
console.log(count) 

    await client.end()
    return count 
}


export async function updateDbSize(userId,filesize,filename)
{
   const client = new Client({
    connectionString,
   })
 
await client.connect()

const query = {
  text: 'INSERT INTO uploads(userid, filesize,filename) VALUES($1, $2, $3)',
  values: [userId,filesize,filename],
}
 
await client.query(query)
await client.end() 
}