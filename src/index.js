'use strict'
const log = require('logger')
let logLevel = process.env.LOG_LEVEL || log.Level.INFO;
log.setLevel(logLevel);
const express = require('express')
const compression = require('compression');
const bodyParser = require('body-parser')
const PORT = process.env.PORT || 3000
const POD_NAME = process.env.POD_NAME || 's3api'
const s3 = require('./s3')
const app = express()
app.use(compression());
app.use(bodyParser.json({
  limit: '100MB',
  verify: (req, res, buf)=>{
    req.rawBody = buf.toString()
  }
}))
app.get('/healthz', (req, res)=>{
  res.json({status: 'ok'})
})
app.get('/list', (req, res)=>{
  s3.list(req, res)
})
app.post('/put', (req, res)=>{
  s3.put(req, res)
})
app.get('/get', (req, res)=>{
  s3.get(req, res)
})
app.post('/delete', (req, res)=>{
  s3.delete(req, res)
})
const server = app.listen(PORT, ()=>{
  log.info('s3api is Listening on '+ server.address().port)
})
