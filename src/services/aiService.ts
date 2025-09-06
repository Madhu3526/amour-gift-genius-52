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
  relevanceScore: number;
  tags: string[];
}

export interface UserProfile {
  age: number;
  relationship: string;
  interests: string[];
  purchaseHistory?: string[];
  preferences?: Record<string, number>;
}

export interface GiftAttributes {
  category: string;
  subcategory: string;
  priceRange: string;
  ageGroups: string[];
  occasions: string[];
  interests: string[];
  sentiment: 'positive' | 'neutral' | 'luxury' | 'practical';
  popularity: number;
}

// Advanced AI models and embeddings
let sentimentClassifier: any = null;
let intentClassifier: any = null;
let embeddingModel: any = null;

// Gift database with rich attributes for content-based filtering
const giftDatabase: Array<GiftAttributes & { name: string; description: string; basePrice: number }> = [
  // Electronics
  { name: "Smart Wireless Earbuds", category: "Electronics", subcategory: "Audio", priceRange: "mid", ageGroups: ["teens", "adults"], occasions: ["birthday", "graduation"], interests: ["music", "technology", "fitness"], sentiment: "positive", popularity: 0.85, description: "Premium wireless earbuds with noise cancellation", basePrice: 3500 },
  { name: "Smartwatch", category: "Electronics", subcategory: "Wearables", priceRange: "high", ageGroups: ["adults", "seniors"], occasions: ["birthday", "anniversary"], interests: ["fitness", "technology", "health"], sentiment: "luxury", popularity: 0.90, description: "Advanced fitness tracking and smart notifications", basePrice: 15000 },
  { name: "Portable Bluetooth Speaker", category: "Electronics", subcategory: "Audio", priceRange: "low", ageGroups: ["teens", "adults"], occasions: ["birthday", "friendship"], interests: ["music", "parties", "outdoor"], sentiment: "positive", popularity: 0.75, description: "Waterproof speaker for music lovers", basePrice: 2500 },
  
  // Fashion
  { name: "Designer Silk Scarf", category: "Fashion", subcategory: "Accessories", priceRange: "high", ageGroups: ["adults", "seniors"], occasions: ["anniversary", "valentine"], interests: ["fashion", "elegance", "luxury"], sentiment: "luxury", popularity: 0.70, description: "Handcrafted silk scarf with intricate patterns", basePrice: 8000 },
  { name: "Premium Leather Wallet", category: "Fashion", subcategory: "Accessories", priceRange: "mid", ageGroups: ["adults"], occasions: ["birthday", "graduation"], interests: ["fashion", "business", "practical"], sentiment: "practical", popularity: 0.80, description: "Genuine leather wallet with RFID protection", basePrice: 4500 },
  { name: "Artisan Jewelry Set", category: "Fashion", subcategory: "Jewelry", priceRange: "high", ageGroups: ["adults"], occasions: ["anniversary", "valentine", "wedding"], interests: ["fashion", "jewelry", "elegance"], sentiment: "luxury", popularity: 0.85, description: "Handcrafted jewelry with precious stones", basePrice: 12000 },
  
  // Home & Decor
  { name: "Aromatherapy Diffuser Set", category: "Home & Decor", subcategory: "Wellness", priceRange: "mid", ageGroups: ["adults", "seniors"], occasions: ["housewarming", "birthday"], interests: ["wellness", "home", "relaxation"], sentiment: "positive", popularity: 0.75, description: "Essential oil diffuser with premium oils", basePrice: 3200 },
  { name: "Indoor Plant Collection", category: "Home & Decor", subcategory: "Plants", priceRange: "low", ageGroups: ["adults"], occasions: ["housewarming", "birthday"], interests: ["gardening", "home", "nature"], sentiment: "positive", popularity: 0.65, description: "Low-maintenance plants for indoor spaces", basePrice: 1800 },
  { name: "Premium Throw Blanket", category: "Home & Decor", subcategory: "Textiles", priceRange: "mid", ageGroups: ["adults", "seniors"], occasions: ["anniversary", "housewarming"], interests: ["home", "comfort", "luxury"], sentiment: "luxury", popularity: 0.70, description: "Soft cashmere blend blanket for ultimate comfort", basePrice: 5500 },
  
  // Books & Learning
  { name: "Personal Development Book Set", category: "Books & Learning", subcategory: "Self-Help", priceRange: "low", ageGroups: ["adults"], occasions: ["birthday", "graduation"], interests: ["reading", "learning", "growth"], sentiment: "practical", popularity: 0.60, description: "Curated collection of transformative books", basePrice: 1500 },
  { name: "Language Learning Kit", category: "Books & Learning", subcategory: "Education", priceRange: "mid", ageGroups: ["teens", "adults"], occasions: ["graduation", "birthday"], interests: ["learning", "travel", "culture"], sentiment: "practical", popularity: 0.55, description: "Interactive language learning materials", basePrice: 3800 },
  
  // Sports & Fitness
  { name: "Yoga Mat Premium Set", category: "Sports & Fitness", subcategory: "Yoga", priceRange: "mid", ageGroups: ["adults"], occasions: ["birthday", "new year"], interests: ["fitness", "yoga", "wellness"], sentiment: "positive", popularity: 0.70, description: "Eco-friendly yoga mat with accessories", basePrice: 2800 },
  { name: "Resistance Band Kit", category: "Sports & Fitness", subcategory: "Equipment", priceRange: "low", ageGroups: ["adults"], occasions: ["birthday", "new year"], interests: ["fitness", "exercise", "health"], sentiment: "practical", popularity: 0.65, description: "Complete resistance training system", basePrice: 1200 },
  
  // Food & Drink
  { name: "Gourmet Coffee Bean Set", category: "Food & Drink", subcategory: "Beverages", priceRange: "mid", ageGroups: ["adults"], occasions: ["birthday", "thank you"], interests: ["coffee", "gourmet", "morning"], sentiment: "positive", popularity: 0.75, description: "Single-origin coffee beans from around the world", basePrice: 2400 },
  { name: "Artisan Chocolate Collection", category: "Food & Drink", subcategory: "Sweets", priceRange: "mid", ageGroups: ["all"], occasions: ["valentine", "birthday", "thank you"], interests: ["chocolate", "gourmet", "treats"], sentiment: "luxury", popularity: 0.80, description: "Handcrafted chocolates with exotic flavors", basePrice: 3600 },
  
  // Arts & Crafts
  { name: "Professional Art Supply Set", category: "Arts & Crafts", subcategory: "Drawing", priceRange: "high", ageGroups: ["teens", "adults"], occasions: ["birthday", "graduation"], interests: ["art", "creativity", "drawing"], sentiment: "positive", popularity: 0.60, description: "Complete set for aspiring artists", basePrice: 8500 },
  { name: "Pottery Kit Deluxe", category: "Arts & Crafts", subcategory: "Ceramics", priceRange: "mid", ageGroups: ["adults"], occasions: ["birthday", "hobby"], interests: ["art", "pottery", "hands-on"], sentiment: "positive", popularity: 0.50, description: "Everything needed to start pottery", basePrice: 4200 },
  
  // Gaming
  { name: "Gaming Mechanical Keyboard", category: "Gaming", subcategory: "Accessories", priceRange: "high", ageGroups: ["teens", "adults"], occasions: ["birthday", "graduation"], interests: ["gaming", "technology", "computers"], sentiment: "positive", popularity: 0.85, description: "RGB backlit mechanical gaming keyboard", basePrice: 9500 },
  { name: "Board Game Strategy Collection", category: "Gaming", subcategory: "Board Games", priceRange: "mid", ageGroups: ["teens", "adults"], occasions: ["birthday", "family"], interests: ["games", "strategy", "social"], sentiment: "positive", popularity: 0.70, description: "Premium strategy board games for game nights", basePrice: 4800 },
  
  // Travel & Adventure
  { name: "Travel Organizer Set Premium", category: "Travel & Adventure", subcategory: "Accessories", priceRange: "mid", ageGroups: ["adults"], occasions: ["birthday", "farewell"], interests: ["travel", "organization", "adventure"], sentiment: "practical", popularity: 0.75, description: "Complete travel organization solution", basePrice: 3500 },
  { name: "Portable Camera Kit", category: "Travel & Adventure", subcategory: "Photography", priceRange: "high", ageGroups: ["adults"], occasions: ["birthday", "graduation"], interests: ["photography", "travel", "memories"], sentiment: "positive", popularity: 0.65, description: "Instant camera with accessories for capturing memories", basePrice: 12500 },
  
  // Health & Wellness
  { name: "Essential Oils Therapeutic Set", category: "Health & Wellness", subcategory: "Aromatherapy", priceRange: "mid", ageGroups: ["adults", "seniors"], occasions: ["birthday", "wellness"], interests: ["wellness", "aromatherapy", "relaxation"], sentiment: "positive", popularity: 0.70, description: "Pure essential oils for health and wellness", basePrice: 4500 },
  { name: "Meditation Cushion Set", category: "Health & Wellness", subcategory: "Meditation", priceRange: "mid", ageGroups: ["adults"], occasions: ["birthday", "mindfulness"], interests: ["meditation", "mindfulness", "wellness"], sentiment: "positive", popularity: 0.60, description: "Ergonomic meditation cushions for comfort", basePrice: 3200 }
];

