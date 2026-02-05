import { useEffect, useState } from "react";
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--secondary)_0%,transparent_60%)] -z-10 opacity-50" />

      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0, y: 100 }}
            className="cursor-pointer group relative"
            onClick={() => setIsOpen(true)}
          >
            {/* Envelope Visual */}
            <div className="w-[320px] h-[220px] md:w-[400px] md:h-[280px] bg-[#f4f1ea] shadow-2xl rounded-sm relative flex items-center justify-center border-b-4 border-r-4 border-black/5 transform transition-transform duration-500 group-hover:-translate-y-2">
              {/* Flap */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-[#e8e5de] [clip-path:polygon(0%_0%,50%_100%,100%_0%)] shadow-inner" />
              
              {/* Wax Seal */}
              <div className="absolute top-[40%] bg-red-800 w-12 h-12 rounded-full shadow-md flex items-center justify-center border-4 border-red-900/50 z-10 group-hover:scale-110 transition-transform">
                <span className="text-white/80 text-xs font-serif italic">L</span>
              </div>

              <div className="mt-16 text-center font-hand text-xl text-primary/80 rotate-[-2deg]">
                For {letter.recipientName}
              </div>
            </div>
            
            <p className="mt-8 text-center text-muted-foreground text-sm font-mono animate-pulse">
              Click to open
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
            className="w-full max-w-xl h-[80vh] relative perspective-1000"
          >
             <div className="w-full h-full transform transition-transform duration-1000 preserve-3d">
                <StudioCanvas 
                  background={letter.content.content.background}
                  content={letter.content.content}
                  onUpdateElement={() => {}} // Read only
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-0 right-0 text-center"
        >
          <a href="/" className="text-primary font-serif italic hover:underline">
            Create your own letter
          </a>
        </motion.div>
      )}
    </div>
  );
}
