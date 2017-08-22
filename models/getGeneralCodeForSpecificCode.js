const { isRowBetweenTableLines } = require('./helpers');

// returns ISO description string that specific code belongs to
function getGeneralCodeForSpecificCode(generalCodes, specCode) {
  const targetGenCode = generalCodes.find((genCode, i, genCodeArr) => {
    // get top by getting bottom y of previous gen code
    const prevGenCode = (i >= 1) ? genCodeArr[i - 1] : { page: 0, bottomLine_y: 0 };
    const genTopLine_y = prevGenCode.bottomLine_y;
    const genTopLine_page = prevGenCode.page;
    const genBtmLine_y = genCode.bottomLine_y;
    const genBtmLine_page = genCode.page;
    const specRow_y = specCode.row_y;
    const specRow_page = specCode.page;

    const res = isRowBetweenTableLines(
      specRow_y, specRow_page,
      genTopLine_y, genTopLine_page,
      genBtmLine_y, genBtmLine_page
    )
    return res;
  });
  return targetGenCode;
} 

module.exports = getGeneralCodeForSpecificCode;