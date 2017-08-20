module.exports = {
  // target distance from table separating line to row just below it
  DIST_FROM_LINE_TO_ROW_BELOW: -0.3,
  // non-header horizontal lines' general observed thickness
  TARGET_LINE_THICKNESS: 0.5,
  // non-header horizontal lines' general observed length
  TARGET_LINE_LENGTH: 46.5,
  // % margin of error for detecting visual distances
  MARGIN: 0.5,
  // column titles
  FIELDS: [
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
  FIELD_CUTOFF: 2,
}