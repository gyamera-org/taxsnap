import type { PRODUCT_TYPE } from '@/constants/product-type';

export type Product = {
  id: string;
  brand: string;
  name: string;
  type: (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
  size: string;
  barcode: string;
  for: string;
  description: string;
  sulfate_free: boolean;
  silicone_free: boolean;
  cruelty_free: boolean;
  made_in: string;
  ingredients: {
    name: string;
    purpose: string;
    effect: string;
  }[];
  suggestedFor: {
    hairGoals: {
      Longer: boolean;
      Healthier: boolean;
      'Defined curls': boolean;
      'Protective styling': boolean;
      'Edge growth': boolean;
      'All of the above': boolean;
    };
    porosity: {
      High: boolean;
      Mid: boolean;
      Low: boolean;
    };
    routine: {
      Daily: boolean;
      Weekly: boolean;
      'During protective style': boolean;
    };
  };
};
