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
}

// Gift database - In a real app, this would be from an API/database
const giftDatabase: Omit<GiftRecommendation, 'reason'>[] = [
  {
    id: '1',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Premium over-ear headphones with active noise cancellation',
    price: '$299',
    category: 'Electronics',
    image: '🎧'
  },
  {
    id: '2',
    name: 'Artisan Coffee Subscription',
    description: 'Monthly delivery of freshly roasted specialty coffee beans',
    price: '$25/month',
    category: 'Food & Drink',
    image: '☕'
  },
  {
    id: '3',
    name: 'Silk Scarf Set',
    description: 'Luxurious hand-painted silk scarves in elegant patterns',
    price: '$150',
    category: 'Fashion',
    image: '🧣'
  },
  {
    id: '4',
    name: 'Smart Fitness Watch',
    description: 'Advanced fitness tracking with heart rate monitoring',
    price: '$399',
    category: 'Electronics',
    image: '⌚'
  },
  {
    id: '5',
    name: 'Gourmet Chocolate Collection',
    description: 'Handcrafted artisan chocolates from around the world',
    price: '$85',
    category: 'Food & Drink',
    image: '🍫'
  },
  {
    id: '6',
    name: 'Personalized Jewelry Box',
    description: 'Custom engraved wooden jewelry box with velvet interior',
    price: '$120',
    category: 'Home & Decor',
    image: '💎'
  },
  {
    id: '7',
    name: 'Professional Art Set',
    description: 'Complete watercolor and sketch set for artists',
    price: '$180',
    category: 'Arts & Crafts',
    image: '🎨'
  },
  {
    id: '8',
    name: 'Luxury Candle Collection',
    description: 'Hand-poured soy candles with premium fragrances',
    price: '$95',
    category: 'Home & Decor',
    image: '🕯️'
  }
];

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

// Generate personalized gift recommendations
export const generateGiftRecommendations = async (request: GiftRequest): Promise<GiftRecommendation[]> => {
  await initializeAI();

  // Create a profile string for analysis
  const profileText = `${request.relationship} ${request.age} years old interested in ${request.interests} for ${request.occasion}`;
  
  // Score and rank gifts based on the request
  const scoredGifts = giftDatabase.map(gift => {
    let score = 0;
    let reason = '';

    // Age-based scoring
    if (request.age < 25) {
      if (gift.category === 'Electronics') score += 2;
      if (gift.category === 'Arts & Crafts') score += 1;
    } else if (request.age >= 25 && request.age < 50) {
      if (gift.category === 'Home & Decor') score += 2;
      if (gift.category === 'Food & Drink') score += 1;
    } else {
      if (gift.category === 'Fashion') score += 2;
      if (gift.category === 'Home & Decor') score += 1;
    }

    // Interest-based scoring
    const interests = request.interests.toLowerCase();
    if (interests.includes('tech') || interests.includes('gadget')) {
      if (gift.category === 'Electronics') score += 3;
    }
    if (interests.includes('art') || interests.includes('creative')) {
      if (gift.category === 'Arts & Crafts') score += 3;
    }
    if (interests.includes('food') || interests.includes('coffee')) {
      if (gift.category === 'Food & Drink') score += 3;
    }
    if (interests.includes('fashion') || interests.includes('style')) {
      if (gift.category === 'Fashion') score += 3;
    }

    // Relationship-based scoring
    const relationship = request.relationship.toLowerCase();
    if (relationship.includes('romantic') || relationship.includes('partner')) {
      if (gift.name.includes('Jewelry') || gift.category === 'Fashion') score += 2;
    }
    if (relationship.includes('friend')) {
      if (gift.category === 'Food & Drink' || gift.category === 'Arts & Crafts') score += 2;
    }

    // Occasion-based scoring
    const occasion = request.occasion.toLowerCase();
    if (occasion.includes('birthday')) {
      score += 1; // All gifts are good for birthdays
    }
    if (occasion.includes('anniversary') || occasion.includes('valentine')) {
      if (gift.category === 'Fashion' || gift.name.includes('Jewelry')) score += 3;
    }

    // Generate reason
    if (score >= 4) {
      reason = `Perfect match for a ${request.age}-year-old ${request.relationship} who loves ${request.interests}!`;
    } else if (score >= 2) {
      reason = `Great choice for ${request.occasion} - fits their interests and age perfectly.`;
    } else {
      reason = `A thoughtful gift that shows you care about their happiness.`;
    }

    return {
      ...gift,
      score,
      reason
    };
  });

  // Sort by score and return top 4 recommendations
  return scoredGifts
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ score, ...gift }) => gift);
};

// Feedback system for continuous learning
export const submitFeedback = async (giftId: string, liked: boolean) => {
  // In a real app, this would update the model/database
  console.log(`Feedback received for gift ${giftId}: ${liked ? 'liked' : 'disliked'}`);
  return Promise.resolve();
};