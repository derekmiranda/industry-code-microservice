const _ = require('lodash');

const exportObj = {};

// not the table rows but the visual rows
// when scanning from left-to-right, down the page
exportObj.getVisualRows = getVisualRows;
function getVisualRows(data) {
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
  return rowsOfValues
    // slicing off headers and footers
    .slice(1, -1);
}

function extractValueFromTextObj(textObj) {
  return textObj.R[0].T;
}

/**
 * GeneralCode:
 * {
 * ISO_Description: string,
 * ISO_CGL: string,
 * page: number, // page number
 * bottomLine_y: number, // used for distinguishing between table rows
 * }
 */ 
exportObj.getGeneralCodes = getGeneralCodes;
function getGeneralCodes (data, fields, fieldCutoff) {
  // get generalCodes from visualRows:
  // [ GeneralCode values: [ISO_Description, ISO_CGL] ]
  const visualRows = getVisualRows(data);
  const visualRowsWithGeneralCodes = visualRows.filter((visualRow) => {
    return visualRow.length === fields.length;
  });

  const generalCodeRows = visualRowsWithGeneralCodes.map((visualRow) => {
    return visualRow.slice(0, fieldCutoff);
  });

  const generalFields = fields.slice(0, fieldCutoff);
  const generalCodeValueObjs = generalCodeRows.map(row => mapRowValuesToFields(row, generalFields));

  return generalCodeValueObjs;
}

/**
 * SpecificCode:
 * {
 * SIC: string
 * NAICS: string
 * ...
 * TX_WC: string
 * page: number, // page number
 * row_y: number, // used for determining when visual row is the start of a table row
 * }
 */ 
exportObj.getSpecificCodes = getSpecificCodes;
function getSpecificCodes (data, fields, fieldCutoff) {
  const visualRows = getVisualRows(data);
  const specificCodeRows = visualRows.map((visualRow) => {
    const specificFieldsLength = fields.length - fieldCutoff;
    return visualRow.slice(-specificFieldsLength);
  });
  
  const specificFields = fields.slice(fieldCutoff);
  const specificCodeValueObjs = specificCodeRows.map(row => mapRowValuesToFields(row, specificFields));

  return specificCodeValueObjs;
}

// maps arrays of tabular values to corresponding fields w/in an object
function mapRowValuesToFields(values, targetFields) {
  const rowObj = values.reduce((accum, value, i) => {
    const targetField = targetFields[i];
    accum[targetField] = value;
    return accum;
  }, {})
  return rowObj;
}

module.exports = exportObj;