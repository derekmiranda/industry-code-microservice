const fs = require('fs');
const _ = require('lodash');

fs.readFile('./parsedPDF.json', (err, dataStr) => {
  const data = JSON.parse(dataStr);
  const blocks = getTextBlocks(data);
  const industryCodes = blocksIntoIndustryCodes(blocks);
  console.log(industryCodes);
})

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

function blocksIntoIndustryCodes(blocks) {
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

module.exports = {
  getTextBlocks,
  blocksIntoIndustryCodes,
}