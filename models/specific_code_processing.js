const _ = require('lodash');
const { getVisualRowsByPage, mapRowValuesToFields, getHorizLinesOfPage } = require('./helpers');
const parsingConfig = require('../config/parsing_config');

const {
  FIELDS,
  FIELD_CUTOFF,
  TARGET_LINE_THICKNESS,
  TARGET_LINE_LENGTH,
  MARGIN,
} = parsingConfig;
const exportObj = {};

/**
 * SpecificCode:
 * {
 * SIC: string
 * NAICS: string
 * generalDescription: string
 * ...
 * TX_WC: string
 * page: number, // page number
 * row_y: number, // used for determining when visual row is the start of a table row
 * }
 */
exportObj.getSpecificCodes = getSpecificCodes;
function getSpecificCodes(data) {
  const visualRowsByPage = getVisualRowsByPage(data);
  // const rowYValuesByPage = getRowYValuesByPage(data);
  const specificCodeObjsByPage = visualRowsByPage.map(getSpecificCodeObjs);
  const specificCodeObjs = _.flatten(specificCodeObjsByPage);
  return specificCodeObjs;
}

function getSpecificCodeObjs(visualRows, pageIdx) {
  // map table values to fields
  const specificCodeRows = visualRows.map((visualRow) => {
    const specificFieldsLength = FIELDS.length - FIELD_CUTOFF;
    return visualRow.slice(-specificFieldsLength);
  });

  const specificFields = FIELDS.slice(FIELD_CUTOFF);
  const specificCodeObjs = specificCodeRows.map(row => mapRowValuesToFields(row, specificFields));

  // add page property
  specificCodeObjs.forEach((obj) => {
    obj.page = pageIdx;
  });

  return specificCodeObjs;
}

module.exports = exportObj;