const fs = require('fs');
const _ = require('lodash');

fs.readFile(__dirname + '/parsedPDF.json', (err, dataStr) => {
  if (err) throw err;
  const data = JSON.parse(dataStr);
  const values = getFlatArrOfValues(data);
  const multilineStart = values.findIndex(
    value => typeof value === 'string' && value.includes('cial Inseminati')
  );
  const end = multilineStart + 10;
  console.log(values.slice(multilineStart, end));
  // const industryCodes = blocksIntoIndustryCodes(blocks);
})

function getFlatArrOfValues(data) {
  const valuesByPage = data.formImage.Pages.map((page) => {
    const pageBlockValues = reduceTextObjsToValues(page.Texts);
    return pageBlockValues;
  });
  const allValues = _.flatten(valuesByPage)
  return allValues;
}

function reduceTextObjsToValues(textObjs) {
  const values = textObjs
    .reduce((strArr, textObj, i, origArr) => {
      const value = extractValueFromTextObj(textObj);
      const prevTextObj = origArr[i-1];
      // if current text object has same x-coord as previous text object
      // means that current text object is new line w/in same cell
      if (i > 0 && prevTextObj && textObj.x === prevTextObj.x) {
        // so append current text object's value to prev value
        strArr[strArr.length - 1] += value;
      } else {
        strArr.push(value);
      }
      return strArr;
    }, [])
    .map(decodeURI)
    .map(str => isNaN(str) ? str : Number(str));
  return values;
}

function extractValueFromTextObj(textObj) {
  return textObj.R[0].T;
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
  getFlatArrOfValues,
  blocksIntoIndustryCodes,
}