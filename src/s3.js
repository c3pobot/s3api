'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
const { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = new S3Client({
    endpoint: process.env.AWS_ENDPOINT, // e.g. https://eu2.contabostorage.com/bucketname
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'US-central',
    forcePathStyle : true
});
module.exports.list = async(req, res)=>{
  try{
    let command, obj
    if(req?.query?.Bucket) command =  new ListObjectsV2Command(req.query)
    if(command) obj = await s3.send(command)
    if(obj?.Contents){
      res.status(200).json(obj.Contents)
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e);
    res?.sendStatus(400)
  }
}
module.exports.put = async(req, res)=>{
  try{
    let payload = req?.body, command, obj
    if(payload?.Body){
      payload.Body = Buffer.from(payload.Body, 'base64')
      payload.ContentType = 'image/png'
    }
    if(payload?.Body) command = new PutObjectCommand(payload)
    if(command) obj = await s3.send(command)
    if(obj?.ETag){
      res.status(200).send(obj)
    }else{
      res.status(400)
    }
  }catch(e){
    log.error(e)
    res?.sendStatus(400)
  }
}
module.exports.get = async(req, res)=>{
  try{
    let command, obj, img
    if(req?.query?.Bucket) command =  new GetObjectCommand(req.query)
    if(command) obj = await s3.send(command)
    if(obj?.Body) img = await obj.Body.transformToByteArray()
    if(img){
      res.contentType('image/png');
      res.send(new Buffer.from(img))
    }else{
      res.sendStatus(400)
    }
  }catch(e){
    log.error(e);
    res?.sendStatus(400)
  }
}
