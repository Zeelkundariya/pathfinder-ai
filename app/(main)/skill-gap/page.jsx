"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Send, MapPin, Loader2, Target, AlertCircle, Sparkles, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateSkillGap, getSkillGaps } from "@/actions/skill-gap";
import { toast } from "sonner";
import { format } from "date-fns";

export default function SkillGapPage() {
  const [currentRole, setCurrentRole] = useState("");
  const [dreamRole, setDreamRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getSkillGaps();
    if (res.success && res.data.length > 0) {
      setHistory(res.data);
      setCurrentAnalysis(res.data[0]);
    }
  };

  const handleGenerate = async () => {
    if (!currentRole.trim() || !dreamRole.trim() || !currentSkills.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateSkillGap(currentRole, dreamRole, currentSkills);
      if (res.success) {
        toast.success("Skill gap analysis complete!");
        setCurrentRole("");
        setDreamRole("");
        setCurrentSkills("");
        loadHistory();
      } else {
        toast.error(res.errors._form?.[0] || "Failed to generate analysis");
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-500">
          <Route className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Skill Gap Analyzer</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Bridge the <span className="text-gradient-primary">Gap.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Map the exact learning path from your current role to your dream job. We'll identify missing skills and suggest concrete projects to prove your capability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Your Trajectory</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Point A (Current Role)
                </label>
                <Input
                  placeholder="E.g., Customer Support Specialist"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-violet-500 ml-1 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Point B (Dream Role)
                </label>
                <Input
                  placeholder="E.g., Junior Product Manager"
                  value={dreamRole}
                  onChange={(e) => setDreamRole(e.target.value)}
                  className="h-12 bg-background/50 border-violet-500/20 rounded-xl focus:border-violet-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Your Current Arsenal (Skills)</label>
                <Textarea
                  placeholder="E.g., Zendesk, conflict resolution, basic data analysis in Excel, strong written communication..."
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  className="min-h-[100px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !currentRole.trim() || !dreamRole.trim() || !currentSkills.trim()}
                className="w-full h-12 rounded-xl bg-violet-500 hover:bg-violet-600 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Gap...
                  </>
                ) : (
                  <>
                    Map My Path
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Paths</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentAnalysis(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentAnalysis?.id === item.id 
                        ? "bg-violet-500/10 border border-violet-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Route className={`h-4 w-4 shrink-0 ${currentAnalysis?.id === item.id ? "text-violet-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.currentRole} ➔ {item.dreamRole}</p>
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
            {currentAnalysis ? (
              <motion.div
                key={currentAnalysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Summary */}
                <div className="p-6 glass rounded-3xl border border-violet-500/30 bg-violet-500/5">
                  <h3 className="text-sm font-bold text-violet-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                    <Navigation className="h-4 w-4" /> The Leap
                  </h3>
                  <p className="text-lg text-foreground font-medium leading-relaxed">
                    "{currentAnalysis.analysisData.gapSummary}"
                  </p>
                </div>

                {/* Missing Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 glass rounded-2xl border border-blue-500/20 bg-blue-500/5">
                    <h4 className="text-sm font-bold text-blue-500 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Missing Hard Skills
                    </h4>
                    <ul className="space-y-2">
                      {currentAnalysis.analysisData.missingHardSkills.map((skill, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span> {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-5 glass rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
                    <h4 className="text-sm font-bold text-emerald-500 mb-3 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Missing Soft Skills
                    </h4>
                    <ul className="space-y-2">
                      {currentAnalysis.analysisData.missingSoftSkills.map((skill, i) => (
                        <li key={i} className="text-sm text-foreground flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">•</span> {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Learning Path */}
                <div className="p-6 glass rounded-3xl border border-border bg-background/40">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground mb-6">
                    <Route className="h-5 w-5 text-amber-500" />
                    Your Action Plan
                  </h3>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                    {currentAnalysis.analysisData.learningPath.map((step, idx) => (
                      <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-border bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 text-xs font-bold text-muted-foreground">
                          {step.step}
                        </div>
                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 glass rounded-2xl border border-border">
                          <h4 className="text-sm font-bold text-foreground mb-1">{step.focus}</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">{step.actionableAdvice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Portfolio Projects */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                    Prove It (Portfolio Projects)
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {currentAnalysis.analysisData.portfolioProjects.map((proj, idx) => (
                      <div key={idx} className="p-5 glass rounded-2xl border border-indigo-500/20 bg-indigo-500/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <div className="pl-3 space-y-2">
                          <h4 className="text-base font-bold text-foreground">{proj.title}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{proj.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-violet-500/30">
                <Route className="h-12 w-12 text-violet-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No path mapped yet.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Enter your current role and your dream role to generate a customized learning trajectory.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
