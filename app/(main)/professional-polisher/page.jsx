"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, Feather, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generatePolishedText, getPolishedTexts } from "@/actions/polisher";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ProfessionalPolisherPage() {
  const [rawDraft, setRawDraft] = useState("");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentPolished, setCurrentPolished] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getPolishedTexts();
    if (res.success && res.data.length > 0) {
      setHistory(res.data);
      setCurrentPolished(res.data[0]);
    }
  };

  const handleGenerate = async () => {
    if (!rawDraft.trim() || !context.trim() || !audience.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generatePolishedText(rawDraft, context, audience);
      if (res.success) {
        toast.success("Draft polished!");
        setRawDraft("");
        setContext("");
        setAudience("");
        loadHistory();
      } else {
        toast.error(res.errors._form?.[0] || "Failed to polish draft");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (currentPolished) {
      navigator.clipboard.writeText(currentPolished.polishedData.polishedDraft);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6">
      <div className="space-y-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
          <Feather className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Diplomacy Filter</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Professional <span className="text-gradient-primary">Polisher.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Don't hit send while angry. Paste your raw, emotional draft here and let the AI rewrite it to be diplomatic, firm, and perfectly professional.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">The Raw Input</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">The Audience</label>
                <Input
                  placeholder="E.g., My micromanaging boss, A difficult client..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">The Context</label>
                <Input
                  placeholder="E.g., They asked me to work this weekend again."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-red-500 ml-1">The Raw Draft (Don't hold back)</label>
                <Textarea
                  placeholder="E.g., I'm absolutely not doing this. You guys always drop this on me at 5pm on a Friday and it's completely unfair..."
                  value={rawDraft}
                  onChange={(e) => setRawDraft(e.target.value)}
                  className="min-h-[150px] resize-none bg-red-500/5 border-red-500/20 rounded-2xl focus:border-red-500"
                />
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !rawDraft.trim() || !context.trim() || !audience.trim()}
                className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Applying Diplomacy Filter...
                  </>
                ) : (
                  <>
                    Polish This Draft
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Drafts</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPolished(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentPolished?.id === item.id 
                        ? "bg-blue-500/10 border border-blue-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Feather className={`h-4 w-4 shrink-0 ${currentPolished?.id === item.id ? "text-blue-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">To: {item.audience}</p>
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
            {currentPolished ? (
              <motion.div
                key={currentPolished.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Tone Shift */}
                <div className="p-6 glass rounded-3xl border border-emerald-500/30 bg-emerald-500/5">
                  <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4" /> The Translation
                  </h3>
                  <p className="text-lg text-foreground font-medium leading-relaxed">
                    {currentPolished.polishedData.toneShift}
                  </p>
                </div>

                {/* The Polished Draft */}
                <div className="p-6 glass rounded-3xl border border-blue-500/30 bg-blue-500/5 relative group">
                  <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="icon" onClick={handleCopy} className="hover:bg-blue-500/20 text-blue-500">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-lg font-bold flex items-center gap-2 text-blue-500 mb-4">
                    <Feather className="h-5 w-5" />
                    Ready to Send
                  </h3>
                  <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {currentPolished.polishedData.polishedDraft}
                    </p>
                  </div>
                </div>

                {/* Key Changes Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    What We Changed & Why
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {currentPolished.polishedData.keyChanges.map((change, idx) => (
                      <div key={idx} className="p-5 glass rounded-2xl border border-border flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] font-bold uppercase text-red-500">Original (Too Raw)</p>
                          <p className="text-sm text-muted-foreground line-through decoration-red-500/50">"{change.original}"</p>
                        </div>
                        <div className="flex-1 space-y-2">
                          <p className="text-[10px] font-bold uppercase text-emerald-500">Fixed (Diplomatic)</p>
                          <p className="text-sm font-medium text-foreground">"{change.fixed}"</p>
                        </div>
                        <div className="flex-1 space-y-2 bg-muted/50 p-3 rounded-xl">
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">Reasoning</p>
                          <p className="text-xs text-muted-foreground">{change.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-blue-500/30">
                <Feather className="h-12 w-12 text-blue-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No polished drafts yet.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Paste your emotional draft on the left to see the magic of the diplomacy filter.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
