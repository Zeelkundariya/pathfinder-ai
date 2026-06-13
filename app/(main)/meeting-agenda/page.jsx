"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, Send, Clock, Loader2, Users, Target, CheckCircle2, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { generateAgenda, getMeetingAgendas } from "@/actions/meeting-agenda";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MeetingAgendaPage() {
  const [meetingType, setMeetingType] = useState("");
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentAgenda, setCurrentAgenda] = useState(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await getMeetingAgendas();
    if (res.success && res.data.length > 0) {
      setHistory(res.data);
      setCurrentAgenda(res.data[0]);
    }
  };

  const handleGenerate = async () => {
    if (!meetingType.trim() || !topic.trim() || !duration.trim()) {
      toast.error("Please fill out all fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await generateAgenda(meetingType, topic, duration);
      if (res.success) {
        toast.success("Agenda generated!");
        setMeetingType("");
        setTopic("");
        setDuration("");
        loadHistory();
      } else {
        toast.error(res.errors._form?.[0] || "Failed to generate agenda");
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
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500">
          <ListTodo className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-widest">Meeting Agenda Builder</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Lead with <span className="text-gradient-primary">Purpose.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Never host a meeting that could have been an email. Generate structured, time-boxed agendas with clear objectives and guiding questions to keep your team focused.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 glass rounded-3xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Meeting Details</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Meeting Type
                </label>
                <Input
                  placeholder="E.g., 1-on-1, Project Kickoff, Post-mortem..."
                  value={meetingType}
                  onChange={(e) => setMeetingType(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Target className="h-3 w-3" /> Core Topic / Goal
                </label>
                <Textarea
                  placeholder="E.g., We need to finalize the Q3 marketing budget and assign owners..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="min-h-[100px] resize-none bg-background/50 border-border/50 rounded-2xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-1.5">
                  <Clock className="h-3 w-3" /> Duration
                </label>
                <Input
                  placeholder="E.g., 30 minutes, 1 hour..."
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 rounded-xl"
                />
              </div>
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !meetingType.trim() || !topic.trim() || !duration.trim()}
                className="w-full h-12 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Structuring Agenda...
                  </>
                ) : (
                  <>
                    Build Agenda
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="p-6 glass rounded-3xl border border-border">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Past Agendas</h3>
              <div className="space-y-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentAgenda(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-300 ${
                      currentAgenda?.id === item.id 
                        ? "bg-teal-500/10 border border-teal-500/30" 
                        : "bg-background/40 border border-transparent hover:border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <LayoutTemplate className={`h-4 w-4 shrink-0 ${currentAgenda?.id === item.id ? "text-teal-500" : "text-muted-foreground"}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{item.meetingType}</p>
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
            {currentAgenda ? (
              <motion.div
                key={currentAgenda.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Objective */}
                <div className="p-6 glass rounded-3xl border border-teal-500/30 bg-teal-500/5">
                  <h3 className="text-sm font-bold text-teal-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" /> The Objective
                  </h3>
                  <p className="text-lg text-foreground font-medium leading-relaxed">
                    "{currentAgenda.agendaData.meetingObjective}"
                  </p>
                </div>

                {/* Pre-Read */}
                <div className="p-5 glass rounded-2xl border border-border bg-background/50 flex items-start gap-4">
                  <div className="p-2 bg-indigo-500/10 rounded-full text-indigo-500 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-500 mb-1">Pre-Read / Prep</h4>
                    <p className="text-sm text-foreground leading-relaxed">
                      {currentAgenda.agendaData.preReadSuggestion}
                    </p>
                  </div>
                </div>

                {/* The Agenda Blocks */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <ListTodo className="h-5 w-5 text-amber-500" />
                      Agenda Items
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    {currentAgenda.agendaData.agendaItems.map((item, idx) => (
                      <div key={idx} className="p-5 glass rounded-2xl border border-border relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                        <div className="pl-3 flex flex-col md:flex-row gap-4">
                          <div className="md:w-24 shrink-0 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase bg-background/50 px-2 py-1 rounded-md h-fit">
                            <Clock className="h-3 w-3" /> {item.timeAllocation}
                          </div>
                          <div className="space-y-2 flex-1">
                            <h4 className="text-base font-bold text-foreground">{item.topic}</h4>
                            <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 text-sm italic text-amber-600 dark:text-amber-400">
                              <span className="font-bold uppercase text-[10px] tracking-widest block mb-1">Facilitator Question:</span>
                              "{item.facilitatorQuestion}"
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Leadership Tip */}
                <div className="p-6 glass rounded-3xl border border-blue-500/30 bg-blue-500/5">
                  <h3 className="text-sm font-bold text-blue-500 flex items-center gap-2 mb-3 uppercase tracking-wide">
                    <Users className="h-4 w-4" />
                    Facilitation Tip
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {currentAgenda.agendaData.leadershipTip}
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 glass rounded-3xl border border-dashed border-teal-500/30">
                <ListTodo className="h-12 w-12 text-teal-500/30 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">No agendas generated.</p>
                <p className="text-sm text-muted-foreground/60 max-w-sm mt-2">Enter your meeting details to generate a highly structured, outcome-driven agenda.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
