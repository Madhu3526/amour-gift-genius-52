import { useState } from 'react';
import { GiftFinderForm } from '@/components/GiftFinderForm';
import { GiftCard } from '@/components/GiftCard';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Gift, Users, Zap } from 'lucide-react';
import { generateGiftRecommendations, type GiftRequest, type GiftRecommendation } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-image.jpg';

const Index = () => {
  const [recommendations, setRecommendations] = useState<GiftRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const { toast } = useToast();

  const handleGiftSearch = async (request: GiftRequest) => {
    setLoading(true);
    setRecipientName(request.recipientName);
    try {
      const gifts = await generateGiftRecommendations(request);
      setRecommendations(gifts);
      toast({
        title: "Perfect gifts found!",
        description: `We found ${gifts.length} amazing gift ideas for ${request.recipientName}`,
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (giftId: string, liked: boolean) => {
    // Simple feedback logging for now
    console.log(`Feedback for gift ${giftId}: ${liked ? 'liked' : 'disliked'}`);
    toast({
      title: liked ? "Thanks for the feedback!" : "Thanks for letting us know",
      description: liked ? "We're glad you love this suggestion!" : "We'll improve our recommendations",
    });
  };

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('gift-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-6">
              <span className="bg-gradient-primary bg-clip-text text-transparent animate-glow">
                Amour
              </span>
            </h1>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-light text-muted-foreground mb-4">
              You think it, we gift it.
            </p>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              AI-powered gifting assistant that finds the perfect present for anyone, 
              any occasion, any budget. Let artificial intelligence help you express your love.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={scrollToForm}
              className="text-lg px-8 py-6 h-auto animate-float"
            >
              <Heart className="w-6 h-6 mr-2" />
              Find Perfect Gifts
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-6 h-auto hover:bg-gradient-glass hover:border-primary/40"
            >
              <Sparkles className="w-6 h-6 mr-2" />
              How It Works
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-spring">
                <Zap className="w-8 h-8 text-primary-foreground animate-glow" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">AI-Powered</h3>
              <p className="text-muted-foreground">Advanced AI analyzes personalities and preferences</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-secondary rounded-full flex items-center justify-center group-hover:shadow-glow transition-spring">
                <Users className="w-8 h-8 text-secondary-foreground animate-float" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Personalized</h3>
              <p className="text-muted-foreground">Tailored recommendations for every relationship</p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center group-hover:shadow-glow transition-spring">
                <Gift className="w-8 h-8 text-primary-foreground animate-glow" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Perfect Match</h3>
              <p className="text-muted-foreground">Find gifts that create lasting memories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gift Finder Form */}
      {showForm && (
        <section id="gift-form" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/20 to-background">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Let's Find Something Amazing
              </h2>
              <p className="text-xl text-muted-foreground">
                Tell us about them, and we'll find the perfect gift
              </p>
            </div>
            
            <GiftFinderForm onSubmit={handleGiftSearch} loading={loading} />
          </div>
        </section>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                Perfect Gift Recommendations
              </h2>
              <p className="text-xl text-muted-foreground">
                Curated by AI, perfected by love
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {recommendations.map((gift) => (
                <GiftCard 
                  key={gift.id} 
                  gift={gift} 
                  onFeedback={handleFeedback}
                  recipientName={recipientName}
                />
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowForm(true)}
                className="hover:bg-gradient-glass hover:border-primary/40"
              >
                <Heart className="w-4 h-4 mr-2" />
                Find More Gifts
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-gradient-glass">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            Made with <Heart className="w-4 h-4 inline text-primary animate-glow" /> by Amour AI
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;