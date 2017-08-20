const fs = require('fs');
const parsingConfig = require('./parsingConfig');
const {
  getVisualRows,
  getGeneralCodes,
  getSpecificCodes
} = require('.');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;

  const { fields, fieldCutoff } = parsingConfig; 

  const data = JSON.parse(dataStr);
  const visualRows = getVisualRows(data);
  const specificCodes = getSpecificCodes(visualRows, fields, fieldCutoff);
  console.log(specificCodes.slice(0, 10));
})