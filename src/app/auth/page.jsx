"use client"
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Gift, Heart, Star, PartyPopper, Sparkles, Cake, 
  Music, Camera, Smile, ArrowDown, Map, Coffee, 
  Book, ChevronRight, Unlock, Play, Cat, Gamepad2, 
  HelpCircle, Trophy, CheckCircle2, XCircle
} from 'lucide-react';
//test
// --- CUSTOM CSS ANIMATIONS ---
const CustomStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(3deg); }
    }
    @keyframes floatFast {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(-3deg); }
    }
    @keyframes fall {
      0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
      100% { transform: translateY(110vh) rotate(360deg) scale(0.5); opacity: 0; }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      25% { transform: translateX(-8px) rotate(-8deg); }
      75% { transform: translateX(8px) rotate(8deg); }
    }
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); transform: scale(1); }
      50% { box-shadow: 0 0 40px rgba(56, 189, 248, 0.9); transform: scale(1.02); }
    }
    @keyframes popIn {
      0% { transform: scale(0.5); opacity: 0; }
      70% { transform: scale(1.1); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    @keyframes catWalkX {
      0% { left: -10vw; transform: scaleX(1); }
      48% { left: 110vw; transform: scaleX(1); }
      50% { left: 110vw; transform: scaleX(-1); }
      98% { left: -10vw; transform: scaleX(-1); }
      100% { left: -10vw; transform: scaleX(1); }
    }
    @keyframes catBobY {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-fast { animation: floatFast 4s ease-in-out infinite; }
    .animate-shake { animation: shake 0.6s ease-in-out infinite; }
    .animate-glow { animation: pulse-glow 2.5s infinite; }
    .animate-pop { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
    
    .cat-roamer {
      position: fixed;
      bottom: 20px;
      z-index: 45;
      animation: catWalkX 25s linear infinite;
      pointer-events: none;
    }
    .cat-body {
      animation: catBobY 0.4s ease-in-out infinite;
      filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5));
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
    }
    
    .text-gradient {
      background: linear-gradient(to right, #93c5fd, #c4b5fd, #67e8f9);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    /* Custom Scrollbar */
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #60a5fa; }
  `}} />
);

// --- COMPONENT: SCROLL REVEAL WRAPPER ---
const ScrollReveal = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref} 
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-24 scale-95'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- COMPONENT: SMOOTH PARALLAX REAL GRAPHICS ---
const SmoothParallaxDecorations = () => {
  const itemRefs = useRef([]);
  const targetScrollY = useRef(0);
  const currentScrollY = useRef(0);

  // High-quality photographic imagery for a premium look
  const items = useMemo(() => [
    { img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', x: 5, speed: 0.6, offset: 100, size: 140, rotationSpeed: 0.05, zIndex: 1 }, // Cake
    { img: 'https://images.unsplash.com/photo-1551024506-0bc97340c5c2?auto=format&fit=crop&w=400&q=80', x: 80, speed: 1.1, offset: 300, size: 160, rotationSpeed: -0.08, zIndex: 10 }, // Donuts
    { img: 'https://images.unsplash.com/photo-1490750967868-88cb44cb2753?auto=format&fit=crop&w=400&q=80', x: 12, speed: 0.8, offset: 700, size: 120, rotationSpeed: 0.1, zIndex: 2 }, // Flowers
    { img: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=400&q=80', x: 75, speed: 1.4, offset: 1000, size: 180, rotationSpeed: -0.06, zIndex: 11 }, // Macarons
    { img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', x: 8, speed: 0.5, offset: 1400, size: 200, rotationSpeed: 0.03, zIndex: 0 }, // Pizza
    { img: 'https://images.unsplash.com/photo-1528207776546-384cb1119b27?auto=format&fit=crop&w=400&q=80', x: 85, speed: 0.9, offset: 1800, size: 130, rotationSpeed: -0.09, zIndex: 3 }, // Pancakes
    { img: 'https://images.unsplash.com/photo-1530103862676-de889221dd71?auto=format&fit=crop&w=400&q=80', x: 15, speed: 1.6, offset: 2200, size: 170, rotationSpeed: 0.07, zIndex: 12 }, // Balloons
    { img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80', x: 78, speed: 0.7, offset: 2600, size: 150, rotationSpeed: -0.04, zIndex: 4 }, // Gift
    { img: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=400&q=80', x: 10, speed: 1.3, offset: 3000, size: 140, rotationSpeed: 0.06, zIndex: 13 }, // Cupcake
    { img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80', x: 82, speed: 1.0, offset: 3400, size: 190, rotationSpeed: -0.05, zIndex: 5 }, // Roses
    { img: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=400&q=80', x: 20, speed: 1.5, offset: 3800, size: 160, rotationSpeed: 0.08, zIndex: 14 }, // Gummy candies
    { img: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=400&q=80', x: 70, speed: 0.6, offset: 4200, size: 140, rotationSpeed: -0.03, zIndex: 6 }, // Snacks
  ], []);

  useEffect(() => {
    const handleScroll = () => { targetScrollY.current = window.scrollY; };
    window.addEventListener('scroll', handleScroll, { passive: true });

    let rafId;
    const animate = () => {
      // Lerp for buttery smooth physics momentum
      currentScrollY.current += (targetScrollY.current - currentScrollY.current) * 0.08;
      
      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const item = items[index];
        const yPos = window.innerHeight + item.offset - (currentScrollY.current * item.speed);
        const rotation = currentScrollY.current * item.rotationSpeed;
        
        // Use translate3d to enforce hardware GPU acceleration
        el.style.transform = `translate3d(0, ${yPos}px, 0) rotate(${rotation}deg)`;
        el.style.opacity = Math.min(1, Math.max(0, 1 - (yPos / (window.innerHeight * 1.5))));
      });
      
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [items]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map((item, i) => (
        <div
          key={i}
          ref={el => itemRefs.current[i] = el}
          className="absolute drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] will-change-transform"
          style={{
            width: item.size,
            height: item.size,
            left: `${item.x}%`,
            top: 0,
            zIndex: item.zIndex,
            // Add a depth-of-field blur effect for items in the "background" (lower z-index)
            filter: item.zIndex < 5 ? 'blur(5px)' : 'none',
          }}
        >
          <img 
             src={item.img} 
             alt="Floating visual graphic" 
             className="w-full h-full object-cover rounded-[2.5rem] border-[3px] border-white/40 shadow-[inset_0_0_30px_rgba(255,255,255,0.6)]"
          />
        </div>
      ))}
    </div>
  );
};

// --- COMPONENT: CONFETTI ---
const Confetti = () => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#c4b5fd', '#e0e7ff', '#ffffff'];
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${3 + Math.random() * 4}s`,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: `${0.5 + Math.random() * 1}rem`,
      shape: Math.random() > 0.5 ? 'circle' : 'square'
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute top-[-5%]"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animation: `fall ${p.animationDuration} linear ${p.animationDelay} infinite`,
          }}
        />
      ))}
    </div>
  );
};

