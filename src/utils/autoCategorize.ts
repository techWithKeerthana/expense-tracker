import { CategoryName } from '../types';

/**
 * Rule-based keyword matching to guess a spending category from free text
 * (a merchant/payee name, notification text, etc.). Shared by manual entry
 * helpers and Smart Transaction Import so categorization logic lives in one place.
 */
const KEYWORD_RULES: { category: CategoryName; keywords: string[] }[] = [
  {
    category: 'Food',
    keywords: [
      'swiggy', 'zomato', 'restaurant', 'cafe', 'coffee', 'food', 'eatery', 'dine',
      'dominos', 'pizza', 'mcdonald', 'kfc', 'burger', 'bakery', 'grocery', 'grofers',
      'bigbasket', 'zepto', 'blinkit', 'dunzo',
    ],
  },
  {
    category: 'Travel',
    keywords: [
      'uber', 'ola', 'rapido', 'irctc', 'railway', 'indigo', 'airlines', 'airways',
      'flight', 'redbus', 'metro', 'petrol', 'fuel', 'parking', 'toll', 'cab', 'taxi',
    ],
  },
  {
    category: 'Shopping',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'mall', 'store',
      'shopping', 'retail', 'mart', 'reliance', 'dmart',
    ],
  },
  {
    category: 'Bills',
    keywords: [
      'electricity', 'recharge', 'broadband', 'wifi', 'internet', 'water bill',
      'gas bill', 'dth', 'mobile bill', 'postpaid', 'insurance', 'emi', 'loan',
      'airtel', 'jio', 'vodafone', 'vi ', 'bses', 'utility',
    ],
  },
  {
    category: 'Entertainment',
    keywords: [
      'netflix', 'hotstar', 'prime video', 'spotify', 'bookmyshow', 'pvr', 'inox',
      'movie', 'cinema', 'gaming', 'game', 'youtube premium',
    ],
  },
  {
    category: 'Salary',
    keywords: ['salary', 'payroll', 'employer', 'wages'],
  },
];

export function guessCategoryFromText(text: string): CategoryName {
  const lower = text.toLowerCase();
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => lower.includes(keyword))) {
      return rule.category;
    }
  }
  return 'Other';
}
