const fs = require('fs'),
      _ = require('lodash'),
      PDFParser = require('pdf2json');

const pdfParser = new PDFParser();

pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));

pdfParser.on("pdfParser_dataReady", pdfData => {
  const blocks = getTextBlocks(pdfData);
  const codeObjs = blocksIntoCodeObjs(blocks);
  console.log(codeObjs.slice(0, 11));
  // fs.writeFile("./test.json", JSON.stringify(pdfData, null, 4));
});

pdfParser.loadPDF("./fastcompclasscodecrossreferenceguide.pdf");

function getTextBlocks(data) {
  const textBlocksByPage = data.formImage.Pages.map((page) => {
    const pageTextRuns = page.Texts.map((text) => text.R);
    const pageBlocks = _.flatten(pageTextRuns)
    const pageBlockStrs = pageBlocks
      .map(block => block.T)
      .map(decodeURI)
      .map(str => isNaN(str) ? str : Number(str))
    return pageBlockStrs;
  });
  const allTextBlocks = _.flatten(textBlocksByPage)
  return allTextBlocks;
}

function blocksIntoCodeObjs(blocks) {
  const fields = [
    'ISO_Description',
    'ISO_CGL',
    'SIC',
    'NAICS',
    'generalDescription',
    'NCCI',
    'CA_WC',
    'DE_WC',
    'MI_WC',
    'NJ_WC',
    'NY_WC',
    'PA_WC',
    'TX_WC',
  ]

  const rows = _.chunk(blocks, fields.length);
  const industryCodeObjs = rows.map((row) => {
    const codeObj = row.reduce((accumObj, value, i) => {
      const field = fields[i];
      accumObj[field] = value;
      return accumObj;
    }, {});
    return codeObj;
  });
  return industryCodeObjs;
}