// --- COMPONENT: BALLOONS ---
const Balloons = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
      {[...Array(6)].map((_, i) => (
        <div 
          key={i} 
          className="absolute bottom-[-20%] animate-float"
          style={{
            left: `${10 + (i * 15)}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${8 + (i % 3) * 2}s`
          }}
        >
          <div className="w-16 h-20 rounded-[50%] bg-gradient-to-tr from-blue-600 to-cyan-400 opacity-60 blur-[2px] shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
          <div className="w-1 h-24 bg-white/20 mx-auto mt-[-5px]"></div>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENT: ROAMING CAT ---
const RoamingCat = () => {
  return (
    <div className="cat-roamer">
      <div className="cat-body relative flex flex-col items-center">
        <div className="absolute -top-8 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-cyan-200 opacity-0 transition-opacity duration-300 hover:opacity-100">
          Meow! Happy B-Day!
        </div>
        <Cat className="w-12 h-12 text-cyan-300 drop-shadow-2xl" strokeWidth={1.5} />
      </div>
    </div>
  );
};

// --- COMPONENT: CANDLE GAME ---
const CandleGame = () => {
  const [candles, setCandles] = useState([true, true, true, true, true]);
  const [allOut, setAllOut] = useState(false);

  const toggleCandle = (index) => {
    const newCandles = [...candles];
    newCandles[index] = false;
    setCandles(newCandles);
    
    if (newCandles.every(c => !c)) {
      setTimeout(() => setAllOut(true), 500);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-8 max-w-2xl mx-auto my-16 text-center relative overflow-hidden z-10">
      <h3 className="text-3xl font-bold text-white mb-2">Make a Wish!</h3>
      <p className="text-blue-200 mb-8">Tap all the candles to blow them out.</p>
      
      <div className="flex justify-center items-end space-x-4 md:space-x-8 h-32 mb-8">
        {candles.map((isLit, i) => (
          <div key={i} className="flex flex-col items-center cursor-pointer" onClick={() => toggleCandle(i)}>
            <div className={`transition-all duration-500 origin-bottom ${isLit ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
              {/* Flame */}
              <div className="w-6 h-8 bg-gradient-to-t from-orange-400 to-yellow-200 rounded-[50%_50%_20%_20%] animate-pulse blur-[1px]"></div>
              {/* Glow */}
              <div className="absolute top-0 w-8 h-8 bg-yellow-400 rounded-full mix-blend-screen opacity-50 blur-md animate-glow"></div>
            </div>
            {/* Wick */}
            <div className="w-1 h-3 bg-gray-800 mt-1"></div>
            {/* Body */}
            <div className="w-8 h-20 bg-gradient-to-r from-blue-200 via-white to-blue-200 rounded-t-sm shadow-inner relative overflow-hidden">
               {/* Stripes */}
               <div className="absolute inset-0 opacity-20" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #3b82f6 10px, #3b82f6 20px)' }}></div>
            </div>
          </div>
        ))}
      </div>

      {allOut && (
        <div className="animate-pop bg-blue-500/20 border border-blue-400/50 rounded-xl p-6 mt-6">
          <Sparkles className="w-8 h-8 text-cyan-300 mx-auto mb-2" />
          <h4 className="text-xl font-bold text-cyan-100">Wish Granted!</h4>
          <p className="text-blue-100 mt-2 text-sm">May all your dreams come true this year.</p>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: MEMORY GAME ---
const MemoryGame = () => {
  const iconProps = { className: "w-10 h-10 text-white" };
  const initialCards = [
    { type: 'cat', icon: <Cat {...iconProps} /> },
    { type: 'gift', icon: <Gift {...iconProps} /> },
    { type: 'cake', icon: <Cake {...iconProps} /> },
    { type: 'star', icon: <Star {...iconProps} /> },
    { type: 'heart', icon: <Heart {...iconProps} /> },
    { type: 'party', icon: <PartyPopper {...iconProps} /> },
  ];

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...initialCards, ...initialCards]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({ ...card, id: index }));
    setCards(shuffled);
    setFlipped([]);
    setSolved([]);
    setMoves(0);
  };

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || solved.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const match = cards[newFlipped[0]].type === cards[newFlipped[1]].type;
      
      if (match) {
        setSolved([...solved, ...newFlipped]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-8 max-w-3xl mx-auto my-16 relative overflow-hidden z-10">
      <div className="text-center mb-8">
        <Gamepad2 className="w-10 h-10 text-cyan-400 mx-auto mb-4 animate-float-fast" />
        <h3 className="text-3xl font-bold text-white mb-2">Birthday Memory Match</h3>
        <p className="text-blue-200">Find all the matching pairs! Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || solved.includes(index);
          return (
            <div 
              key={card.id} 
              onClick={() => handleCardClick(index)}
              className="relative h-24 sm:h-32 cursor-pointer perspective-1000 group"
            >
              <div className={`absolute inset-0 transition-transform duration-500 w-full h-full preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front (Hidden state) */}
                <div className="absolute inset-0 bg-blue-900/50 border border-blue-400/30 rounded-xl flex items-center justify-center backface-hidden group-hover:bg-blue-800/60 transition-colors" style={{ backfaceVisibility: 'hidden' }}>
                  <HelpCircle className="w-8 h-8 text-blue-400/50" />
                </div>
                {/* Back (Revealed state) */}
                <div className={`absolute inset-0 rounded-xl flex items-center justify-center shadow-lg [transform:rotateY(180deg)] transition-all ${solved.includes(index) ? 'bg-emerald-500/80' : 'bg-cyan-500/80'}`} style={{ backfaceVisibility: 'hidden' }}>
                  {card.icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {solved.length === cards.length && cards.length > 0 && (
        <div className="text-center animate-pop">
          <button onClick={resetGame} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-400 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            Play Again!
          </button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: BIRTHDAY QUIZ ---
const BirthdayQuiz = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const questions = [
    { q: "What is obviously your favorite animal?", options: ["Dog", "Cat", "Dolphin", "Dragon"], answer: 1 },
    { q: "What's the best way to spend a birthday?", options: ["Sleeping all day", "Eating infinite cake", "Partying hard", "All of the above"], answer: 3 },
    { q: "How awesome are you on a scale of 1 to 10?", options: ["5", "8", "10", "11 (Off the charts)"], answer: 3 }
  ];

  const handleAnswer = (index) => {
    setSelectedAnswer(index);
    if (index === questions[currentQ].answer) {
      setScore(s => s + 1);
    }
    
    setTimeout(() => {
      setSelectedAnswer(null);
      if (currentQ < questions.length - 1) {
        setCurrentQ(c => c + 1);
      } else {
        setShowResult(true);
      }
    }, 1200);
  };

  return (
    <div className="glass-panel rounded-3xl p-8 max-w-2xl mx-auto my-16 text-center relative overflow-hidden z-10">
      <div className="mb-8">
        <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-4 animate-glow" />
        <h3 className="text-3xl font-bold text-white mb-2">The Ultimate You Quiz</h3>
      </div>

      {!showResult ? (
        <div className="animate-pop" key={currentQ}>
          <p className="text-sm text-cyan-400 font-bold mb-4">Question {currentQ + 1} of {questions.length}</p>
          <h4 className="text-xl md:text-2xl text-blue-100 mb-8">{questions[currentQ].q}</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[currentQ].options.map((opt, i) => {
              let btnClass = "bg-blue-900/40 border border-blue-500/30 hover:bg-blue-800/60";
              if (selectedAnswer !== null) {
                if (i === questions[currentQ].answer) btnClass = "bg-emerald-600/80 border-emerald-400"; // Correct
                else if (i === selectedAnswer) btnClass = "bg-red-600/80 border-red-400"; // Wrong
                else btnClass = "bg-blue-900/20 opacity-50"; // Others
              }

              return (
                <button 
                  key={i}
                  disabled={selectedAnswer !== null}
                  onClick={() => handleAnswer(i)}
                  className={`p-4 rounded-xl text-white transition-all duration-300 flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {selectedAnswer !== null && i === questions[currentQ].answer && <CheckCircle2 className="w-5 h-5 text-emerald-300" />}
                  {selectedAnswer === i && i !== questions[currentQ].answer && <XCircle className="w-5 h-5 text-red-300" />}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="animate-pop bg-blue-500/10 rounded-2xl p-8">
          <h4 className="text-4xl font-bold text-white mb-4">You scored {score}/{questions.length}!</h4>
          <p className="text-blue-200 text-lg mb-6">
            {score === questions.length ? "Flawless! You know yourself perfectly." : "Great job! Though you're still way cooler than a quiz can measure."}
          </p>
          <button onClick={() => { setCurrentQ(0); setScore(0); setShowResult(false); }} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-colors">
            Retake Quiz
          </button>
        </div>
      )}
    </div>
  );
};

// --- COMPONENT: INTERACTIVE GIFTS ---
const MysteryGifts = () => {
  const [openedGifts, setOpenedGifts] = useState({});

  const gifts = [
    { id: 1, icon: <Coffee />, title: "Digital Coffee", desc: "A voucher for a coffee date on me!", color: "from-amber-700 to-amber-500" },
    { id: 2, icon: <Music />, title: "Custom Playlist", desc: "10 songs that remind me of your awesomeness.", color: "from-purple-600 to-pink-500" },
    { id: 3, icon: <Map />, title: "Adventure Pass", desc: "Good for one impromptu road trip.", color: "from-emerald-600 to-teal-400" },
    { id: 4, icon: <Star />, title: "Named Star", desc: "Okay, unofficial, but I named a star after you.", color: "from-indigo-600 to-blue-400" },
  ];

  const openGift = (id) => setOpenedGifts(prev => ({ ...prev, [id]: true }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto my-16 z-10 relative">
      {gifts.map((gift) => (
        <div 
          key={gift.id}
          onClick={() => !openedGifts[gift.id] && openGift(gift.id)}
          className={`relative group cursor-pointer transition-all duration-500 perspective-1000 ${
            openedGifts[gift.id] ? 'h-48' : 'h-48 hover:-translate-y-2'
          }`}
        >
          {/* Unopened State */}
          <div className={`absolute inset-0 glass-panel rounded-2xl flex flex-col items-center justify-center transition-all duration-700 backface-hidden ${openedGifts[gift.id] ? 'opacity-0 scale-95 pointer-events-none rotate-y-180' : 'opacity-100 scale-100 z-10'}`}>
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 group-hover:animate-shake">
              <Gift className="w-8 h-8 text-blue-300" />
            </div>
            <h3 className="text-blue-100 font-medium">Tap to Open Gift #{gift.id}</h3>
          </div>

          {/* Opened State */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gift.color} p-[1px] transition-all duration-700 ${openedGifts[gift.id] ? 'opacity-100 scale-100 z-20' : 'opacity-0 scale-95 pointer-events-none -rotate-y-180'}`}>
            <div className="w-full h-full bg-slate-900/90 rounded-2xl backdrop-blur-xl p-6 flex flex-col items-center justify-center text-center">
              <div className="p-3 bg-white/10 rounded-full mb-3 text-white">
                {gift.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{gift.title}</h3>
              <p className="text-blue-200 text-sm">{gift.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- COMPONENT: MEMORY CARDS ---
const Memories = () => {
  const memories = [
    { title: "Your Smile", desc: "It literally lights up any room you walk into." },
    { title: "Your Kindness", desc: "The way you treat people is inspiring." },
    { title: "Your Humor", desc: "Nobody makes me laugh quite like you do." },
    { title: "Your Passion", desc: "Watching you talk about what you love is amazing." },
    { title: "Your Style", desc: "Effortlessly cool, every single day." },
    { title: "Your Heart", desc: "The biggest, warmest heart I know." },
  ];

  return (
    <div className="max-w-6xl mx-auto my-24 z-10 relative">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-500 mb-4">
          6 Reasons You're Amazing
        </h2>
        <p className="text-blue-200">Hover or tap to flip the cards</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4">
        {memories.map((mem, i) => (
          <div 
            key={i} 
            className="group relative h-64 w-full cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <div className="absolute inset-0 transition-transform duration-700 w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              {/* Front */}
              <div 
                className="absolute inset-0 glass-panel rounded-2xl flex flex-col items-center justify-center p-6 backface-hidden group-hover:[transform:rotateY(180deg)] transition-all duration-700"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-5xl font-black text-blue-500/20 absolute -top-2 -left-2">{i+1}</div>
                <Heart className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-xl font-bold text-blue-100">{mem.title}</h3>
              </div>
              
              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center p-6 text-center shadow-xl [transform:rotateY(180deg)] group-hover:[transform:rotateY(0deg)] transition-all duration-700"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <p className="text-white font-medium text-lg leading-relaxed">"{mem.desc}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN APPLICATION ---
export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // Transition effect handling
  useEffect(() => {
    if (isOpened) {
      setTimeout(() => setShowContent(true), 800);
    }
  }, [isOpened]);

  // --- SCREEN 1: THE LANDING (Unopened Gift) ---
  if (!isOpened) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
        <CustomStyles />
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>

        <div className="z-10 text-center animate-pop">
          <h1 className="text-3xl md:text-5xl font-bold text-blue-100 mb-8 tracking-wide">
            A Special Delivery...
          </h1>
          
          <button 
            onClick={() => setIsOpened(true)}
            className="group relative bg-transparent border-0 outline-none cursor-pointer"
          >
            <div className="absolute inset-0 bg-blue-500/30 rounded-3xl blur-xl group-hover:bg-blue-400/50 transition-all duration-500 animate-glow"></div>
            
            <div className="relative glass-panel p-12 rounded-3xl group-hover:scale-105 transition-transform duration-300">
              <Gift className="w-32 h-32 text-cyan-400 group-hover:animate-shake" />
              <div className="absolute -right-4 -top-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg transform rotate-12">
                For You!
              </div>
            </div>
          </button>
          
          <p className="mt-8 text-blue-300/60 animate-pulse text-sm uppercase tracking-widest flex items-center justify-center gap-2">
            Tap to Open <Unlock className="w-4 h-4" />
          </p>
        </div>
      </div>
    );
  }

  // --- SCREEN 2: THE CELEBRATION (Main Website) ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans relative overflow-x-hidden selection:bg-cyan-500/30 pb-16">
      <CustomStyles />
      <Confetti />
      <Balloons />
      
      {/* Scroll-based Parallax Embellishments with Real Graphics */}
      {showContent && <SmoothParallaxDecorations />}
      
      {/* Roaming Cat Component */}
      {showContent && <RoamingCat />}

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-[#020617] to-[#020617]"></div>
        <div className="absolute bottom-0 left-1/4 w-[800px] h-[800px] bg-cyan-900/20 rounded-full blur-[120px]"></div>
      </div>

      <div className={`relative z-10 transition-all duration-1000 transform ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        {/* Navigation / Header */}
        <nav className="glass-panel sticky top-4 mx-4 md:mx-auto max-w-5xl rounded-full px-6 py-4 flex justify-between items-center z-50 mb-16 shadow-2xl">
          <div className="flex items-center gap-2">
            <Cake className="w-6 h-6 text-cyan-400" />
            <span className="font-bold text-xl tracking-tight text-white">Birthday<span className="text-cyan-400">Bash</span></span>
          </div>
          <div className="hidden md:flex gap-6 text-sm font-medium text-blue-200">
            <span className="hover:text-white cursor-pointer transition-colors">Wishes</span>
            <span className="hover:text-white cursor-pointer transition-colors">Games</span>
            <span className="hover:text-white cursor-pointer transition-colors">Gifts</span>
          </div>
          <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-2">
            <Play className="w-4 h-4" /> Play Music
          </button>
        </nav>

        {/* Hero Section */}
        <header className="px-4 py-16 md:py-24 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          <ScrollReveal delay={100}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-cyan-300 text-sm font-semibold mb-8 animate-float-fast">
              <PartyPopper className="w-4 h-4" />
              <span>IT'S YOUR SPECIAL DAY!</span>
              <PartyPopper className="w-4 h-4" />
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 mb-6 drop-shadow-lg">
              Happy Birthday!
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={500}>
            <p className="text-xl md:text-2xl text-blue-200/80 max-w-2xl leading-relaxed mb-12 mx-auto">
              Another year older, another year wiser, and another year of making the world a brighter place just by being in it.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={700}>
            <div className="animate-bounce text-blue-400/50 mt-4 flex flex-col items-center gap-2">
              <span className="text-sm tracking-widest uppercase">Scroll Down</span>
              <ArrowDown className="w-8 h-8" />
            </div>
          </ScrollReveal>
        </header>

        {/* Interactive Sections Wrapped in ScrollReveals */}
        <main className="px-4 pb-24 space-y-32">
          
          {/* Section: Candle Mini Game */}
          <section>
            <ScrollReveal>
              <CandleGame />
            </ScrollReveal>
          </section>

          {/* Section: Birthday Quiz */}
          <section>
            <ScrollReveal>
              <BirthdayQuiz />
            </ScrollReveal>
          </section>

          {/* Section: Memory Game */}
          <section>
            <ScrollReveal>
              <MemoryGame />
            </ScrollReveal>
          </section>

          {/* Section: Memories / Reasons */}
          <section>
            <ScrollReveal>
              <Memories />
            </ScrollReveal>
          </section>

          {/* Section: Mystery Gifts */}
          <section className="text-center">
            <ScrollReveal>
              <div className="max-w-2xl mx-auto mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">Your Digital Gifts</h2>
                <p className="text-blue-200 text-lg">Because physical gifts are so last year. Tap the boxes to reveal what's inside.</p>
              </div>
              <MysteryGifts />
            </ScrollReveal>
          </section>

        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-slate-900/50 backdrop-blur-lg py-12 text-center relative overflow-hidden z-20">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
          
          <ScrollReveal>
            <Smile className="w-12 h-12 text-cyan-400 mx-auto mb-6 animate-float" />
            <h3 className="text-2xl font-bold text-white mb-2">Have the best day ever!</h3>
            <p className="text-blue-300/60 mb-8">Made with <Heart className="w-4 h-4 inline text-pink-500 mx-1" fill="currentColor" /> and a lot of code.</p>
            
            <div className="text-sm text-slate-500">
              Keep an eye out for the wandering cat! 🐈
            </div>
          </ScrollReveal>
        </footer>

      </div>
    </div>
  );
}