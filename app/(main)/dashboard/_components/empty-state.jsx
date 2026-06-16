"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, Loader2, BarChart3, Target, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({ userName }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/[0.04] rounded-full blur-[200px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/[0.02] via-transparent to-purple-500/[0.02] rounded-full blur-[180px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl w-full mx-auto text-center space-y-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto w-24 h-24"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse-slow" />
          <div className="relative w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-3d shadow-primary/30">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </motion.div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground"
          >
            Welcome, <span className="text-gradient-primary">{userName || "Explorer"}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed font-medium"
          >
            Your onboarding is complete. Let&apos;s generate personalized industry insights and build your
            Career Intelligence Hub.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-lg mx-auto"
        >
          {[
            { icon: BarChart3, label: "Market Trends", color: "text-blue-500 bg-blue-500/10" },
            { icon: Target, label: "Salary Benchmarks", color: "text-emerald-500 bg-emerald-500/10" },
            { icon: TrendingUp, label: "Growth Analysis", color: "text-purple-500 bg-purple-500/10" },
            { icon: Shield, label: "Skill Insights", color: "text-amber-500 bg-amber-500/10" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border border-border/40 bg-card/30 hover:bg-card/50 hover:border-primary/30 transition-all duration-300 shadow-soft"
              >
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center border border-border/40 ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground text-center leading-tight uppercase tracking-wider">
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={generating}
            className="h-14 px-10 rounded-2xl bg-gradient-to-br from-primary via-primary to-purple-600 text-primary-foreground hover:opacity-90 shadow-xl shadow-primary/30 hover:shadow-3d hover:shadow-primary/30 font-bold text-base gap-2 transition-all duration-300"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate My Industry Insights
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-3 font-medium">
            This will analyze your industry and create a personalized intelligence dashboard.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
