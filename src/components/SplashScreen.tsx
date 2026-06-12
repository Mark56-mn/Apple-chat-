import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  finishLoading: () => void;
}

export default function SplashScreen({ finishLoading }: SplashScreenProps) {
  const [isBiting, setIsBiting] = useState(false);

  useEffect(() => {
    // Trigger the bite animation after 600ms
    const biteTimer = setTimeout(() => {
      setIsBiting(true);
    }, 600);

    // Complete the splash screen after 2.5 seconds total
    const finishTimer = setTimeout(() => {
      finishLoading();
    }, 2500);

    return () => {
      clearTimeout(biteTimer);
      clearTimeout(finishTimer);
    };
  }, [finishLoading]);

  // Framer motion variants for the whole screen sliding up
  const screenVariants = {
    initial: { y: 0, opacity: 1 },
    exit: {
      y: "-100%",
      opacity: 0,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] }, // Smooth snap ease
    },
  };

  return (
    <>
      <style>{`
        @keyframes chomp {
          0% { clip-path: circle(100% at 50% 50%); }
          50% { clip-path: circle(80% at 20% 20%); }
          100% { clip-path: circle(70% at 80% 20%); }
        }
        .chomp-anim {
          animation: chomp 0.4s ease-in-out forwards;
        }
      `}</style>
      <motion.div
        variants={screenVariants}
        initial="initial"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-white"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative flex flex-col justify-center items-center w-64 h-64"
        >
          <img 
            src="/src/assets/images/rabbit_eating_apple_1781247707346.jpg" 
            alt="Rabbit eating apple" 
            className={`w-full h-full object-contain rounded-2xl shadow-xl border-4 border-gray-100 ${isBiting ? 'chomp-anim' : ''}`}
          />
        </motion.div>
      </motion.div>
    </>
  );
}
