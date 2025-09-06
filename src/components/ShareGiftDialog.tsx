import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Share2, MessageCircle, Mail, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { GiftRecommendation } from '@/services/aiService';

interface ShareGiftDialogProps {
  gift: GiftRecommendation;
  recipientName: string;
}

export const ShareGiftDialog = ({ gift, recipientName }: ShareGiftDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const shareMessage = `Hey! I'm thinking of getting ${gift.name} (${gift.price}) for ${recipientName}. What do you think? 

${gift.description}

Check it out:
Amazon: ${gift.amazonLink}
Flipkart: ${gift.flipkartLink}

Would love your thoughts! 💭`;

  const shareLink = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
  const emailSubject = `Gift suggestion for ${recipientName}`;
  const emailBody = shareMessage;
  const emailLink = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
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
          <Share2 className="w-4 h-4 mr-2" />
          Ask Friends
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Get Friends' Opinion
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Share via</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button
                onClick={() => window.open(shareLink, '_blank')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => window.open(emailLink)}
                variant="outline"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Or copy message</Label>
            <div className="mt-2 space-y-2">
              <Textarea
                value={shareMessage}
                readOnly
                className="text-sm h-32 resize-none"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="w-full"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};