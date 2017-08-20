module.exports = {
  // target distance from table separating line to row just below it
  distFromLineToRowBelow: -0.3,
  // margin of error
  distMargin: 0.4,
  // column titles
  fields: [
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
  ],
  // fields index that begins sequence of insurance-specific fields
  fieldCutoff: 2,
}