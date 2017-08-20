const fs = require('fs');
const _ = require('lodash');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;

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

  const data = JSON.parse(dataStr);
  const values = getRowsOfValues(data);
  // const multilineStart = values.findIndex(
  //   value => typeof value === 'string' && value.includes('Amusement Centers')
  // );
  // const end = multilineStart + 50;
  console.log(values.slice(0, 100));
  // const industryCodes = blocksIntoIndustryCodes(blocks, fields);
})

function getRowsOfValues(data) {
  const rowsByPage = data.formImage.Pages.map((page) => {
    const pageBlockValues = reduceTextObjsToRows(page.Texts);
    return pageBlockValues;
  });
  const allValues = _.flatten(rowsByPage)
  return allValues;
}

function reduceTextObjsToRows(textObjs) {
  const rowsOfValues = textObjs
    .reduce((rowArr, textObj, i, origArr) => {
      const encodedValue = extractValueFromTextObj(textObj);
      const value = decodeURI(encodedValue);
      const prevTextObj = origArr[i - 1];

      // if current text object has same x-coord as previous text object
      // means that current text object is new line w/in same cell
      if (i > 0 && prevTextObj && textObj.x === prevTextObj.x) {
        // so append current text object's value to most recent value
        // w/in most recent row being built
        const lastStrArr = rowArr[rowArr.length - 1];
        lastStrArr[lastStrArr.length - 1] += value;
      }
      else {
        // if current text obj has an x value less than prev,
        // means we've gone to a new row
        if (prevTextObj && textObj.x < prevTextObj.x) {
          // since we've gone to a new row
          // we'll add a new sub-array to the accumulating array
          rowArr.push([]);
        }
        const lastStrArr = rowArr[rowArr.length - 1];
        lastStrArr.push(value);
      }
      return rowArr;
    }, [[]])
  return rowsOfValues;
}

function extractValueFromTextObj(textObj) {
  return textObj.R[0].T;
}

function blocksIntoIndustryCodes(blocks, fields) {
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
  getRowsOfValues,
  blocksIntoIndustryCodes,
}