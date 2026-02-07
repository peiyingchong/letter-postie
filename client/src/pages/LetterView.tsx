import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { StudioCanvas } from "@/components/StudioCanvas";
import { Loader2 } from "lucide-react";
import { decodeLetter } from "@shared/routes";

export default function LetterView() {
  const { encodedData } = useParams<{ encodedData: string }>();
  const [isOpen, setIsOpen] = useState(false);

  const letter = encodedData ? decodeLetter(decodeURIComponent(encodedData)) : null;

  if (!letter) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-muted-foreground font-serif gap-4">
        <p>Letter not found. It may have been lost in the post.</p>
        <Link to="/" className="text-primary hover:underline text-sm">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ 
              y: -150,
              opacity: 0,
              scale: 0.9,
              rotateX: -15,
              transition: { 
                duration: 0.8, 
                ease: [0.4, 0, 0.2, 1]
              }
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="cursor-pointer group relative"
            onClick={() => setIsOpen(true)}
            data-testid="envelope-click"
          >
            <div className="absolute inset-0 translate-y-6 bg-black/15 blur-2xl rounded-lg scale-[0.92]" />
            
            <div className="w-[280px] h-[200px] sm:w-[320px] sm:h-[220px] md:w-[400px] md:h-[280px] bg-gradient-to-br from-[#f8f5f0] to-[#ebe7e0] shadow-2xl rounded-md relative flex items-center justify-center transform transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-3xl overflow-hidden">
              
              <div className="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+')]" />
              
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-[#e8e4dc] to-[#ddd8cf] [clip-path:polygon(0%_0%,50%_100%,100%_0%)] transform-gpu transition-transform duration-300 origin-top group-hover:scale-y-[0.97]" />
              
              <div className="absolute top-[38%] z-20">
                <div className="absolute inset-0 bg-red-600/20 blur-xl scale-[2] group-hover:scale-[2.2] transition-transform duration-500" />
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-700 via-red-800 to-red-900 rounded-full shadow-lg flex items-center justify-center border-4 border-red-900/50 transform transition-all duration-300 group-hover:scale-110">
                  <span className="text-white/90 text-xs sm:text-sm font-serif font-bold">P</span>
                </div>
              </div>

              <div className="mt-16 sm:mt-20 text-center font-hand text-lg sm:text-xl md:text-2xl text-primary/70 rotate-[-1deg]">
                For {letter.recipientName}
              </div>
              
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
            
            <motion.p 
              className="mt-6 sm:mt-10 text-center text-muted-foreground text-xs sm:text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Tap to open
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ opacity: 0, y: 80, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 1,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1]
            }}
            className="w-full max-w-5xl relative"
          >
            <StudioCanvas 
              background={letter.content.background}
              content={letter.content}
              onUpdateElement={() => {}}
              isReadOnly={true}
              senderName={letter.senderName}
              showFooter={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
