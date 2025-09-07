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

// Ollama API configuration
const OLLAMA_BASE_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.1';

// Check if Ollama is available
const checkOllamaAvailability = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch (error) {
    console.log('Ollama not available:', error);
    return false;
  }
};

// Format user details into structured prompt for LLaMA
const formatPromptForLLaMA = (userDetails: GiftRequest): string => {
  const interestsArray = userDetails.interests.split(',').map(i => i.trim());
  
  return `You are an AI gift recommendation assistant. 
The recipient details are:

Age: ${userDetails.age}
Relationship: ${userDetails.relationship}
Occasion: ${userDetails.occasion}
Budget: ${userDetails.budget}
Interests: ${interestsArray.join(', ')}

Suggest 5 unique and personalized gift ideas (not from a predefined list or catalog). 
Each idea should include:
1. The gift idea name
2. A short explanation why it fits this recipient
3. Make sure it respects the budget and occasion.

Format your response as a JSON array with objects containing:
- name: string
- description: string
- reason: string
- category: string
- estimatedPrice: string

Example format:
[
  {
    "name": "Custom Photo Album",
    "description": "A personalized photo album with their favorite memories",
    "reason": "Perfect for preserving precious moments and shows thoughtfulness",
    "category": "Personalized",
    "estimatedPrice": "₹1,500"
  }
]`;
};

// Call Ollama model for gift recommendations
const generateOllamaRecommendations = async (userDetails: GiftRequest): Promise<any[]> => {
  const isOllamaAvailable = await checkOllamaAvailability();
  
  if (!isOllamaAvailable) {
    console.log('Ollama not available, using rule-based recommendations');
    return generateRuleBasedRecommendations(userDetails);
  }

  try {
    const prompt = formatPromptForLLaMA(userDetails);
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          max_tokens: 500
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.response || '';
    
    // Try to parse JSON response
    try {
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.log('Failed to parse Ollama JSON response, using rule-based fallback');
    }
    
    // Fallback: Use rule-based recommendations
    return generateRuleBasedRecommendations(userDetails);
    
  } catch (error) {
    console.log('Ollama generation failed:', error);
    return generateRuleBasedRecommendations(userDetails);
  }
};

