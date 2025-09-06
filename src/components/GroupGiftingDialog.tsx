import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Calculator, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GiftRecommendation } from '@/services/aiService';

interface GroupGiftingDialogProps {
  gift: GiftRecommendation;
  recipientName: string;
}

export const GroupGiftingDialog = ({ gift, recipientName }: GroupGiftingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(2);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const totalAmount = gift.numericPrice;
  const amountPerPerson = Math.ceil(totalAmount / numberOfPeople);

  const groupGiftMessage = `🎁 Group Gift for ${recipientName}!

Gift: ${gift.name}
Total Cost: ${gift.price}
Split among ${numberOfPeople} people: ₹${amountPerPerson.toLocaleString('en-IN')} per person

${gift.description}

Shopping links:
• Amazon: ${gift.amazonLink}
• Flipkart: ${gift.flipkartLink}

Let's make this gift happen together! 💝

Reply if you're in! 🙌`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(groupGiftMessage)}`;
  const emailSubject = `Group Gift for ${recipientName} - ₹${amountPerPerson.toLocaleString('en-IN')} per person`;
  const emailLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(groupGiftMessage)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(groupGiftMessage);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Group gift message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the message manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Users className="w-4 h-4 mr-2" />
          Group Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Split the Cost
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gradient-secondary/20 p-4 rounded-lg border border-secondary/30">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Total Gift Cost</p>
              <p className="text-2xl font-bold text-primary">{gift.price}</p>
            </div>
          </div>

          <div>
            <Label htmlFor="people">Number of people contributing</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNumberOfPeople(Math.max(2, numberOfPeople - 1))}
                disabled={numberOfPeople <= 2}
              >
                -
              </Button>
              <Input
                id="people"
                type="number"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(Math.max(2, parseInt(e.target.value) || 2))}
                min={2}
                className="text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNumberOfPeople(numberOfPeople + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="bg-gradient-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center justify-center gap-2 text-center">
              <Calculator className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Cost per person</p>
                <p className="text-xl font-bold text-primary">
                  ₹{amountPerPerson.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>

          <div>
            <Label>Share with contributors</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                onClick={() => window.open(whatsappLink, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => window.open(emailLink)}
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Message Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Group Gift Message
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded">
            <p>💡 <strong>Pro tip:</strong> For payment collection, consider using services like Google Pay, PhonePe, or UPI for easy money collection among friends!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};