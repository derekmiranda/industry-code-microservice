const fs = require('fs');
const _ = require('lodash');
const { getGeneralCodes } = require('./general_code_processing');
const { getSpecificCodes } = require('./specific_code_processing');
const getGeneralCodeForSpecificCode = require('./getGeneralCodeForSpecificCode');
const { isRowAboveTableLine, isRowBelowTableLine } = require('./helpers');

const parsePDFPromise = new Promise((resolve, reject) => {
  fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
    if (err) reject(err);
  
    const data = JSON.parse(dataStr);
  
    const generalCodes = getGeneralCodes(data);
    const specificCodes = getSpecificCodes(data);
    
    // reference for last found general code in case none found for specific codes
    // initialized at first general code
    let recentViableGenCode = generalCodes[0];
    const genCodesForSpecCode = specificCodes.map((specCode, i) => {
      const targetGenCode = getGeneralCodeForSpecificCode(generalCodes, specCode);
      recentViableGenCode = (targetGenCode || recentViableGenCode);
      // defaults to last general code if no target found
      return recentViableGenCode;
    })

    const mergedCodeRows = specificCodes.map((specCode, i) => {
      const targetGenCode = getGeneralCodeForSpecificCode(generalCodes, specCode);
      const merged = Object.assign(specCode, targetGenCode);
      const mergedWithoutFormatData = _.omit(merged, ['page', 'bottomLine_y', 'row_y']);
      return mergedWithoutFormatData;
    })
    resolve(mergedCodeRows);
  })
})

module.exports = parsePDFPromise;