// Rule-based recommendations as fallback
const generateRuleBasedRecommendations = (userDetails: GiftRequest): any[] => {
  const interests = userDetails.interests.toLowerCase();
  const age = userDetails.age;
  const relationship = userDetails.relationship.toLowerCase();
  const occasion = userDetails.occasion.toLowerCase();
  const budgetRanges: Record<string, { min: number, max: number }> = {
    'Under ₹1,000': { min: 500, max: 1000 },
    '₹1,000 - ₹5,000': { min: 1000, max: 5000 },
    '₹5,000 - ₹10,000': { min: 5000, max: 10000 },
    '₹10,000 - ₹25,000': { min: 10000, max: 25000 },
    'Above ₹25,000': { min: 25000, max: 50000 }
  };
  
  const budget = budgetRanges[userDetails.budget] || { min: 1000, max: 5000 };
  const recommendations: any[] = [];

  // Tech enthusiast recommendations
  if (interests.includes('tech') || interests.includes('gadget')) {
    if (budget.max >= 15000) {
      recommendations.push({
        name: "Smart Fitness Watch",
        description: "Advanced smartwatch with health monitoring and GPS tracking",
        reason: `Perfect for a ${age}-year-old who loves technology and staying connected`,
        category: "Electronics",
        estimatedPrice: `₹${Math.min(15000, budget.max)}`
      });
    }
    if (budget.max >= 3000) {
      recommendations.push({
        name: "Wireless Earbuds",
        description: "Premium wireless earbuds with noise cancellation",
        reason: "Great for someone who appreciates technology and music",
        category: "Electronics",
        estimatedPrice: `₹${Math.min(3500, budget.max)}`
      });
    }
  }

  // Reading/learning enthusiast
  if (interests.includes('read') || interests.includes('book') || interests.includes('learn')) {
    recommendations.push({
      name: "Curated Book Collection",
      description: "Handpicked books based on their interests and personal growth",
      reason: `Thoughtfully selected for someone who loves learning and reading`,
      category: "Books & Learning",
      estimatedPrice: `₹${Math.min(2000, budget.max)}`
    });
    
    if (budget.max >= 8000) {
      recommendations.push({
        name: "E-Reader with Premium Case",
        description: "Digital reading device with a leather protective case",
        reason: "Perfect for a book lover who appreciates modern convenience",
        category: "Electronics",
        estimatedPrice: `₹${Math.min(8000, budget.max)}`
      });
    }
  }

  // Fitness enthusiast
  if (interests.includes('fitness') || interests.includes('health') || interests.includes('sport')) {
    recommendations.push({
      name: "Premium Yoga Mat Set",
      description: "Eco-friendly yoga mat with accessories and carrying bag",
      reason: "Ideal for someone passionate about fitness and wellness",
      category: "Sports & Fitness",
      estimatedPrice: `₹${Math.min(2800, budget.max)}`
    });
    
    if (budget.max >= 1200) {
      recommendations.push({
        name: "Resistance Band Training Kit",
        description: "Complete resistance training system for home workouts",
        reason: "Great for maintaining fitness routines at home",
        category: "Sports & Fitness",
        estimatedPrice: `₹${Math.min(1200, budget.max)}`
      });
    }
  }

  // Art and creativity
  if (interests.includes('art') || interests.includes('creative') || interests.includes('paint')) {
    if (budget.max >= 5000) {
      recommendations.push({
        name: "Professional Art Supply Kit",
        description: "Complete set of premium art supplies for various mediums",
        reason: "Perfect for unleashing their creative potential",
        category: "Arts & Crafts",
        estimatedPrice: `₹${Math.min(5000, budget.max)}`
      });
    }
    
    recommendations.push({
      name: "Pottery Starter Kit",
      description: "Everything needed to start pottery as a hobby",
      reason: "Encourages creativity and provides a relaxing artistic outlet",
      category: "Arts & Crafts",
      estimatedPrice: `₹${Math.min(3200, budget.max)}`
    });
  }

  // Music lover
  if (interests.includes('music') || interests.includes('sing') || interests.includes('instrument')) {
    if (budget.max >= 2500) {
      recommendations.push({
        name: "Bluetooth Speaker Premium",
        description: "High-quality portable speaker with rich sound",
        reason: "Perfect for a music enthusiast who loves sharing great sound",
        category: "Electronics",
        estimatedPrice: `₹${Math.min(2500, budget.max)}`
      });
    }
  }

  // Cooking enthusiast
  if (interests.includes('cook') || interests.includes('food') || interests.includes('culinary')) {
    recommendations.push({
      name: "Gourmet Spice Collection",
      description: "Premium spices from around the world with recipe cards",
      reason: "Perfect for someone who loves experimenting with flavors",
      category: "Food & Cooking",
      estimatedPrice: `₹${Math.min(1800, budget.max)}`
    });
    
    if (budget.max >= 4000) {
      recommendations.push({
        name: "Professional Knife Set",
        description: "High-quality kitchen knives with wooden block",
        reason: "Essential tools for any cooking enthusiast",
        category: "Food & Cooking",
        estimatedPrice: `₹${Math.min(4000, budget.max)}`
      });
    }
  }

  // Travel enthusiast
  if (interests.includes('travel') || interests.includes('adventure') || interests.includes('explore')) {
    recommendations.push({
      name: "Travel Organizer Set",
      description: "Complete travel organization kit with packing cubes",
      reason: "Makes traveling more organized and enjoyable",
      category: "Travel & Adventure",
      estimatedPrice: `₹${Math.min(2200, budget.max)}`
    });
    
    if (budget.max >= 8000) {
      recommendations.push({
        name: "Instant Camera Travel Kit",
        description: "Portable camera for capturing travel memories instantly",
        reason: "Perfect for creating lasting memories during adventures",
        category: "Travel & Adventure",
        estimatedPrice: `₹${Math.min(8000, budget.max)}`
      });
    }
  }

  // General gifts based on relationship and occasion
  if (relationship.includes('parent') || relationship.includes('mom') || relationship.includes('dad')) {
    recommendations.push({
      name: "Aromatherapy Diffuser Set",
      description: "Essential oil diffuser with a collection of calming oils",
      reason: "Promotes relaxation and creates a peaceful home environment",
      category: "Health & Wellness",
      estimatedPrice: `₹${Math.min(3200, budget.max)}`
    });
  }

  if (occasion.includes('birthday') && age >= 18 && age <= 30) {
    recommendations.push({
      name: "Personalized Photo Frame Collection",
      description: "Custom photo frames for displaying favorite memories",
      reason: "Thoughtful way to celebrate another year of life and memories",
      category: "Personalized",
      estimatedPrice: `₹${Math.min(1500, budget.max)}`
    });
  }

  // Ensure we have at least 5 recommendations
  while (recommendations.length < 5) {
    recommendations.push({
      name: "Premium Gift Card Collection",
      description: "Flexible gift cards for their favorite stores and experiences",
      reason: `Gives them the freedom to choose something they truly want for ${occasion}`,
      category: "Gift Cards",
      estimatedPrice: `₹${Math.min(2000, budget.max)}`
    });
  }

  return recommendations.slice(0, 5);
};

