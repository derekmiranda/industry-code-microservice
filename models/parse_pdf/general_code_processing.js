const { getVisualRowsByPage, mapRowValuesToFields, getHorizLinesOfPage } = require('./helpers');
const parsingConfig = require('../../config/parsing_config');

const {
  FIELDS,
  FIELD_CUTOFF,
  TARGET_LINE_THICKNESS,
  TARGET_LINE_LENGTH,
  MARGIN,
} = parsingConfig;
const exportObj = {};

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

module.exports = exportObj;