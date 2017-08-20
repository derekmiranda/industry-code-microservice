const _ = require('lodash');

const exportObj = {};

// not the table rows but the visual rows
// when scanning from left-to-right, down the page
exportObj.getVisualRows = function(data) {
  const rowsByPage = data.formImage.Pages.map((page) => {
    const pageBlockValues = reduceTextObjsToRows(page.Texts)
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
  return rowsOfValues
    // slicing off headers and footers
    .slice(1, -1);
}

function extractValueFromTextObj(textObj) {
  return textObj.R[0].T;
}

exportObj.getGeneralCodes = function (visualRows, fields, fieldCutoff) {
  const visualRowsWithGeneralCodes = visualRows.filter((visualRow) => {
    return visualRow.length === fields.length;
  });

  const generalCodes = visualRowsWithGeneralCodes.map((visualRow) => {
    return visualRow.slice(0, fieldCutoff);
  });

  return generalCodes;
}

exportObj.getSpecificCodes = function (visualRows, fields, fieldCutoff) {
  const specificCodes = visualRows.map((visualRow) => {
    const specificFieldsLength = fields.length - fieldCutoff;
    return visualRow.slice(-specificFieldsLength);
  });

  return specificCodes;
}

// function blocksIntoIndustryCodes(blocks, fields) {
//   const industryCodeObjs = rows.map((row) => {
//     const codeObj = row.reduce((accumObj, value, i) => {
//       const field = fields[i];
//       accumObj[field] = value;
//       return accumObj;
//     }, {});
//     return codeObj;
//   });
//   return industryCodeObjs;
// }

module.exports = exportObj;