const fs = require('fs');
const parsingConfig = require('../../config/parsing_config');
const {
  getVisualRows,
  getGeneralCodes,
  getSpecificCodes
} = require('./json_processing');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;

  const { fields, fieldCutoff } = parsingConfig; 

  const data = JSON.parse(dataStr);
  const generalCodes = getGeneralCodes(data, fields, fieldCutoff);
  console.log(generalCodes.slice(0, 10));
})