const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');

const resolve = filepath => path.resolve(__dirname, filepath);

const pdfFile = resolve("./class_code_ref.pdf");
const targetJSON = resolve("./parsedPDF.json");
const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));

pdfParser.on("pdfParser_dataReady", pdfData => {
  fs.writeFile(targetJSON, JSON.stringify(pdfData, null, 4));
});

pdfParser.loadPDF(pdfFile, (err) => console.error(err));