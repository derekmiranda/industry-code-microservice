const fs = require('fs');
const {
  getVisualRows,
  getGeneralCodes,
  getSpecificCodes
} = require('./json_processing');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;

  const data = JSON.parse(dataStr);

  // const generalCodes = getGeneralCodes(data);
  // console.log(generalCodes.slice(0, 10));

  const specificCodes = getSpecificCodes(data);
  console.log(specificCodes.slice(0, 10));
})