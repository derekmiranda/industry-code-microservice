const fs = require('fs');
const parsingConfig = require('./parsingConfig');
const { getVisualRows, getGeneralCodes } = require('./pdf_json_processing');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;

  const { fields, fieldCutoff } = parsingConfig; 

  const data = JSON.parse(dataStr);
  const visualRows = getVisualRows(data);
  const generalCodes = getGeneralCodes(visualRows, fields, fieldCutoff);
  console.log(generalCodes.slice(0, 100));
})