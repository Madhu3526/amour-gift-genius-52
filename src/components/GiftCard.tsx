import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ThumbsUp, ThumbsDown, ExternalLink, ShoppingCart } from 'lucide-react';
import { ShareGiftDialog } from './ShareGiftDialog';
import { GroupGiftingDialog } from './GroupGiftingDialog';
import type { GiftRecommendation } from '@/services/aiService';

interface GiftCardProps {
  gift: GiftRecommendation;
  onFeedback: (giftId: string, liked: boolean) => void;
  recipientName?: string;
}

export const GiftCard = ({ gift, onFeedback, recipientName = "them" }: GiftCardProps) => {
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFeedback = (liked: boolean) => {
    setFeedback(liked);
    onFeedback(gift.id, liked);
  };

  return (
    <Card 
      className="group transition-spring hover:shadow-premium hover:-translate-y-2 cursor-pointer bg-gradient-glass backdrop-blur-sm border-primary/20 hover:border-primary/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="text-6xl animate-float">
            {gift.image}
          </div>
          <Badge 
            variant="secondary" 
            className="bg-gradient-secondary text-secondary-foreground px-3 py-1"
          >
            {gift.category}
          </Badge>
        </div>
        <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-smooth">
          {gift.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-muted-foreground leading-relaxed">
          {gift.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {gift.price}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-smooth hover:bg-primary hover:text-primary-foreground"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
        
        <div className="p-4 rounded-lg bg-gradient-secondary/20 border border-secondary/30">
          <div className="flex items-start gap-2">
            <Heart className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-secondary-foreground leading-relaxed">
              <strong>Why this is perfect:</strong> {gift.reason}
            </p>
          </div>
        </div>

        {/* Shopping Links */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Shop Now:</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(gift.amazonLink, '_blank')}
              className="hover:bg-orange-500 hover:text-white transition-smooth"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Amazon
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(gift.flipkartLink, '_blank')}
              className="hover:bg-blue-600 hover:text-white transition-smooth"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Flipkart
            </Button>
          </div>
        </div>

        {/* Social Features */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <ShareGiftDialog gift={gift} recipientName={recipientName} />
            <GroupGiftingDialog gift={gift} recipientName={recipientName} />
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3 pt-2">
          <span className="text-sm text-muted-foreground">Was this helpful?</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback(true)}
              className={`transition-smooth hover:bg-primary hover:text-primary-foreground ${
                feedback === true ? 'bg-primary text-primary-foreground' : ''
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleFeedback(false)}
              className={`transition-smooth hover:bg-destructive hover:text-destructive-foreground ${
                feedback === false ? 'bg-destructive text-destructive-foreground' : ''
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};