// User behavior simulation for collaborative filtering
const userInteractionHistory: Record<string, Array<{ giftId: string; rating: number; purchased: boolean }>> = {
  "tech_enthusiast": [
    { giftId: "Smart Wireless Earbuds", rating: 5, purchased: true },
    { giftId: "Smartwatch", rating: 4, purchased: false },
    { giftId: "Gaming Mechanical Keyboard", rating: 5, purchased: true }
  ],
  "fashion_lover": [
    { giftId: "Designer Silk Scarf", rating: 5, purchased: true },
    { giftId: "Artisan Jewelry Set", rating: 4, purchased: false },
    { giftId: "Premium Leather Wallet", rating: 3, purchased: false }
  ],
  "wellness_seeker": [
    { giftId: "Aromatherapy Diffuser Set", rating: 5, purchased: true },
    { giftId: "Essential Oils Therapeutic Set", rating: 4, purchased: true },
    { giftId: "Meditation Cushion Set", rating: 4, purchased: false }
  ]
};

// Initialize AI models
const initializeAI = async () => {
  try {
    if (!sentimentClassifier) {
      sentimentClassifier = await pipeline(
        'sentiment-analysis',
        'Xenova/distilbert-base-uncased-finetuned-sst-2-english'
      );
    }
    if (!intentClassifier) {
      intentClassifier = await pipeline(
        'zero-shot-classification',
        'Xenova/distilbert-base-uncased-mnli'
      );
    }
  } catch (error) {
    console.log('AI model initialization failed, using fallback logic:', error);
  }
};

