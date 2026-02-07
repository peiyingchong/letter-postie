import { useState } from "react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, 
  Type, 
  Flower, 
  Send, 
  ChevronLeft,
  X,
  Lock,
  Star,
  Check,
  RotateCcw,
  Minus,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { StudioCanvas } from "@/components/StudioCanvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { encodeLetter } from "@shared/routes";
import type { Letter } from "@shared/schema";

export default function Studio() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState<"bg" | "text" | "stickers">("bg");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [isSending, setIsSending] = useState(false);

  const getInitialState = () => ({
    senderName: "",
    recipientName: "",
    content: {
      background: "classic-white",
      textElements: [] as any[],
      images: [] as any[],
      stickers: [] as any[]
    }
  });

  const [letterState, setLetterState] = useState(getInitialState());

  const handleReset = () => {
    setLetterState(getInitialState());
    setActiveTab("bg");
    toast({
      title: "Canvas cleared",
      description: "Start fresh with a new letter."
    });
  };

  const handleAddText = () => {
    setLetterState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        textElements: [
          ...prev.content.textElements,
          { 
            id: Math.random().toString(36).substr(2, 9), 
            text: "New text", 
            x: 100, 
            y: 100, 
            font: "font-hand", 
            color: "#334155", 
            fontSize: 18,
            rotation: 0, 
            scale: 1,
            width: 180,
            height: 40
          }
        ]
      }
    }));
  };

  const handleAddSticker = (stickerId: string, isPremium: boolean) => {
    if (isPremium) {
      setShowPaymentModal(true);
      return;
    }
    setLetterState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        stickers: [
          ...prev.content.stickers,
          {
            id: Math.random().toString(36).substr(2, 9),
            stickerId,
            x: 150,
            y: 150,
            rotation: (Math.random() - 0.5) * 30,
            scale: 1
          }
        ]
      }
    }));
  };

  const handleUpdateElement = (type: string, id: string, data: any) => {
    setLetterState(prev => {
      const content = { ...prev.content };
      if (type === 'text') {
        content.textElements = content.textElements.map(el => 
          el.id === id ? { ...el, ...data } : el
        );
      } else if (type === 'sticker') {
        content.stickers = content.stickers.map(el => 
          el.id === id ? { ...el, ...data } : el
        );
      } else if (type === 'image') {
        content.images = content.images.map(el => 
          el.id === id ? { ...el, ...data } : el
        );
      }
      return { ...prev, content };
    });
  };

  const handleRemoveElement = (type: string, id: string) => {
    setLetterState(prev => {
      const content = { ...prev.content };
      if (type === 'text') {
        content.textElements = content.textElements.filter(el => el.id !== id);
      } else if (type === 'sticker') {
        content.stickers = content.stickers.filter(el => el.id !== id);
      } else if (type === 'image') {
        content.images = content.images.filter(el => el.id !== id);
      }
      return { ...prev, content };
    });
  };

  const handleSend = async () => {
    if (!letterState.senderName || !letterState.recipientName) {
      toast({
        title: "Missing details",
        description: "Please fill in sender and recipient names.",
        variant: "destructive"
      });
      setActiveTab("bg");
      return;
    }

    setIsSending(true);
    try {
      const letter: Letter = {
        senderName: letterState.senderName,
        recipientName: letterState.recipientName,
        content: {
          ...letterState.content,
          images: letterState.content.images || []
        },
        status: "sent"
      };

      const encoded = encodeLetter(letter);
      const url = `${window.location.origin}${window.location.pathname}#/letter/${encodeURIComponent(encoded)}`;
      setShareUrl(url);
      setShowShareModal(true);
    } catch (e) {
      console.error("Send error:", e);
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden">
      <div className="md:hidden h-16 border-b border-border flex items-center justify-between px-4 bg-white z-20">
        <Link to="/">
          <button className="p-2 -ml-2" data-testid="button-back-mobile"><ChevronLeft /></button>
        </Link>
        <span className="font-serif font-bold text-lg">Postie</span>
        <button onClick={handleSend} className="text-primary font-medium" data-testid="button-send-mobile">Send</button>
      </div>

      <div className="flex-1 relative flex flex-col h-full bg-muted/20">
        <div className="hidden md:flex absolute top-6 left-6 z-10 gap-2">
          <Link to="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full bg-white/80 backdrop-blur shadow-sm" data-testid="button-back">
              <ChevronLeft size={18} />
              Back
            </button>
          </Link>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-full bg-white/80 backdrop-blur shadow-sm"
            data-testid="button-reset"
          >
            <RotateCcw size={18} />
            Start Fresh
          </button>
        </div>
        
        <StudioCanvas 
          background={letterState.content.background}
          content={letterState.content}
          onUpdateElement={handleUpdateElement}
          onRemoveElement={handleRemoveElement}
        />
      </div>

      <div className="h-1/3 md:h-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-border flex flex-col z-20 shadow-2xl shadow-black/5">
        
        <div className="hidden md:flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-serif font-bold text-2xl text-primary">Design</h2>
          <button 
            onClick={handleSend}
            disabled={isSending}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
            data-testid="button-send"
          >
            {isSending ? "Creating..." : <>Send <Send size={16} /></>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-4">
             <label className="block text-xs font-mono uppercase text-muted-foreground tracking-wider">To & From</label>
             <div className="grid grid-cols-2 gap-4">
               <input 
                 placeholder="To: Name"
                 className="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-serif"
                 value={letterState.recipientName}
                 onChange={e => setLetterState({...letterState, recipientName: e.target.value})}
                 data-testid="input-recipient"
               />
               <input 
                 placeholder="From: Name"
                 className="w-full p-3 bg-muted/30 rounded-lg border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-serif"
                 value={letterState.senderName}
                 onChange={e => setLetterState({...letterState, senderName: e.target.value})}
                 data-testid="input-sender"
               />
             </div>
          </div>

          <div className="h-px bg-border w-full" />

          {activeTab === "bg" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="block text-xs font-mono uppercase text-muted-foreground tracking-wider">Paper Texture</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'classic-white', name: 'Classic', color: 'bg-white' },
                  { id: 'crumpled-paper', name: 'Vintage', color: 'bg-[#f4f1ea]' },
                  { id: 'rose-petal', name: 'Blush', color: 'bg-[#fff0f5]' },
                  { id: 'midnight-blue', name: 'Olive', color: 'bg-[#d4d8c1]' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setLetterState(prev => ({ ...prev, content: { ...prev.content, background: bg.id } }))}
                    className={`h-24 rounded-xl border-2 transition-all ${letterState.content.background === bg.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border'} ${bg.color} relative overflow-hidden group`}
                    data-testid={`button-bg-${bg.id}`}
                  >
                    <span className={`absolute bottom-2 left-3 text-xs font-medium text-primary`}>{bg.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <label className="block text-xs font-mono uppercase text-muted-foreground tracking-wider">Typography</label>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={handleAddText}
                  className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/5 transition-all font-medium flex items-center justify-center gap-2"
                  data-testid="button-add-text"
                >
                  <Type size={18} /> Add Text Block
                </button>
              </div>

              {letterState.content.textElements.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono uppercase text-muted-foreground tracking-wider">Font Size</label>
                  {letterState.content.textElements.map((el, idx) => (
                    <div 
                      key={el.id} 
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/50"
                      data-testid={`text-font-control-${idx}`}
                    >
                      <span className={cn("text-xs truncate flex-1 text-muted-foreground", el.font)}>{el.text || "Empty"}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleUpdateElement('text', el.id, { fontSize: Math.max(8, (el.fontSize || 18) - 2) })}
                          className="w-6 h-6"
                          data-testid={`button-font-decrease-${idx}`}
                        ><Minus size={12} /></Button>
                        <span className="text-xs font-mono w-7 text-center text-foreground" data-testid={`text-font-size-${idx}`}>
                          {el.fontSize || 18}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleUpdateElement('text', el.id, { fontSize: Math.min(72, (el.fontSize || 18) + 2) })}
                          className="w-6 h-6"
                          data-testid={`button-font-increase-${idx}`}
                        ><Plus size={12} /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="h-px bg-border w-full" />
              
              <label className="block text-xs font-mono uppercase text-muted-foreground tracking-wider">Images</label>
              <input 
                type="file"
                accept="image/*"
                id="image-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const url = event.target?.result as string;
                      setLetterState(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          images: [
                            ...prev.content.images,
                            { 
                              id: Math.random().toString(36).substr(2, 9), 
                              url, 
                              x: 150, 
                              y: 150, 
                              rotation: 0, 
                              scale: 1 
                            }
                          ] as any[]
                        }
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                  e.target.value = '';
                }}
                data-testid="input-image-upload"
              />
              <div 
                className="w-full py-8 border-2 border-dashed border-border rounded-xl text-muted-foreground flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => document.getElementById('image-upload')?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const url = event.target?.result as string;
                      setLetterState(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          images: [
                            ...prev.content.images,
                            { 
                              id: Math.random().toString(36).substr(2, 9), 
                              url, 
                              x: 150, 
                              y: 150, 
                              rotation: 0, 
                              scale: 1 
                            }
                          ] as any[]
                        }
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                data-testid="dropzone-image"
              >
                <Palette size={24} />
                <span className="text-sm">Click or drop image to add</span>
              </div>
            </div>
          )}

          {activeTab === "stickers" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
               <label className="block text-xs font-mono uppercase text-muted-foreground tracking-wider">Festive Stickers</label>
               <div className="grid grid-cols-3 gap-3">
                 {[
                   { id: 'lny-stamp-1', icon: '/assets/stickers/lny-stamp-1.png', premium: false },
                   { id: 'lny-stamp-2', icon: '/assets/stickers/lny-stamp-2.jpg', premium: false },
                   { id: 'lny-stamp-3', icon: '/assets/stickers/lny-stamp-3.jpeg', premium: false },
                   { id: 'lny-horses', icon: '/assets/stickers/lny-horses.png', premium: false },
                   { id: 'heart-red', icon: '/assets/stickers/heart-red.png', premium: false },
                   { id: 'pepper', icon: '/assets/stickers/pepper.png', premium: false },
                   { id: 'tomato', icon: '/assets/stickers/tomato.png', premium: false },
                   { id: 'carrot', icon: '/assets/stickers/carrot.png', premium: false },
                   { id: 'potato', icon: '/assets/stickers/potato.png', premium: false },
                   { id: 'lemon', icon: '/assets/stickers/lemon.png', premium: false },
                   { id: 'pasta', icon: '/assets/stickers/pasta.png', premium: false },
                   { id: 'cheese', icon: '/assets/stickers/cheese.png', premium: false },
                   { id: 'pizza', icon: '/assets/stickers/pizza.png', premium: false },
                   { id: 'fish-plate', icon: '/assets/stickers/fish-plate.png', premium: false },
                   { id: 'fish-group', icon: '/assets/stickers/fish-group.png', premium: false },
                   { id: 'sardines', icon: '/assets/stickers/sardines.png', premium: false },
                   { id: 'heart', icon: '❤️', premium: false },
                   { id: 'star', icon: '⭐', premium: false },
                 ].map((s) => (
                   <button
                     key={s.id}
                     onClick={() => handleAddSticker(s.icon, s.premium)}
                     className="aspect-square rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors flex items-center justify-center overflow-hidden relative group"
                     data-testid={`button-sticker-${s.id}`}
                   >
                     {s.icon.startsWith('/assets') ? (
                       <img src={s.icon} alt="Sticker" className="w-full h-full object-contain p-1" />
                     ) : (
                       <span className="text-3xl">{s.icon}</span>
                     )}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>

        <div className="p-2 border-t border-border flex gap-2 bg-muted/10">
          {[
            { id: "bg", icon: <Palette size={20} />, label: "Paper" },
            { id: "text", icon: <Type size={20} />, label: "Text" },
            { id: "stickers", icon: <Flower size={20} />, label: "Decor" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === tab.id 
                  ? 'bg-primary text-primary-foreground shadow-md' 
                  : 'text-muted-foreground hover:bg-muted'
              }`}
              data-testid={`button-tab-${tab.id}`}
            >
              {tab.icon}
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-serif">
              <Star className="fill-yellow-400 text-yellow-400" /> Premium Sticker
            </DialogTitle>
            <DialogDescription>
              Unlock this premium sticker for just $0.99. Support the creators of Postie.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={() => {
              toast({ title: "Purchase successful", description: "Premium stickers unlocked!" });
              setShowPaymentModal(false);
            }} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all">
              Purchase ($0.99)
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Ready to Send</DialogTitle>
            <DialogDescription>
              Your letter has been sealed. Share this unique link with your recipient.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border flex items-center justify-between gap-2 overflow-hidden">
            <code className="text-sm font-mono break-all text-muted-foreground" data-testid="text-share-url">{shareUrl}</code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast({ title: "Copied!", description: "Link copied to clipboard." });
              }}
              className="p-2 hover:bg-white rounded-md transition-colors flex-shrink-0"
              data-testid="button-copy-link"
            >
              <Check size={16} className="text-green-600" />
            </button>
          </div>
          <div className="flex justify-end mt-4">
            <button 
              onClick={() => {
                const encoded = shareUrl.split('/letter/').pop() || '';
                navigate(`/letter/${encoded}`);
              }}
              className="text-sm font-medium text-primary hover:underline" 
              data-testid="button-preview"
            >
              Preview Letter
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
