"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Send, Loader2, Users, AlertTriangle, ShieldAlert, CheckCircle, Info, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateConflictResolution, getConflictResolutions } from "@/actions/conflict-resolution";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ConflictResolverPage() {
  const [conflictType, setConflictType] = useState("");
  const [otherParty, setOtherParty] = useState("");
  const [situation, setSituation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentResolution, setCurrentResolution] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getConflictResolutions();
    if (res.resolutions) {
      setHistory(res.resolutions);
      if (res.resolutions.length > 0) {
        setCurrentResolution(res.resolutions[0]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!conflictType || !otherParty || !situation.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("conflictType", conflictType);
      formData.append("otherParty", otherParty);
      formData.append("situation", situation);

      const res = await generateConflictResolution(formData);
      if (res && res.id) {
        toast.success("Resolution strategy generated!");
        setConflictType("");
        setOtherParty("");
        setSituation("");
        loadHistory();
      }
    } catch (error) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container max-w-6xl py-12 px-4 md:px-6">
      <div className="space-y-4 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500">
          <Handshake className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Conflict Resolver</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Navigate Difficult <span className="text-gradient-primary">Conversations.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Get empathetic, constructive talking points and scripts to resolve workplace conflicts with managers, peers, or direct reports.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Conflict Details</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-indigo-500 flex items-center gap-1.5">
                  <AlertTriangle className="h-3 w-3" /> Type of Conflict
                </label>
                <Select value={conflictType} onValueChange={setConflictType}>
                  <SelectTrigger className="w-full bg-background/50 border-indigo-500/20 rounded-xl h-12">
                    <SelectValue placeholder="Select conflict type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Performance or Expectations">Performance or Expectations</SelectItem>
                    <SelectItem value="Interpersonal or Personality Clash">Interpersonal or Personality Clash</SelectItem>
                    <SelectItem value="Project Direction or Strategy">Project Direction or Strategy</SelectItem>
                    <SelectItem value="Credit or Recognition">Credit or Recognition</SelectItem>
                    <SelectItem value="Resource Allocation">Resource Allocation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Other Party
                </label>
                <Select value={otherParty} onValueChange={setOtherParty}>
                  <SelectTrigger className="w-full bg-background/50 border-amber-500/20 rounded-xl h-12">
                    <SelectValue placeholder="Who are you in conflict with?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">Manager / Supervisor</SelectItem>
                    <SelectItem value="Peer">Peer / Teammate</SelectItem>
                    <SelectItem value="Direct Report">Direct Report</SelectItem>
                    <SelectItem value="Cross-functional Team Member">Cross-functional Team Member</SelectItem>
                    <SelectItem value="Client or External Partner">Client or External Partner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-emerald-500 flex items-center gap-1.5">
                  <Info className="h-3 w-3" /> Situation Details
                </label>
                <Textarea
                  placeholder="Describe what happened, how it made you feel, and what you hope to achieve..."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  className="min-h-[120px] resize-none bg-background/50 border-emerald-500/20 rounded-2xl focus:border-emerald-500"
                />
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !conflictType || !otherParty || !situation.trim()}
                className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold mt-2 shadow-lg shadow-rose-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Situation...
                  </>
                ) : (
                  <>
                    Generate Resolution Strategy
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Resolutions</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentResolution(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentResolution?.id === item.id 
                        ? "bg-rose-500/10 border border-rose-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Handshake className={`h-4 w-4 shrink-0 ${currentResolution?.id === item.id ? "text-rose-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {item.conflictType} with {item.otherParty}
                        </p>
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
            {currentResolution ? (
              <motion.div
                key={currentResolution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Analysis */}
                <div className="p-8 glass rounded-3xl border border-indigo-500/20 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Situation Analysis</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentResolution.resolutionData.analysis}
                  </p>
                </div>

                {/* Script */}
                <div className="p-8 bg-card rounded-3xl border border-rose-500/30 shadow-xl shadow-rose-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-rose-500/20 rounded-xl text-rose-500">
                      <Mic className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Opening Script</h3>
                  </div>
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border relative z-10">
                    <p className="text-lg text-foreground font-medium italic leading-relaxed">
                      "{currentResolution.resolutionData.script}"
                    </p>
                  </div>
                </div>

                {/* Talking Points & Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 glass rounded-3xl border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                      <h4 className="font-bold text-foreground">Key Talking Points</h4>
                    </div>
                    <ul className="space-y-3">
                      {currentResolution.resolutionData.talkingPoints.map((point, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                          <span className="text-sm text-muted-foreground">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 glass rounded-3xl border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                      <h4 className="font-bold text-foreground">De-escalation Tips</h4>
                    </div>
                    <ul className="space-y-3">
                      {currentResolution.resolutionData.deEscalationTips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                          <span className="text-sm text-muted-foreground">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-rose-500/30">
                <Handshake className="h-12 w-12 text-rose-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No resolutions generated.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Describe a workplace conflict, and we'll provide a constructive strategy to resolve it.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