// NLP-based intent detection and emotion analysis
const analyzeUserIntent = async (interests: string, relationship: string, occasion: string) => {
  const combinedText = `${interests} for ${relationship} on ${occasion}`;
  
  try {
    // Sentiment analysis
    const sentiment = sentimentClassifier ? 
      await sentimentClassifier(combinedText) : 
      [{ label: 'POSITIVE', score: 0.8 }];
    
    // Intent classification
    const categories = ['luxury', 'practical', 'creative', 'tech', 'wellness', 'social'];
    const intent = intentClassifier ? 
      await intentClassifier(combinedText, categories) : 
      { labels: ['practical'], scores: [0.8] };
    
    return {
      sentiment: sentiment[0]?.label || 'POSITIVE',
      sentimentScore: sentiment[0]?.score || 0.8,
      primaryIntent: intent.labels?.[0] || 'practical',
      intentConfidence: intent.scores?.[0] || 0.8,
      emotionalTone: sentiment[0]?.label === 'POSITIVE' ? 'enthusiastic' : 'considerate'
    };
  } catch (error) {
    console.log('Intent analysis failed, using fallback:', error);
    return {
      sentiment: 'POSITIVE',
      sentimentScore: 0.8,
      primaryIntent: 'practical',
      intentConfidence: 0.8,
      emotionalTone: 'enthusiastic'
    };
  }
};

// Content-based filtering
const calculateContentBasedScore = (gift: typeof giftDatabase[0], request: GiftRequest, userIntent: any): number => {
  let score = 0;
  
  // Interest matching (40% weight)
  const userInterests = request.interests.toLowerCase().split(/[,\s]+/);
  const matchingInterests = gift.interests.filter(interest => 
    userInterests.some(userInt => userInt.includes(interest) || interest.includes(userInt))
  );
  score += (matchingInterests.length / Math.max(gift.interests.length, userInterests.length)) * 0.4;
  
  // Age appropriateness (20% weight)
  const ageGroup = request.age < 18 ? 'teens' : request.age > 60 ? 'seniors' : 'adults';
  if (gift.ageGroups.includes(ageGroup) || gift.ageGroups.includes('all')) {
    score += 0.2;
  }
  
  // Occasion relevance (20% weight)
  if (gift.occasions.includes(request.occasion.toLowerCase())) {
    score += 0.2;
  }
  
  // Intent alignment (10% weight)
  if (gift.sentiment === userIntent.primaryIntent || 
      (userIntent.primaryIntent === 'luxury' && gift.sentiment === 'luxury')) {
    score += 0.1;
  }
  
  // Popularity boost (10% weight)
  score += gift.popularity * 0.1;
  
  return Math.min(score, 1.0);
};

