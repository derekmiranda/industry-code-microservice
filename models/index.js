const fs = require('fs');
const { getGeneralCodes } = require('./general_code_processing');
const { getSpecificCodes } = require('./specific_code_processing');
const getGeneralCodeForSpecificCode = require('./getGeneralCodeForSpecificCode');

const parsePDFPromise = new Promise((resolve, reject) => {
  fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
    if (err) reject(err);
  
    const data = JSON.parse(dataStr);
  
    const generalCodes = getGeneralCodes(data);
    const specificCodes = getSpecificCodes(data);
    
    const mergedCodeRows = specificCodes.map((specCode, i) => {
      const targetGenCode = getGeneralCodeForSpecificCode(generalCodes, specCode);
      return Object.assign(specCode, targetGenCode);
    })
    resolve(mergedCodeRows);
  })
})

module.exports = parsePDFPromise;