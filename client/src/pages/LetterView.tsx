import { useState } from "react";
import { useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useLetter } from "@/hooks/use-letters";
import { StudioCanvas } from "@/components/StudioCanvas";
import { Loader2 } from "lucide-react";

export default function LetterView() {
  const [match, params] = useRoute("/letter/:shareId");
  const shareId = params?.shareId || "";
  const { data: letter, isLoading, error } = useLetter(shareId);
  const [isOpen, setIsOpen] = useState(false);
  const [showLetter, setShowLetter] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground font-serif">
        Letter not found. It may have been lost in the post.
      </div>
    );
  }

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      setShowLetter(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--secondary)_0%,transparent_60%)] -z-10 opacity-50" />

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ 
              scale: 1.1, 
              opacity: 0,
              y: -50,
              rotateX: 20,
              transition: { duration: 0.8, ease: "easeInOut" }
            }}
            className="cursor-pointer group relative"
            onClick={handleOpen}
            data-testid="envelope-click"
          >
            {/* Envelope Visual */}
            <div className="w-[320px] h-[220px] md:w-[400px] md:h-[280px] bg-[#f4f1ea] shadow-2xl rounded-sm relative flex items-center justify-center border-b-4 border-r-4 border-black/5 transform transition-transform duration-500 group-hover:-translate-y-2">
              {/* Flap */}
              <motion.div 
                className="absolute top-0 left-0 right-0 h-1/2 bg-[#e8e5de] [clip-path:polygon(0%_0%,50%_100%,100%_0%)] shadow-inner origin-top"
                animate={isOpen ? { rotateX: 180, transition: { duration: 0.6 } } : {}}
              />
              
              {/* Wax Seal */}
              <div className="absolute top-[40%] bg-red-800 w-12 h-12 rounded-full shadow-md flex items-center justify-center border-4 border-red-900/50 z-10 group-hover:scale-110 transition-transform">
                <span className="text-white/80 text-xs font-serif italic">P</span>
              </div>

              <div className="mt-16 text-center font-hand text-xl text-primary/80 rotate-[-2deg]">
                For {letter.recipientName}
              </div>
            </div>
            
            <p className="mt-8 text-center text-muted-foreground text-sm font-mono animate-pulse">
              Click to open
            </p>
          </motion.div>
        ) : !showLetter ? (
          <motion.div
            key="opening"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{ 
                y: [-20, -100, -150],
                opacity: [1, 1, 0],
                rotateX: [0, -10, -20],
                scale: [1, 1.05, 1.1]
              }}
              transition={{ 
                duration: 1.2, 
                ease: "easeOut",
                times: [0, 0.5, 1]
              }}
              className="w-[320px] h-[220px] md:w-[400px] md:h-[280px] bg-[#f4f1ea] shadow-2xl rounded-sm relative flex items-center justify-center"
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#e8e5de] [clip-path:polygon(0%_0%,50%_100%,100%_0%)] origin-top" 
                   style={{ transform: 'rotateX(180deg)' }} 
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: { delay: 0.6, duration: 0.8, ease: "easeOut" }
              }}
              className="absolute text-primary font-serif text-lg"
            >
              Opening your letter...
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 80,
              duration: 1
            }}
            className="w-full max-w-4xl h-[70vh] relative"
          >
            <motion.div 
              className="w-full h-full"
              initial={{ rotateY: -10 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <StudioCanvas 
                background={letter.content.background}
                content={letter.content}
                onUpdateElement={() => {}}
                isReadOnly={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {showLetter && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <p className="text-muted-foreground mb-2 text-sm font-serif">With love from {letter.senderName}</p>
          <a href="/" className="text-primary font-serif italic hover:underline" data-testid="link-create-own">
            Create your own letter with Postie
          </a>
        </motion.div>
      )}
    </div>
  );
}