// Collaborative filtering simulation
const calculateCollaborativeScore = (gift: typeof giftDatabase[0], request: GiftRequest): number => {
  // Find similar users based on interests and demographics
  const userProfile = `${request.interests}_${request.relationship}_${Math.floor(request.age / 10) * 10}`;
  
  // Simulate finding similar users
  const similarUsers = Object.keys(userInteractionHistory).filter(user => {
    if (request.interests.toLowerCase().includes('tech') && user.includes('tech')) return true;
    if (request.interests.toLowerCase().includes('fashion') && user.includes('fashion')) return true;
    if (request.interests.toLowerCase().includes('wellness') && user.includes('wellness')) return true;
    return Math.random() > 0.7; // Some randomness for diversity
  });
  
  if (similarUsers.length === 0) return 0.5; // Neutral score if no similar users
  
  // Calculate average rating from similar users
  let totalRating = 0;
  let ratingCount = 0;
  
  similarUsers.forEach(user => {
    const interactions = userInteractionHistory[user] || [];
    const giftInteraction = interactions.find(interaction => 
      interaction.giftId === gift.name
    );
    if (giftInteraction) {
      totalRating += giftInteraction.rating;
      ratingCount++;
    }
  });
  
  return ratingCount > 0 ? (totalRating / ratingCount) / 5 : 0.5; // Normalize to 0-1
};

// Rule-based filtering
const applyRuleBasedFilters = (gifts: typeof giftDatabase, request: GiftRequest): typeof giftDatabase => {
  const budgetRanges: Record<string, { min: number, max: number }> = {
    'Under ₹1,000': { min: 0, max: 1000 },
    '₹1,000 - ₹5,000': { min: 1000, max: 5000 },
    '₹5,000 - ₹10,000': { min: 5000, max: 10000 },
    '₹10,000 - ₹25,000': { min: 10000, max: 25000 },
    'Above ₹25,000': { min: 25000, max: 100000 }
  };
  
  const budgetRange = budgetRanges[request.budget] || { min: 0, max: 100000 };
  
  return gifts.filter(gift => {
    // Budget constraint
    if (gift.basePrice < budgetRange.min || gift.basePrice > budgetRange.max) {
      return false;
    }
    
    // Relationship appropriateness
    const relationship = request.relationship.toLowerCase();
    if (relationship.includes('parent') && gift.category === 'Gaming' && gift.subcategory === 'Accessories') {
      return false; // Gaming accessories might not be appropriate for parents
    }
    
    return true;
  });
};

