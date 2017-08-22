const express = require('express');
const parsePDFPromise = require('./models');

const app = express();
const port = process.env.PORT || '3000';

parsePDFPromise.then(main);

function main(pdfData) {
  app.get('/ncci/:value', createDataRetrievalMiddleware(pdfData, 'NCCI'));
  app.get('/naics/:value', createDataRetrievalMiddleware(pdfData, 'NAICS'));
  app.get('/ca_wc/:value', createDataRetrievalMiddleware(pdfData, 'CA_WC'));
  
  app.listen(port, function () {
    console.log(`Listening on ${port}`)
  })
}

function createDataRetrievalMiddleware(data, field) {
  return function (req, res) {
    const codes = getCodesByField(data, field, req.params.value);
    res.header('Content-Type', 'application/json');    
    res.send(JSON.stringify(codes, null, 4));
  }
}

function getCodesByField(data, field, value) {
  return data.filter(item => item[field] === value);
}