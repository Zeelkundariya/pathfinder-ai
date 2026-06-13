"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, Send, Scale, Loader2, Target, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateDecisionMatrix, getDecisionMatrices } from "@/actions/decision-matrix";
import { toast } from "sonner";
import { format } from "date-fns";

export default function DecisionMatrixPage() {
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [values, setValues] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentMatrix, setCurrentMatrix] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getDecisionMatrices();
    if (res.success && res.data.length > 0) {
      setHistory(res.data);
      setCurrentMatrix(res.data[0]);
    }
  };

  const handleGenerate = async () => {
    if (!optionA.trim() || !optionB.trim() || !values.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateDecisionMatrix(optionA, optionB, values);
      if (res.success) {
        toast.success("Matrix calculated!");
        setOptionA("");
        setOptionB("");
        setValues("");
        loadHistory();
      } else {
        toast.error(res.errors._form?.[0] || "Failed to generate matrix");
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
          <Scale className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Offer Decision Matrix</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Choose <span className="text-gradient-primary">Wisely.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Stuck between two job offers or career paths? We'll score them objectively against your core values to cut through the noise and reveal the best path.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">The Crossroads</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-blue-500 ml-1 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Option A
                </label>
                <Textarea
                  placeholder="E.g., Senior Dev at a stable bank. $150k salary, fully remote, but slow tech stack..."
                  value={optionA}
                  onChange={(e) => setOptionA(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 border-blue-500/20 rounded-2xl focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-emerald-500 ml-1 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Option B
                </label>
                <Textarea
                  placeholder="E.g., Lead Dev at an AI startup. $120k + equity, hybrid, fast-paced and high growth..."
                  value={optionB}
                  onChange={(e) => setOptionB(e.target.value)}
                  className="min-h-[80px] resize-none bg-background/50 border-emerald-500/20 rounded-2xl focus:border-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Scale className="h-3 w-3" /> Your Core Values / Non-negotiables
                </label>
                <Textarea
                  placeholder="E.g., Work-life balance is my #1 priority. Second is learning new tech. Base salary is more important than equity..."
                  value={values}
                  onChange={(e) => setValues(e.target.value)}
                  className="min-h-[100px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !optionA.trim() || !optionB.trim() || !values.trim()}
                className="w-full h-12 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    Analyze Options
                    <GitCompare className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Decisions</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentMatrix(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentMatrix?.id === item.id 
                        ? "bg-cyan-500/10 border border-cyan-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Scale className={`h-4 w-4 shrink-0 ${currentMatrix?.id === item.id ? "text-cyan-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">Matrix Calculation</p>
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
            {currentMatrix ? (
              <motion.div
                key={currentMatrix.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Scoreboard */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-6 glass rounded-3xl border ${currentMatrix.matrixData.totalScoreA > currentMatrix.matrixData.totalScoreB ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-border bg-background/50'} text-center`}>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Option A</p>
                    <p className="text-5xl font-black text-foreground">{currentMatrix.matrixData.totalScoreA}</p>
                    <p className="text-xs text-muted-foreground mt-2">Total Score</p>
                  </div>
                  <div className={`p-6 glass rounded-3xl border ${currentMatrix.matrixData.totalScoreB > currentMatrix.matrixData.totalScoreA ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-border bg-background/50'} text-center`}>
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Option B</p>
                    <p className="text-5xl font-black text-foreground">{currentMatrix.matrixData.totalScoreB}</p>
                    <p className="text-xs text-muted-foreground mt-2">Total Score</p>
                  </div>
                </div>

                {/* Final Recommendation */}
                <div className="p-6 glass rounded-3xl border border-indigo-500/30 bg-indigo-500/5">
                  <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-4 w-4" /> Recommendation
                  </h3>
                  <p className="text-lg text-foreground font-medium leading-relaxed">
                    "{currentMatrix.matrixData.recommendation}"
                  </p>
                </div>

                {/* The Matrix */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <TrendingUp className="h-5 w-5 text-amber-500" />
                    Value Breakdown
                  </h3>
                  <div className="space-y-4">
                    {currentMatrix.matrixData.matrix.map((row, idx) => (
                      <div key={idx} className="p-5 glass rounded-2xl border border-border">
                        <h4 className="text-base font-bold text-foreground mb-4 border-b border-border pb-2">{row.value}</h4>
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-blue-500 mb-1">Option A Score</p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(row.scoreA / 10) * 100}%` }} />
                              </div>
                              <span className="text-sm font-bold w-6 text-right">{row.scoreA}/10</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase text-emerald-500 mb-1">Option B Score</p>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-full bg-background rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(row.scoreB / 10) * 100}%` }} />
                              </div>
                              <span className="text-sm font-bold w-6 text-right">{row.scoreB}/10</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground italic bg-background/50 p-3 rounded-xl border border-border/50">
                          {row.reasoning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blindspot Warning */}
                <div className="p-6 glass rounded-3xl border border-red-500/30 bg-red-500/5">
                  <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-3 uppercase tracking-wide">
                    <AlertTriangle className="h-4 w-4" />
                    Blindspot Warning
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {currentMatrix.matrixData.blindspotWarning}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-cyan-500/30">
                <Scale className="h-12 w-12 text-cyan-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No matrix generated.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Input your two options and your core values to generate an objective scoring matrix.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
