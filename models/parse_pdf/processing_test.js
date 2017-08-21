const fs = require('fs');
const { getGeneralCodes } = require('./general_code_processing');
// const { getSpecificCodes } = require('./specific_code_processing');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;

  const data = JSON.parse(dataStr);

  const generalCodes = getGeneralCodes(data);
  console.log(generalCodes.slice(0,14));

  // const specificCodes = getSpecificCodes(data);
  // console.log(specificCodes.slice(0, 10));
})