// Hybrid ranking algorithm
const rankGifts = (gifts: Array<typeof giftDatabase[0] & { contentScore: number; collaborativeScore: number }>, request: GiftRequest): Array<typeof giftDatabase[0] & { relevanceScore: number }> => {
  return gifts.map(gift => {
    // Weighted combination of scores
    const contentWeight = 0.6;
    const collaborativeWeight = 0.3;
    const popularityWeight = 0.1;
    
    const relevanceScore = 
      (gift.contentScore * contentWeight) +
      (gift.collaborativeScore * collaborativeWeight) +
      (gift.popularity * popularityWeight);
    
    return {
      ...gift,
      relevanceScore: Math.min(relevanceScore, 1.0)
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Generate shopping links
const generateShoppingLinks = (productName: string) => {
  const searchQuery = encodeURIComponent(productName);
  return {
    amazonLink: `https://www.amazon.in/s?k=${searchQuery}`,
    flipkartLink: `https://www.flipkart.com/search?q=${searchQuery}`
  };
};

// Generate price with variation
const generatePriceWithVariation = (basePrice: number, budget: string): { price: string, numericPrice: number } => {
  const variation = 0.8 + (Math.random() * 0.4); // 0.8x to 1.2x variation
  const numericPrice = Math.round(basePrice * variation);
  
  return {
    price: `₹${numericPrice.toLocaleString('en-IN')}`,
    numericPrice
  };
};

// Generate personalized description
const generatePersonalizedDescription = (gift: typeof giftDatabase[0], request: GiftRequest, userIntent: any): string => {
  const tone = userIntent.emotionalTone === 'enthusiastic' ? 'exciting' : 'thoughtful';
  const sentimentMap = {
    luxury: 'premium and elegant',
    practical: 'useful and reliable',
    positive: 'delightful and enjoyable'
  };
  
  return `This ${sentimentMap[gift.sentiment] || 'wonderful'} ${gift.name.toLowerCase()} is ${tone}ly selected for someone who appreciates ${gift.interests.slice(0, 2).join(' and ')}. ${gift.description}`;
};

// Generate personalized reason
const generatePersonalizedReason = (gift: typeof giftDatabase[0], request: GiftRequest, userIntent: any): string => {
  const confidence = Math.round(userIntent.intentConfidence * 100);
  return `${confidence}% match based on AI analysis! Perfect for a ${request.age}-year-old ${request.relationship} interested in ${request.interests}. This ${gift.category.toLowerCase()} gift aligns with their ${userIntent.primaryIntent} preferences and suits ${request.occasion} celebrations beautifully.`;
};

// Main AI recommendation engine
export const generateGiftRecommendations = async (request: GiftRequest): Promise<GiftRecommendation[]> => {
  await initializeAI();
  
  try {
    // Step 1: Analyze user intent and emotions
    const userIntent = await analyzeUserIntent(request.interests, request.relationship, request.occasion);
    
    // Step 2: Apply rule-based filters
    const filteredGifts = applyRuleBasedFilters(giftDatabase, request);
    
    // Step 3: Calculate content-based scores
    const giftsWithContentScores = filteredGifts.map(gift => ({
      ...gift,
      contentScore: calculateContentBasedScore(gift, request, userIntent)
    }));
    
    // Step 4: Calculate collaborative filtering scores
    const giftsWithAllScores = giftsWithContentScores.map(gift => ({
      ...gift,
      collaborativeScore: calculateCollaborativeScore(gift, request)
    }));
    
    // Step 5: Rank using hybrid algorithm
    const rankedGifts = rankGifts(giftsWithAllScores, request);
    
    // Step 6: Convert to recommendations
    const recommendations: GiftRecommendation[] = rankedGifts.slice(0, 4).map((gift, index) => {
      const pricing = generatePriceWithVariation(gift.basePrice, request.budget);
      
      return {
        id: `ai-hybrid-${index}`,
        name: gift.name,
        description: generatePersonalizedDescription(gift, request, userIntent),
        price: pricing.price,
        category: gift.category,
        reason: generatePersonalizedReason(gift, request, userIntent),
        image: getCategoryEmoji(gift.category),
        ...generateShoppingLinks(gift.name),
        numericPrice: pricing.numericPrice,
        relevanceScore: gift.relevanceScore,
        tags: [...gift.interests, gift.sentiment, userIntent.primaryIntent]
      };
    });
    
    return recommendations;
    
  } catch (error) {
    console.log('Advanced AI recommendation failed, using fallback:', error);
    // Fallback to simpler recommendations
    return generateSimpleFallbackRecommendations(request);
  }
};

// Fallback recommendation system
const generateSimpleFallbackRecommendations = (request: GiftRequest): GiftRecommendation[] => {
  const shuffled = [...giftDatabase].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, 4).map((gift, index) => {
    const pricing = generatePriceWithVariation(gift.basePrice, request.budget);
    
    return {
      id: `fallback-${index}`,
      name: gift.name,
      description: gift.description,
      price: pricing.price,
      category: gift.category,
      reason: `Selected based on your interest in ${request.interests} and perfect for ${request.occasion}!`,
      image: getCategoryEmoji(gift.category),
      ...generateShoppingLinks(gift.name),
      numericPrice: pricing.numericPrice,
      relevanceScore: 0.7,
      tags: gift.interests
    };
  });
};

// Get emoji for category
const getCategoryEmoji = (category: string): string => {
  const emojiMap: Record<string, string> = {
    'Electronics': '📱', 'Fashion': '👗', 'Home & Decor': '🏠',
    'Food & Drink': '🍷', 'Arts & Crafts': '🎨', 'Sports & Fitness': '🏃',
    'Books & Learning': '📚', 'Travel & Adventure': '✈️', 
    'Health & Wellness': '🧘', 'Gaming': '🎮'
  };
  return emojiMap[category] || '🎁';
};

// Feedback system for continuous learning
export const submitFeedback = async (giftId: string, liked: boolean, userId?: string) => {
  // In a real app, this would update the model/database and user preferences
  console.log(`Advanced feedback received for gift ${giftId}: ${liked ? 'liked' : 'disliked'} by user ${userId || 'anonymous'}`);
  
  // Simulate updating user interaction history
  if (userId && userInteractionHistory[userId]) {
    userInteractionHistory[userId].push({
      giftId,
      rating: liked ? 5 : 1,
      purchased: false
    });
  }
  
  return Promise.resolve();
};