import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const AIChat = ({ currentPrediction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Kutty Vivek. How can I help you with your crops today?" }
  ]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const [isTyping, setIsTyping] = useState(false);
  const [activeSuggestions, setActiveSuggestions] = useState([]);
  
  // Mouse interaction state
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = ({ currentTarget, clientX, clientY }) => {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };
  
  const backgroundGlow = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(250px circle at ${x}px ${y}px, var(--accent-glow), transparent 80%)`
  );

  const suggestionPool = {
    diagnosis: [
      "Fungicide recommendations?", "Can I eat the crop?", "Is it late to spray?",
      "Effect on grain quality?", "How to clean equipment?", "Neighboring field risk?",
      "Best time to spray?", "Will fertilizer help?", "Resistant varieties?", 
      "Early symptoms?", "Soil moisture role?", "Pesticide safety?",
      "How to treat this?", "What caused it?", "Yield impact?", "Organic fixes?",
      "Prevent recurrence?", "Harvest safety?", "Winter survival?", "Dew impact?"
    ],
    general: [
      "How to start?", "Which crops work?", "Weather impact?", "AgriVision features",
      "Upload tips?", "Best time to scan?", "About the AI", "System health?",
      "Supported diseases?", "Farmer community?", "Local agronomist?",
      "Offline mode help?", "PDF report guide?", "Mobile app install?"
    ]
  };

  useEffect(() => {
    refreshSuggestions();
  }, [currentPrediction]);

  const refreshSuggestions = () => {
    const pool = currentPrediction ? suggestionPool.diagnosis : suggestionPool.general;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setActiveSuggestions(shuffled.slice(0, 6)); // Increased to 6 for more variety
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    generateAIResponse(input);
    refreshSuggestions(); // Refresh for variety
  };

  const generateAIResponse = (queryText) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      const query = queryText.toLowerCase();

      const getVariation = (arr) => arr[Math.floor(Math.random() * arr.length)];

      // 1. GLOBAL KEYWORDS (Always work)
      if (query.includes('weather')) {
          response = getVariation([
              "I track temperature, humidity, and wind speed at your location to predict how likely a disease is to spread.",
              "By monitoring your local weather, I can warn you if conditions are perfect for fungal growth.",
              "My weather integration helps you decide the best day for spraying based on wind and rain forecasts."
          ]);
      } else if (query.includes('crop') || query.includes('support')) {
          response = getVariation([
              "Currently, I specialize in Wheat. I can detect Brown Rust, Yellow Rust, and Healthy leaves with high accuracy.",
              "My expertise is focused on Wheat diseases like Yellow and Brown Rust. More crops are coming soon!",
              "I am a specialist in Wheat pathology, specifically trained to identify Rust diseases."
          ]);
      } else if (query.includes('feature')) {
          response = getVariation([
              "Kutty Vivek offers AI diagnosis, real-time weather tracking, treatment plans, offline access, and expert chat support.",
              "You get a full suite: AI leaf analysis, localized weather, step-by-step treatment guides, and PDF reporting.",
              "Key features include instant disease detection, weather-based risk analysis, and expert guidance via this chat."
          ]);
      } else if (query.includes('start') || query.includes('use')) {
          response = getVariation([
              "To start, simply click the 'Upload' area or use the Camera button to take a photo of a wheat leaf. I'll do the rest!",
              "Just upload or take a clear photo of a wheat leaf, and my AI will analyze it for diseases instantly.",
              "Getting started is easy! Upload a leaf image, and I'll provide a diagnosis and treatment plan."
          ]);
      } 
      // 2. DIAGNOSIS-SPECIFIC KEYWORDS (Professional Agricultural Advice)
      else if (currentPrediction) {
        if (query.includes('treatment') || query.includes('fix') || query.includes('how') || query.includes('help')) {
          response = getVariation([
            `For ${currentPrediction}, the best approach is to follow the actionable treatment plan listed on your dashboard. Specifically, focus on moisture control and targeted fungicides.`,
            `I recommend checking the treatment checklist on your dashboard for ${currentPrediction}. Applying fungicides like Triazoles at the right time is crucial.`,
            `Managing ${currentPrediction} requires a mix of preventative steps and targeted spraying. Your dashboard contains the full recommended sequence.`
          ]);
        } else if (query.includes('spray') || query.includes('timing') || query.includes('time')) {
          response = getVariation([
            "The best time to spray is early morning (6-9 AM) when the wind is calm and temperatures are low. Avoid spraying if rain is expected within 4 hours.",
            "For maximum effectiveness against Rust, spray when the leaves are dry but before the midday sun becomes too hot. Calm winds are essential to prevent drift.",
            "Schedule your spray for late evening or early morning. This ensures the chemical stays on the leaf longer without evaporating too quickly."
          ]);
        } else if (query.includes('fertilizer') || query.includes('nitrogen')) {
          response = getVariation([
            "Be careful: Excessive nitrogen fertilizer can actually make Rust diseases worse by creating a dense, lush canopy that traps moisture.",
            `While nutrients help, avoid over-fertilizing during an outbreak of ${currentPrediction}. Focus on balanced Potassium (K) to improve leaf strength.`,
            "Balanced nutrition is key. High nitrogen promotes succulent growth which is more susceptible to fungal infection. Ensure adequate P and K levels."
          ]);
        } else if (query.includes('resistant') || query.includes('variety')) {
          response = getVariation([
            "For future plantings, look for wheat varieties with 'Sr' or 'Yr' resistance genes. These are specifically bred to fight off Rust infections.",
            `Switching to resistant cultivars is the most cost-effective way to manage ${currentPrediction} long-term. Check your local seed catalog for 'Resistant' ratings.`,
            "Many modern wheat hybrids are bred for resistance. Ask your seed supplier for varieties that perform well against Yellow and Brown Rust in your region."
          ]);
        } else if (query.includes('moisture') || query.includes('soil')) {
          response = getVariation([
            "High soil moisture isn't the problem, but high LEAF moisture is. Avoid overhead irrigation if possible to keep the canopy dry.",
            "Fungal spores thrive in 90%+ humidity. Ensure your planting density allows for good air flow to dry out the soil surface and lower leaves.",
            "Rust spreads when water sits on the leaves for more than 6-8 hours. Well-drained soil and wider row spacing can help reduce this risk."
          ]);
        } else if (query.includes('spread') || query.includes('contagious')) {
          response = getVariation([
            `Yes, ${currentPrediction} can spread quickly across your field via wind and moisture. I recommend isolating the affected area if possible.`,
            `${currentPrediction} is highly contagious among wheat plants. Spores can travel on the wind for miles to infect neighboring fields.`,
            `It spreads rapidly! If you see it on one leaf, it's likely already in the surrounding canopy. Early isolation is best.`
          ]);
        } else if (query.includes('cause')) {
          response = getVariation([
            `${currentPrediction} is usually caused by excessive humidity and specific fungal spores. Improving air circulation can help prevent it.`,
            `High moisture levels and warm temperatures often trigger ${currentPrediction}. It spreads when fungal spores land on wet leaves.`,
            `Environmental conditions like stagnant air and damp foliage are the primary drivers behind ${currentPrediction} outbreaks.`
          ]);
        } else if (query.includes('yield') || query.includes('loss')) {
          response = getVariation([
            `If left untreated, ${currentPrediction} can reduce your yield by 20% to 50% depending on severity. Early intervention is key to saving your harvest.`,
            `The economic impact of ${currentPrediction} is significant. You could lose up to half your crop if the infection reaches the flag leaf.`,
            `Unchecked infection can shrivel the grain, leading to severe yield losses. Acting now could save thousands in revenue.`
          ]);
        } else if (query.includes('late') || query.includes('timing')) {
          response = getVariation([
            "It's never too late to try and save the yield, but spraying after the 'milk stage' of the grain has limited benefits. Check the growth stage of your wheat.",
            "Earlier is always better. If the rust has already hit the flag leaf, you need to act immediately to prevent total yield collapse.",
            "Once the wheat starts turning yellow naturally for harvest, spraying is usually ineffective. Focus on protecting the green tissue earlier."
          ]);
        } else if (query.includes('quality') || query.includes('grain')) {
          response = getVariation([
            `${currentPrediction} causes shriveled grains and lower protein content. This can lead to a lower grade at the market.`,
            "The fungus steals nutrients meant for the grain. You might see a reduction in 'Test Weight' and overall milling quality.",
            "Expect smaller, lighter seeds. The grain will still be edible, but its commercial value will be significantly reduced."
          ]);
        } else if (query.includes('clean') || query.includes('equipment')) {
          response = getVariation([
            "Always wash your boots and tractor tires after leaving an infected field. Spores can travel easily on mud and machinery.",
            "Use a pressure washer to remove soil and debris from equipment. This prevents you from carrying ${currentPrediction} to your healthy fields.",
            "Decontamination is vital! Fungus spores are microscopic and stick to everything. A quick clean-down can save your other crops."
          ]);
        } else if (query.includes('neighbor') || query.includes('field')) {
          response = getVariation([
            `Yes, if your neighbor has ${currentPrediction}, your field is at high risk. Spores can travel miles on a single gust of wind.`,
            "Rust is a community problem. If it's in the area, you should start preventative spraying even if your leaves look clean.",
            "Talk to your neighbors! If they are seeing symptoms, it's only a matter of time before it reaches your wheat."
          ]);
        } else if (query.includes('winter') || query.includes('survival')) {
          response = getVariation([
            "In warmer climates, Rust can 'over-winter' on volunteer wheat. Removing these green bridges is essential before spring planting.",
            "The fungus needs living tissue to survive. A very hard frost that kills all green wheat tissue will usually stop the local spread until next year.",
            "Rust spores often blow in from warmer southern regions every spring. Your local winter might kill it, but new spores will arrive."
          ]);
        } else if (query.includes('dew') || query.includes('humidity')) {
          response = getVariation([
            "Morning dew is the perfect environment for Rust. If the leaves stay wet until noon, the infection risk skyrockets.",
            "Heavy dew provides the 'free water' that spores need to germinate. High humidity combined with dew is a red alert for farmers.",
            "Watch out for foggy mornings! Long periods of leaf wetness are exactly how ${currentPrediction} takes over a field."
          ]);
        } else if (query.includes('organic')) {
          response = getVariation([
            `For an organic approach to ${currentPrediction}, focus on crop rotation, using resistant wheat varieties, and applying neem-based sprays.`,
            `Organic control involves boosting soil health and using natural fungicides like sulfur or copper-based sprays where permitted.`,
            `Consider rotating with legumes next year and using high-density planting to naturally suppress the spread of ${currentPrediction} spores.`
          ]);
        } else if (query.includes('harvest') || query.includes('safe')) {
          response = getVariation([
            `Most treatments for ${currentPrediction} require a "pre-harvest interval" (PHI). Usually, you should stop all sprays at least 30 days before harvest.`,
            `Check the safety labels on your fungicides. There is typically a 3-4 week waiting period before the grain is safe for consumption after spraying.`,
            `Safety first! Ensure you follow the PHI guidelines on your chemicals to prevent any residues from remaining in your harvested wheat.`
          ]);
        } else {
          response = `Regarding your ${currentPrediction} diagnosis: I recommend monitoring the spread daily. Is there a specific part of the treatment plan you're unsure about?`;
        }
      } 
      // 3. FALLBACK / GREETINGS
      else if (/\bhi\b/i.test(query) || /\bhello\b/i.test(query) || /\bgreetings\b/i.test(query)) {
          response = getVariation([
              "Hello! I'm Kutty Vivek, ready to help. Please upload a photo of your wheat leaf for analysis.",
              "Hi there! I'm Kutty Vivek. Once you scan a leaf, I can give you expert advice on how to manage any diseases.",
              "Greetings! I am Kutty Vivek. How can I assist you with your farming today?"
          ]);
      } else {
          response = getVariation([
              "I'm ready to help! Once you upload a photo of your wheat, I can give you expert advice specific to the diagnosis.",
              "Please scan a wheat leaf first so I can give you more accurate and specific advice.",
              "I work best when I have a diagnosis to look at. Upload a leaf photo to get started!"
          ]);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="notranslate">
      {/* Floating Button */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          zIndex: 1000,
        }}
      >
        {/* Pulsing ring */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.4)',
          }}
        />
        <motion.button
          className="ai-chat-fab"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'relative',
            width: '60px',
            height: '60px',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, #34d399, #10b981)',
            color: 'white',
            border: 'none',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="ai-chat-window"
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '30px',
              width: '350px',
              height: '520px',
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              background: backgroundGlow
            }}
            onMouseMove={handleMouseMove}
          >
            {/* Dynamic Glow Layer */}
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                background: backgroundGlow,
                pointerEvents: 'none',
                zIndex: 0
              }}
            />
            {/* Header - Forced Update 01 */}
            <div style={{ padding: '20px', background: 'rgba(52, 211, 153, 0.1)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: '#34d399', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Bot size={24} />
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'white' }}>Kutty Vivek</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#34d399' }}>
                  <div style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%' }} /> Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.map((msg, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02, x: msg.role === 'user' ? -5 : 5 }}
                  style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', cursor: 'default' }}
                >
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                  }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '5px 16px' }}>
                  <div style={{ display: 'flex', gap: '5px', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px' }}>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%' }} />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%' }} />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} style={{ width: '6px', height: '6px', background: '#34d399', borderRadius: '50%' }} />
                  </div>
                </div>
              )}
            </div>
 
            {/* Suggestions */}
            <div style={{ padding: '0 20px 10px 20px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {activeSuggestions.map((text, idx) => (
                <motion.button 
                  key={idx}
                  whileHover={{ 
                    scale: 1.1, 
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    borderColor: "rgba(16, 185, 129, 0.4)",
                    boxShadow: "0 5px 15px rgba(16, 185, 129, 0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const userMsg = { role: 'user', content: text };
                    setMessages(prev => [...prev, userMsg]);
                    generateAIResponse(text);
                    refreshSuggestions();
                  }}
                  style={{
                    whiteSpace: 'nowrap',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    borderRadius: '15px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  {text}
                </motion.button>
              ))}
            </div>

            {/* Input */}
            <div style={{ padding: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask something..."
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '10px 15px',
                  color: 'white',
                  outline: 'none',
                  fontSize: '14px'
                }}
              />
              <button 
                onClick={handleSend}
                style={{ width: '40px', height: '40px', background: '#34d399', border: 'none', borderRadius: '10px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChat;
