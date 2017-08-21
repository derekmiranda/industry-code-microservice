const _ = require('lodash');
const parsingConfig = require('../../config/parsing_config');

const {
  FIELDS,
  FIELD_CUTOFF,
  TARGET_LINE_THICKNESS,
  TARGET_LINE_LENGTH,
  MARGIN,
} = parsingConfig;

const exportObj = {};

// not the table rows but the visual rows
// when scanning from left-to-right, down the page
exportObj.getVisualRowsByPage = getVisualRowsByPage;
function getVisualRowsByPage(data) {
  const rowsByPage = data.formImage.Pages.map((page) => {
    const pageBlockValues = reduceTextObjsToRows(page.Texts);
    return pageBlockValues;
  });
  return rowsByPage;
}

function reduceTextObjsToRows(textObjs) {
  const extractValueFromTextObj = textObj => textObj.R[0].T;

  const rowsOfValues = textObjs
    // put text values into correct place in row array
    // while also putting together strings split across multiple lines
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
function getGeneralCodes(data) {
  // array of objs of tabular values mapped to columns
  const visualRowsByPage = getVisualRowsByPage(data);
  const generalCodeValueObjsByPage = visualRowsByPage.map(visualRowsToGeneralCodeValueObjs);

  // array of page and table row's bottom line y-coordinate metadata
  const lineYValuesByPage = getLineYValuesByPage(data);
  
  // merge each value object and page and line object within both arrays
  const mergedObjs = generalCodeValueObjsByPage.reduce((accum, valueObjs, page_i) => {
    const lineYValues = lineYValuesByPage[page_i];
    const currMergedObjs = valueObjs.map((valueObj, value_i) => {
      const newCodeObj = {
        bottomLine_y: lineYValues[value_i],
        page: page_i,
      };
      return Object.assign(newCodeObj, valueObj);
    });
    return accum.concat(currMergedObjs);
  }, [])
  return mergedObjs;
}

// getting table rows' page and bottom line's y-coordinate
function getLineYValuesByPage(data) {
  const pages = data.formImage.Pages;

  const lineYValuesByPage = pages.map((page) => {
    const horizLines = getHorizLinesOfPage(page);
    const currlineYValuesByPage = horizLines.map(line => line.y);
    return currlineYValuesByPage;
  });
  return lineYValuesByPage;
}

function visualRowsToGeneralCodeValueObjs(visualRows) {
  const visualRowsWithGeneralCodes = visualRows.filter((visualRow) => {
    return visualRow.length === FIELDS.length;
  });

  const generalCodeRows = visualRowsWithGeneralCodes.map((visualRow) => {
    return visualRow.slice(0, FIELD_CUTOFF);
  });

  const generalFields = FIELDS.slice(0, FIELD_CUTOFF);
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
function getSpecificCodes(data) {
  const specificCodeValueObjs = getSpecificCodeValueObjs(data);
  return specificCodeValueObjs;
}

function getSpecificCodeValueObjs(data) {
  const visualRows = getVisualRowsByPage(data);

  // map table values to fields
  const specificCodeRows = visualRows.map((visualRow) => {
    const specificFieldsLength = FIELDS.length - FIELD_CUTOFF;
    return visualRow.slice(-specificFieldsLength);
  });

  const specificFields = FIELDS.slice(FIELD_CUTOFF);
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

function getHorizLinesOfPage(page) {
  const fills = page.Fills;

  // horizontal lines that aren't surrounding table header
  const horizontalLines = fills.filter(forHorizLines);
  return horizontalLines;
}

function forHorizLines(fill) {
  const calcPercentDiff = (targetVal, val) => {
    const absDiff = Math.abs(targetVal - val);
    const percentDiff = absDiff / targetVal;
    return percentDiff;
  }

  const thickness = fill.h;
  const length = fill.w;
  const isHorizLine = (
    calcPercentDiff(TARGET_LINE_THICKNESS, thickness) <= MARGIN &&
    calcPercentDiff(TARGET_LINE_LENGTH, length) <= MARGIN
  );
  return isHorizLine;
}

module.exports = exportObj;