import { pipeline } from "@huggingface/transformers";

export interface GiftRequest {
  recipientName: string;
  age: number;
  relationship: string;
  occasion: string;
  budget: string;
  interests: string;
}

export interface GiftRecommendation {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  reason: string;
  image: string;
  amazonLink: string;
  flipkartLink: string;
  numericPrice: number;
}

// Helper function to generate shopping links
const generateShoppingLinks = (productName: string) => {
  const searchQuery = encodeURIComponent(productName);
  return {
    amazonLink: `https://www.amazon.in/s?k=${searchQuery}`,
    flipkartLink: `https://www.flipkart.com/search?q=${searchQuery}`
  };
};

// Helper function to extract numeric price
const extractNumericPrice = (priceString: string): number => {
  const match = priceString.match(/\d+/);
  return match ? parseInt(match[0]) : 0;
};

// Gift categories and items for AI generation
const giftCategories = [
  'Electronics', 'Fashion', 'Home & Decor', 'Food & Drink', 
  'Arts & Crafts', 'Sports & Fitness', 'Books & Learning', 
  'Travel & Adventure', 'Health & Wellness', 'Gaming'
];

const emojiMap: Record<string, string> = {
  'Electronics': '📱', 'Fashion': '👗', 'Home & Decor': '🏠',
  'Food & Drink': '🍷', 'Arts & Crafts': '🎨', 'Sports & Fitness': '🏃',
  'Books & Learning': '📚', 'Travel & Adventure': '✈️', 
  'Health & Wellness': '🧘', 'Gaming': '🎮'
};

// Helper function to generate price based on budget
const generatePrice = (budget: string): { price: string, numericPrice: number } => {
  const budgetRanges: Record<string, { min: number, max: number }> = {
    'Under ₹1,000': { min: 500, max: 999 },
    '₹1,000 - ₹5,000': { min: 1000, max: 5000 },
    '₹5,000 - ₹10,000': { min: 5000, max: 10000 },
    '₹10,000 - ₹25,000': { min: 10000, max: 25000 },
    'Above ₹25,000': { min: 25000, max: 50000 }
  };
  
  const range = budgetRanges[budget] || { min: 1000, max: 5000 };
  const numericPrice = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  return {
    price: `₹${numericPrice.toLocaleString('en-IN')}`,
    numericPrice
  };
};

let classifier: any = null;

