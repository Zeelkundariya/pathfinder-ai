"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ShieldAlert, Sparkles, Star, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateFailureReframe, getFailureReframes } from "@/actions/failure-reframe";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FailureReframerPage() {
  const [situation, setSituation] = useState("");
  const [impact, setImpact] = useState("");
  const [feelings, setFeelings] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentReframe, setCurrentReframe] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getFailureReframes();
    if (res.success && res.data.length > 0) {
      setHistory(res.data);
      setCurrentReframe(res.data[0]);
    }
  };

  const handleGenerate = async () => {
    if (!situation.trim() || !impact.trim() || !feelings.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateFailureReframe(situation, impact, feelings);
      if (res.success) {
        toast.success("Reframe generated!");
        setSituation("");
        setImpact("");
        setFeelings("");
        loadHistory();
      } else {
        toast.error(res.errors._form?.[0] || "Failed to generate reframe");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6">
      <div className="space-y-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <ShieldAlert className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Resilience Coach</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Failure <span className="text-gradient-primary">Re-framer.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Turn your worst career setbacks into your strongest interview stories. We'll help you extract the core learning and build an empowering STAR narrative.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">The Setback</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">What happened?</label>
                <Textarea
                  placeholder="E.g., I missed a critical deadline that pushed our product launch back by a week..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="min-h-[100px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">What was the impact/fallout?</label>
                <Textarea
                  placeholder="E.g., The client was furious and my manager had to step in to do damage control..."
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">How did/do you feel about it?</label>
                <Textarea
                  placeholder="E.g., I felt incredibly embarrassed and thought I was going to be fired..."
                  value={feelings}
                  onChange={(e) => setFeelings(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !situation.trim() || !impact.trim() || !feelings.trim()}
                className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding the Lesson...
                  </>
                ) : (
                  <>
                    Reframe This Failure
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Reframes</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentReframe(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentReframe?.id === item.id 
                        ? "bg-rose-500/10 border border-rose-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldAlert className={`h-4 w-4 shrink-0 ${currentReframe?.id === item.id ? "text-rose-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">Setback Processed</p>
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
            {currentReframe ? (
              <motion.div
                key={currentReframe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Validation & Learning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 glass rounded-2xl border border-rose-500/20 bg-rose-500/5">
                    <h4 className="text-sm font-bold text-rose-500 mb-2 flex items-center gap-2 uppercase tracking-wide">
                      <ShieldAlert className="h-4 w-4" /> Validation
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {currentReframe.reframeData.validation}
                    </p>
                  </div>
                  <div className="p-5 glass rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                    <h4 className="text-sm font-bold text-emerald-500 mb-2 flex items-center gap-2 uppercase tracking-wide">
                      <TrendingUp className="h-4 w-4" /> Core Learning
                    </h4>
                    <p className="text-sm font-medium text-foreground leading-relaxed">
                      {currentReframe.reframeData.coreLearning}
                    </p>
                  </div>
                </div>

                {/* The STAR Story */}
                <div className="p-6 glass rounded-3xl border border-amber-500/30 bg-amber-500/5">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-amber-500 mb-6">
                    <Star className="h-5 w-5" />
                    Your Empowering STAR Story
                  </h3>
                  
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-amber-500/20 before:to-transparent">
                    {/* S */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-black text-amber-500">
                        S
                      </div>
                      <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-4 glass rounded-2xl border border-border bg-background/50">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Situation</h4>
                        <p className="text-sm text-foreground leading-relaxed">{currentReframe.reframeData.starStory.situation}</p>
                      </div>
                    </div>
                    {/* T */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-black text-amber-500">
                        T
                      </div>
                      <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-4 glass rounded-2xl border border-border bg-background/50">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Task</h4>
                        <p className="text-sm text-foreground leading-relaxed">{currentReframe.reframeData.starStory.task}</p>
                      </div>
                    </div>
                    {/* A */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-black text-amber-500">
                        A
                      </div>
                      <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-4 glass rounded-2xl border border-blue-500/20 bg-blue-500/5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Action (Ownership)</h4>
                        <p className="text-sm text-foreground leading-relaxed">{currentReframe.reframeData.starStory.action}</p>
                      </div>
                    </div>
                    {/* R */}
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-amber-500/30 bg-amber-500/10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-sm font-black text-amber-500">
                        R
                      </div>
                      <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-4 glass rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1">Result (Growth)</h4>
                        <p className="text-sm text-foreground leading-relaxed">{currentReframe.reframeData.starStory.result}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Tip */}
                <div className="p-5 glass rounded-2xl border border-violet-500/30 bg-violet-500/5 flex gap-4 items-start">
                  <div className="p-2 bg-violet-500/10 rounded-lg">
                    <Sparkles className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground mb-1">Delivery Tip</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{currentReframe.reframeData.interviewTip}</p>
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-rose-500/30">
                <ShieldAlert className="h-12 w-12 text-rose-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No failures reframed.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Everyone makes mistakes. Paste a recent setback on the left to extract the lesson and build your comeback story.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
