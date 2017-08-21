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