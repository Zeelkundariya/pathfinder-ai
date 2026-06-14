"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Send, Loader2, Clock, CalendarCheck, ShieldAlert, CheckCircle, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateMicroHabitPlan, getMicroHabitPlans } from "@/actions/micro-habits";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MicroHabitsPage() {
  const [goal, setGoal] = useState("");
  const [timeAvailable, setTimeAvailable] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getMicroHabitPlans();
    if (res.plans) {
      setHistory(res.plans);
      if (res.plans.length > 0) {
        setCurrentPlan(res.plans[0]);
      }
    }
  };

  const handleGenerate = async () => {
    if (!goal.trim() || !timeAvailable) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append("goal", goal);
      formData.append("timeAvailable", timeAvailable);

      const res = await generateMicroHabitPlan(formData);
      if (res && res.id) {
        toast.success("Micro-habit plan generated!");
        setGoal("");
        setTimeAvailable("");
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Micro-Habit Planner</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Achieve Big Goals with <span className="text-gradient-primary">Tiny Habits.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Break ambitious career goals into sustainable, 5-minute daily actions that build momentum without causing burnout.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Goal Details</h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-indigo-500 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Career Goal
                </label>
                <Textarea
                  placeholder="e.g., Learn Next.js, Transition to Product Management, Read 10 leadership books..."
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="min-h-[100px] resize-none bg-background/50 border-indigo-500/20 rounded-2xl focus:border-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-amber-500 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Daily Time Available
                </label>
                <Select value={timeAvailable} onValueChange={setTimeAvailable}>
                  <SelectTrigger className="w-full bg-background/50 border-amber-500/20 rounded-xl h-12">
                    <SelectValue placeholder="How much time can you commit daily?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5 minutes">5 minutes</SelectItem>
                    <SelectItem value="10 minutes">10 minutes</SelectItem>
                    <SelectItem value="15 minutes">15 minutes</SelectItem>
                    <SelectItem value="30 minutes">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !goal.trim() || !timeAvailable}
                className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold mt-2 shadow-lg shadow-emerald-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Planning Habits...
                  </>
                ) : (
                  <>
                    Generate Habit Plan
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Plans</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPlan(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentPlan?.id === item.id 
                        ? "bg-emerald-500/10 border border-emerald-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Zap className={`h-4 w-4 shrink-0 ${currentPlan?.id === item.id ? "text-emerald-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.goal}</p>
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
            {currentPlan ? (
              <motion.div
                key={currentPlan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Goal Breakdown */}
                <div className="p-8 glass rounded-3xl border border-indigo-500/20 relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-500">
                      <Target className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Goal Breakdown</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentPlan.habitData.goalBreakdown}
                  </p>
                </div>

                {/* Daily Habits */}
                <div className="p-8 bg-card rounded-3xl border border-emerald-500/30 shadow-xl shadow-emerald-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Your Micro-Habits</h3>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    {currentPlan.habitData.dailyHabits.map((habit, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-muted/50 border border-border flex items-start gap-4">
                        <div className="mt-1 h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 font-bold text-xs">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{habit.habit}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {habit.timeEstimate}
                            </span>
                            <span className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                              <Zap className="h-3 w-3" /> Trigger: {habit.trigger}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reviews & Burnout Prevention */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 glass rounded-3xl border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarCheck className="h-5 w-5 text-blue-500" />
                      <h4 className="font-bold text-foreground">Weekly Reviews</h4>
                    </div>
                    <ul className="space-y-3">
                      {currentPlan.habitData.weeklyReviews.map((review, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                          <span className="text-sm text-muted-foreground">{review}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-6 glass rounded-3xl border border-border">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldAlert className="h-5 w-5 text-rose-500" />
                      <h4 className="font-bold text-foreground">Burnout Prevention</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {currentPlan.habitData.burnoutPrevention}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-emerald-500/30">
                <Zap className="h-12 w-12 text-emerald-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No plans generated.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Enter an ambitious goal and we'll break it down into tiny, actionable daily habits.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
