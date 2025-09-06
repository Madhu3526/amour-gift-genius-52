import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Sparkles } from 'lucide-react';
import type { GiftRequest } from '@/services/aiService';

interface GiftFinderFormProps {
  onSubmit: (request: GiftRequest) => void;
  loading: boolean;
}

export const GiftFinderForm = ({ onSubmit, loading }: GiftFinderFormProps) => {
  const [formData, setFormData] = useState<GiftRequest>({
    recipientName: '',
    age: 25,
    relationship: '',
    occasion: '',
    budget: '',
    interests: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof GiftRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-card backdrop-blur-sm bg-card/80">
      <CardHeader className="text-center pb-6">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          <Heart className="w-6 h-6 text-primary animate-glow" />
          Find the Perfect Gift
          <Sparkles className="w-6 h-6 text-accent animate-float" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient's Name</Label>
              <Input
                id="recipientName"
                placeholder="e.g., Sarah"
                value={formData.recipientName}
                onChange={(e) => updateField('recipientName', e.target.value)}
                required
                className="transition-smooth hover:shadow-glow/20 focus:shadow-glow/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="100"
                value={formData.age}
                onChange={(e) => updateField('age', parseInt(e.target.value) || 25)}
                required
                className="transition-smooth hover:shadow-glow/20 focus:shadow-glow/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select onValueChange={(value) => updateField('relationship', value)} required>
                <SelectTrigger className="transition-smooth hover:shadow-glow/20">
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romantic-partner">Romantic Partner</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="best-friend">Best Friend</SelectItem>
                  <SelectItem value="friend">Friend</SelectItem>
                  <SelectItem value="family-member">Family Member</SelectItem>
                  <SelectItem value="colleague">Colleague</SelectItem>
                  <SelectItem value="acquaintance">Acquaintance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion">Occasion</Label>
              <Select onValueChange={(value) => updateField('occasion', value)} required>
                <SelectTrigger className="transition-smooth hover:shadow-glow/20">
                  <SelectValue placeholder="Select occasion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="anniversary">Anniversary</SelectItem>
                  <SelectItem value="valentines-day">Valentine's Day</SelectItem>
                  <SelectItem value="christmas">Christmas</SelectItem>
                  <SelectItem value="graduation">Graduation</SelectItem>
                  <SelectItem value="promotion">Promotion</SelectItem>
                  <SelectItem value="just-because">Just Because</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget Range</Label>
            <Select onValueChange={(value) => updateField('budget', value)} required>
              <SelectTrigger className="transition-smooth hover:shadow-glow/20">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-50">Under $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100-200">$100 - $200</SelectItem>
                <SelectItem value="200-500">$200 - $500</SelectItem>
                <SelectItem value="over-500">Over $500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interests">Their Interests & Hobbies</Label>
            <Textarea
              id="interests"
              placeholder="e.g., loves coffee, enjoys reading sci-fi novels, passionate about photography, practices yoga..."
              value={formData.interests}
              onChange={(e) => updateField('interests', e.target.value)}
              required
              className="min-h-20 transition-smooth hover:shadow-glow/20 focus:shadow-glow/30"
            />
          </div>

          <Button 
            type="submit" 
            variant="hero"
            size="lg"
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Finding Perfect Gifts...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 mr-2" />
                Find Perfect Gifts
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};