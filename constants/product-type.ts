export const PRODUCT_TYPE = {
  SHAMPOO: 'shampoo',
  CONDITIONER: 'conditioner',
  OIL: 'oil',
  CREAM: 'cream',
  SERUM: 'serum',
  MOISTURIZER: 'moisturizer',
  LEAVE_IN: 'leave-in',
  MASK: 'hair-mask',
  GEL: 'hair-gel',
  SPRAY: 'hair-spray',
  TONER: 'toner',
  DYE: 'dye',
};

export type ProductType = keyof typeof PRODUCT_TYPE;
