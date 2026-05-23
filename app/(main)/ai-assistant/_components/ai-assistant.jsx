"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Loader2,
  Trash2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import useStreamFetch from "@/hooks/use-stream-fetch";
import StreamedText, { markdownComponents } from "@/components/streamed-text";
import ReactMarkdown from "react-markdown";

export default function AIAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);

  const scrollRef = useRef(null);

  const { streamedText, isLoading, error, startStream, reset } =
    useStreamFetch();

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();

      if (res.ok) {
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();

      if (res.ok) {
        setActiveConversationId(id);
        setMessages(data.messages || []);
        reset();
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const createConversation = async (firstMessage) => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: firstMessage.slice(0, 50),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setActiveConversationId(data.id);
        setMessages([]);
        await fetchConversations();
        return data.id;
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }

    return null;
  };

  const deleteConversation = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this conversation?"
    );

    if (!confirmed) return;

    try {
      await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }

      fetchConversations();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const clearChatHistory = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all chat history?"
    );

    if (!confirmed) return;

    try {
      await fetch("/api/conversations", {
        method: "DELETE",
      });

      setMessages([]);
      setConversations([]);
      setActiveConversationId(null);
      reset();
    } catch (error) {
      console.error("Clear failed:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamedText, messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || isLoading) return;

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await createConversation(trimmed);
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");

    await startStream(trimmed, conversationId);
    fetchConversations();
  };

  useEffect(() => {
    if (!isLoading && streamedText) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: streamedText,
        },
      ]);

      reset();
      fetchConversations();
    }
  }, [isLoading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex gap-6 h-[calc(100vh-180px)]">
        <div className="w-80 border rounded-lg p-4 flex flex-col">
          <div className="flex gap-2 mb-4">
            <Button
              className="w-full"
              onClick={() => {
                setActiveConversationId(null);
                setMessages([]);
                reset();
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            {conversations.length > 0 && (
              <Button variant="destructive" size="icon" onClick={clearChatHistory}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`p-3 rounded-lg cursor-pointer border flex justify-between items-center ${
                  activeConversationId === conv.id
                    ? "bg-primary/10"
                    : "hover:bg-muted"
                }`}
              >
                <div
                  className="flex-1 truncate"
                  onClick={() => loadConversation(conv.id)}
                >
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteConversation(conv.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-6xl font-bold gradient-title">AI Assistant</h1>
              <p className="text-muted-foreground mt-1">
                Ask anything about your career, resume, or interview prep
              </p>
            </div>
          </div>

          <Card className="flex flex-col h-full">
            <CardContent
              ref={scrollRef}
              className="flex-1 overflow-y-auto space-y-4 p-4"
            >
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Ask me anything</p>
                </div>
              )}

              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={`rounded-lg px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted prose prose-sm dark:prose-invert"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ReactMarkdown components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>

                  <div className="rounded-lg px-4 py-2.5 max-w-[80%] bg-muted">
                    <StreamedText
                      text={streamedText}
                      isLoading={isLoading}
                      error={error}
                      emptyMessage="Thinking..."
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="min-h-[44px] max-h-[120px] resize-none"
                  rows={1}
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}