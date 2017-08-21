const parsingConfig = require('../config/parsing_config');

const {
  DIST_FROM_LINE_TO_ROW_BELOW,
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
          // end the row with the row's y-coordinate
          const currStrArr = rowArr[rowArr.length - 1];
          currStrArr.push(prevTextObj.y);
          // since we've gone to a new row
          // we'll add a new sub-array to the accumulating array
          rowArr.push([]);
        }
        const lastStrArr = rowArr[rowArr.length - 1];
        lastStrArr.push(value);
        
        // push last row_y to string array if at last textObj
        if (i === origArr.length - 1) {
          lastStrArr.push(textObj.y);
        }
      }

      return rowArr;
    }, [[]])
  return rowsOfValues
    // slicing off headers and footers
    .slice(1, -1);
}

// maps arrays of tabular values to corresponding fields w/in an object
exportObj.mapRowValuesToFields = mapRowValuesToFields;
function mapRowValuesToFields(values, targetFields) {
  const rowObj = values.reduce((accum, value, i) => {
    const targetField = targetFields[i];
    accum[targetField] = value;
    return accum;
  }, {})
  return rowObj;
}

exportObj.getHorizLinesOfPage = getHorizLinesOfPage;
function getHorizLinesOfPage(page) {
  const fills = page.Fills;

  // horizontal lines that aren't surrounding table header
  const horizontalLines = fills.filter(forHorizLines);
  return horizontalLines;
}

function forHorizLines(fill) {
  const thickness = fill.h;
  const length = fill.w;
  const isHorizLine = (
    isWithinAcceptableRange(TARGET_LINE_THICKNESS, thickness) &&
    isWithinAcceptableRange(TARGET_LINE_LENGTH, length)
  );
  return isHorizLine;
}

/**
 * function for checking whether row's y-value
 * is below/above table separator line's y-value
 * need to take into account the way PDF2JSON has calculated the coordinates
 * with the parsing configuration
 * 
 * These are to determine whether a specific code is
 * within the same tabular row as a general code
 */

exportObj.isRowBetweenTableLines = isRowBetweenTableLines;
function isRowBetweenTableLines(
  row_y, row_page,
  topLine_y, topLine_page,
  btmLine_y, btmLine_page
) {
  return (
    isRowBelowTableLine(row_y, row_page, topLine_y, topLine_page) &&
    isRowAboveTableLine(row_y, row_page, btmLine_y, btmLine_page)
  )
}

function isRowAboveTableLine(row_y, row_page, tableLine_y, tableLine_page) {
  const diff = row_y - tableLine_y;
  return row_page <= tableLine_page && diff > DIST_FROM_LINE_TO_ROW_BELOW;
}

function isRowBelowTableLine(row_y, row_page, tableLine_y, tableLine_page) {
  const diff = row_y - tableLine_y;
  return row_page >= tableLine_page && diff < DIST_FROM_LINE_TO_ROW_BELOW;
}

function isWithinAcceptableRange(targetVal, val) {
  return calcPercentDiff(targetVal, val) <= MARGIN;
}

function calcPercentDiff(targetVal, val) {
  const absDiff = Math.abs(targetVal - val);
  const percentDiff = absDiff / targetVal;
  return percentDiff;
}

module.exports = exportObj;