// Extract numeric price from string
const extractNumericPrice = (priceString: string): number => {
  const match = priceString.match(/₹?[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/[₹,]/g, ''));
  }
  return 2000; // Default price
};

// Generate shopping links
const generateShoppingLinks = (productName: string) => {
  const searchQuery = encodeURIComponent(productName);
  return {
    amazonLink: `https://www.amazon.in/s?k=${searchQuery}`,
    flipkartLink: `https://www.flipkart.com/search?q=${searchQuery}`
  };
};

// Main AI recommendation engine using Ollama
export const generateGiftRecommendations = async (request: GiftRequest): Promise<GiftRecommendation[]> => {
  try {
    console.log('Generating AI-powered gift recommendations with Ollama Llama 3.1...');
    
    // Get Ollama-generated recommendations (or rule-based fallback)
    const ollamaGifts = await generateOllamaRecommendations(request);
    
    if (ollamaGifts.length > 0) {
      // Convert recommendations to our format
      const recommendations: GiftRecommendation[] = ollamaGifts.map((gift, index) => {
        const { amazonLink, flipkartLink } = generateShoppingLinks(gift.name);
        const numericPrice = extractNumericPrice(gift.estimatedPrice || '₹2000');
        
        return {
          id: `ai-gift-${index + 1}`,
          name: gift.name,
          description: gift.description || `A wonderful ${gift.name.toLowerCase()} perfect for your ${request.relationship}`,
          price: gift.estimatedPrice || '₹2,000',
          category: gift.category || 'General',
          reason: gift.reason || `AI-recommended based on their interests in ${request.interests} and the ${request.occasion} occasion`,
          image: `https://images.unsplash.com/400x300/?${encodeURIComponent(gift.name)}`,
          amazonLink,
          flipkartLink,
          numericPrice,
          relevanceScore: 0.95 - (index * 0.1), // Decreasing relevance
          tags: request.interests.split(',').map(i => i.trim())
        };
      });

      console.log(`Generated ${recommendations.length} AI-powered recommendations`);
      return recommendations;
    }
    
    // Should not reach here as generateLLaMARecommendations always returns fallback
    return getFallbackRecommendations(request);
    
  } catch (error) {
    console.error('Gift recommendation error:', error);
    return getFallbackRecommendations(request);
  }
};

// Enhanced fallback recommendations
const getFallbackRecommendations = (request: GiftRequest): GiftRecommendation[] => {
  const fallbackGifts = [
    {
      name: "Personalized Gift Box",
      description: "Curated collection of items tailored to their interests",
      category: "Personalized",
      basePrice: 2500
    },
    {
      name: "Experience Voucher",
      description: "Memorable experience they can enjoy and cherish",
      category: "Experiences",
      basePrice: 3000
    },
    {
      name: "Premium Subscription Box",
      description: "Monthly delivery of items matching their hobbies",
      category: "Subscriptions",
      basePrice: 1500
    },
    {
      name: "Artisan Craft Collection",
      description: "Handmade items supporting local artisans",
      category: "Handmade",
      basePrice: 2000
    },
    {
      name: "Wellness Care Package",
      description: "Self-care items for relaxation and well-being",
      category: "Wellness",
      basePrice: 2800
    }
  ];

  return fallbackGifts.map((gift, index) => {
    const { amazonLink, flipkartLink } = generateShoppingLinks(gift.name);
    
    return {
      id: `fallback-${index + 1}`,
      name: gift.name,
      description: gift.description,
      price: `₹${gift.basePrice.toLocaleString('en-IN')}`,
      category: gift.category,
      reason: `Carefully selected based on your preferences for a ${request.age}-year-old ${request.relationship}`,
      image: `https://images.unsplash.com/400x300/?${encodeURIComponent(gift.name)}`,
      amazonLink,
      flipkartLink,
      numericPrice: gift.basePrice,
      relevanceScore: 0.8 - (index * 0.1),
      tags: request.interests.split(',').map(i => i.trim())
    };
  });
};

// Mock delay for realistic AI processing
export const simulateAIProcessing = async (): Promise<void> => {
  const delay = Math.random() * 2000 + 1000; // 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, delay));
};