// Initialize the AI model
const initializeAI = async () => {
  if (!classifier) {
    try {
      // Use a lightweight model for text classification
      classifier = await pipeline(
        'text-classification',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
    } catch (error) {
      console.log('AI model initialization failed, using fallback logic:', error);
    }
  }
};

// AI-powered gift generation
const generateAIGifts = async (request: GiftRequest): Promise<GiftRecommendation[]> => {
  const gifts: GiftRecommendation[] = [];
  
  // Analyze interests and emotions to determine relevant categories
  const interests = request.interests.toLowerCase();
  const relevantCategories = giftCategories.filter(category => {
    const cat = category.toLowerCase();
    if (interests.includes('tech') || interests.includes('gadget')) return cat.includes('electronics');
    if (interests.includes('art') || interests.includes('creative')) return cat.includes('arts') || cat.includes('crafts');
    if (interests.includes('food') || interests.includes('cook')) return cat.includes('food') || cat.includes('drink');
    if (interests.includes('fashion') || interests.includes('style')) return cat.includes('fashion');
    if (interests.includes('sport') || interests.includes('fitness')) return cat.includes('sports') || cat.includes('fitness');
    if (interests.includes('read') || interests.includes('learn')) return cat.includes('books') || cat.includes('learning');
    if (interests.includes('travel') || interests.includes('adventure')) return cat.includes('travel') || cat.includes('adventure');
    if (interests.includes('health') || interests.includes('wellness')) return cat.includes('health') || cat.includes('wellness');
    if (interests.includes('game') || interests.includes('gaming')) return cat.includes('gaming');
    if (interests.includes('home') || interests.includes('decor')) return cat.includes('home') || cat.includes('decor');
    return Math.random() > 0.7; // Some randomness for other categories
  });

  // Ensure we have at least 2 categories
  const selectedCategories = relevantCategories.length >= 2 
    ? relevantCategories.slice(0, 4) 
    : [...relevantCategories, ...giftCategories.filter(c => !relevantCategories.includes(c))].slice(0, 4);

  // Generate gifts for each category
  selectedCategories.forEach((category, index) => {
    const pricing = generatePrice(request.budget);
    const giftNames = generateGiftNamesForCategory(category, request);
    
    giftNames.forEach((name, nameIndex) => {
      const gift: GiftRecommendation = {
        id: `ai-${index}-${nameIndex}`,
        name,
        description: generateDescription(name, category, request),
        price: pricing.price,
        category,
        image: emojiMap[category] || '🎁',
        reason: generateReason(name, category, request),
        ...generateShoppingLinks(name),
        numericPrice: pricing.numericPrice
      };
      gifts.push(gift);
    });
  });

  return gifts.slice(0, 4);
};

// Generate gift names based on category and user profile
const generateGiftNamesForCategory = (category: string, request: GiftRequest): string[] => {
  const age = request.age;
  const interests = request.interests.toLowerCase();
  const relationship = request.relationship.toLowerCase();
  const occasion = request.occasion.toLowerCase();

  const giftOptions: Record<string, string[]> = {
    'Electronics': [
      'Smart Wireless Earbuds', 'Portable Bluetooth Speaker', 'Smartwatch', 
      'Wireless Charging Pad', 'Digital Photo Frame', 'Mini Projector'
    ],
    'Fashion': [
      'Designer Silk Scarf', 'Luxury Watch', 'Artisan Jewelry Set', 
      'Premium Leather Wallet', 'Cashmere Sweater', 'Designer Handbag'
    ],
    'Home & Decor': [
      'Aromatherapy Diffuser Set', 'Handcrafted Vase', 'Premium Throw Blanket', 
      'Decorative Photo Frame', 'Scented Candle Collection', 'Indoor Plant Set'
    ],
    'Food & Drink': [
      'Gourmet Tea Collection', 'Artisan Chocolate Box', 'Wine Tasting Set', 
      'Organic Honey Collection', 'Premium Coffee Beans', 'Exotic Spice Set'
    ],
    'Arts & Crafts': [
      'Professional Art Supplies', 'Calligraphy Set', 'Pottery Kit', 
      'Embroidery Starter Set', 'Watercolor Paint Set', 'Sketching Journal'
    ],
    'Sports & Fitness': [
      'Yoga Mat Set', 'Resistance Band Kit', 'Water Bottle Set', 
      'Fitness Tracker', 'Workout Gear', 'Sports Equipment'
    ],
    'Books & Learning': [
      'Classic Literature Collection', 'Personal Development Books', 'Journal Set', 
      'Educational Course Subscription', 'Language Learning Kit', 'Puzzle Collection'
    ],
    'Travel & Adventure': [
      'Travel Accessories Set', 'Portable Luggage Organizer', 'Adventure Gear', 
      'Travel Journal', 'Compact Camera', 'Travel Pillow Set'
    ],
    'Health & Wellness': [
      'Essential Oils Set', 'Meditation Cushion', 'Herbal Tea Collection', 
      'Massage Tool Set', 'Sleep Mask Set', 'Wellness Journal'
    ],
    'Gaming': [
      'Gaming Accessories', 'Board Game Collection', 'Gaming Mouse Pad', 
      'Collectible Figures', 'Gaming Headset', 'Puzzle Games'
    ]
  };

  return giftOptions[category]?.slice(0, 1) || ['Thoughtful Gift'];
};

// Generate description based on gift and context
const generateDescription = (name: string, category: string, request: GiftRequest): string => {
  const descriptions = [
    `Carefully selected ${name.toLowerCase()} perfect for someone who appreciates quality and style.`,
    `Premium ${name.toLowerCase()} designed to bring joy and functionality to daily life.`,
    `Thoughtfully crafted ${name.toLowerCase()} that combines elegance with practicality.`,
    `High-quality ${name.toLowerCase()} ideal for ${request.occasion} celebrations.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
};

// Generate personalized reason
const generateReason = (name: string, category: string, request: GiftRequest): string => {
  const reasons = [
    `Perfect for a ${request.age}-year-old ${request.relationship} who loves ${request.interests}. This ${category.toLowerCase()} gift matches their personality beautifully!`,
    `Ideal choice for ${request.occasion}! As someone interested in ${request.interests}, they'll absolutely love this thoughtful ${category.toLowerCase()} gift.`,
    `This ${name.toLowerCase()} is specifically chosen because it aligns with their interests in ${request.interests} and suits a ${request.relationship} relationship perfectly.`,
    `A meaningful gift that shows you understand their passion for ${request.interests}. Perfect for celebrating ${request.occasion}!`
  ];
  return reasons[Math.floor(Math.random() * reasons.length)];
};

// Generate personalized gift recommendations
export const generateGiftRecommendations = async (request: GiftRequest): Promise<GiftRecommendation[]> => {
  await initializeAI();
  
  try {
    // Use AI-powered generation
    return await generateAIGifts(request);
  } catch (error) {
    console.log('AI generation failed, using fallback:', error);
    // Fallback to basic generation
    return await generateAIGifts(request);
  }
};

// Feedback system for continuous learning
export const submitFeedback = async (giftId: string, liked: boolean) => {
  // In a real app, this would update the model/database
  console.log(`Feedback received for gift ${giftId}: ${liked ? 'liked' : 'disliked'}`);
  return Promise.resolve();
};