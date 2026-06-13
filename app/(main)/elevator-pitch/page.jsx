"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Send, Lightbulb, Loader2, Target, FastForward, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generatePitch, getElevatorPitches } from "@/actions/elevator-pitch";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ElevatorPitchPage() {
  const [background, setBackground] = useState("");
  const [goals, setGoals] = useState("");
  const [audience, setAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentPitch, setCurrentPitch] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getElevatorPitches();
    if (res.success && res.data.length > 0) {
      setHistory(res.data);
      setCurrentPitch(res.data[0]);
    }
  };

  const handleGenerate = async () => {
    if (!background.trim() || !goals.trim() || !audience.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generatePitch(background, goals, audience);
      if (res.success) {
        toast.success("Pitches generated!");
        setBackground("");
        setGoals("");
        setAudience("");
        loadHistory();
      } else {
        toast.error(res.errors._form?.[0] || "Failed to generate pitch");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6">
      <div className="space-y-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500">
          <Mic className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Elevator Pitch Generator</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Own Your <span className="text-gradient-primary">Story.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stop stumbling over "Tell me about yourself." Connect your past experience to your future goals in a confident, seamless narrative arc tailored to your audience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">The Ingredients</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Your Background</label>
                <Textarea
                  placeholder="E.g., I spent 5 years in B2B sales but recently transitioned to UX design after a bootcamp..."
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                  className="min-h-[100px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Your Goal / The Ask</label>
                <Textarea
                  placeholder="E.g., Looking for a product design role at a fast-paced fintech startup..."
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Who are you talking to?</label>
                <Input
                  placeholder="E.g., A hiring manager, a startup founder, a networking event..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !background.trim() || !goals.trim() || !audience.trim()}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Crafting Story...
                  </>
                ) : (
                  <>
                    Generate Pitches
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Pitches</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPitch(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentPitch?.id === item.id 
                        ? "bg-orange-500/10 border border-orange-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Mic className={`h-4 w-4 shrink-0 ${currentPitch?.id === item.id ? "text-orange-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">Pitch for {item.audience}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {currentPitch ? (
              <motion.div
                key={currentPitch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* 15s Pitch */}
                <div className="p-6 glass rounded-3xl border border-orange-500/30 bg-orange-500/5 relative">
                  <div className="absolute top-6 right-6">
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg text-orange-500 hover:text-orange-600 hover:bg-orange-500/10" onClick={() => copyToClipboard(currentPitch.pitchData.pitch15s)}>
                      Copy
                    </Button>
                  </div>
                  <h3 className="text-sm font-bold text-orange-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <FastForward className="h-4 w-4" /> The 15-Second Hook
                  </h3>
                  <p className="text-lg text-foreground font-medium leading-relaxed pr-16">
                    "{currentPitch.pitchData.pitch15s}"
                  </p>
                </div>

                {/* 30s Pitch */}
                <div className="p-6 glass rounded-3xl border border-blue-500/30 bg-blue-500/5 relative">
                  <div className="absolute top-6 right-6">
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" onClick={() => copyToClipboard(currentPitch.pitchData.pitch30s)}>
                      Copy
                    </Button>
                  </div>
                  <h3 className="text-sm font-bold text-blue-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <PlayCircle className="h-4 w-4" /> The 30-Second Networking Pitch
                  </h3>
                  <p className="text-base text-foreground leading-relaxed pr-16">
                    "{currentPitch.pitchData.pitch30s}"
                  </p>
                </div>

                {/* 60s Pitch */}
                <div className="p-6 glass rounded-3xl border border-emerald-500/30 bg-emerald-500/5 relative">
                  <div className="absolute top-6 right-6">
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => copyToClipboard(currentPitch.pitchData.pitch60s)}>
                      Copy
                    </Button>
                  </div>
                  <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Mic className="h-4 w-4" /> The 60-Second Interview Intro
                  </h3>
                  <p className="text-base text-foreground leading-relaxed pr-16">
                    "{currentPitch.pitchData.pitch60s}"
                  </p>
                </div>

                {/* Tips */}
                <div className="p-6 glass rounded-3xl border border-border">
                  <h3 className="text-base font-bold flex items-center gap-2 mb-4 text-foreground">
                    <Target className="h-5 w-5 text-indigo-500" />
                    Delivery & Storytelling Tips
                  </h3>
                  <ul className="space-y-3">
                    {currentPitch.pitchData.storytellingTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-orange-500/30">
                <Mic className="h-12 w-12 text-orange-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No pitches generated.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Enter your background and goals to generate perfect 15, 30, and 60-second introductions.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
