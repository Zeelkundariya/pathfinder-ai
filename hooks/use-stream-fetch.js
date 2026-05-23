"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook that streams AI responses from the /api/generate SSE endpoint.
 *
 * Incoming SSE chunks can be large (whole sentences). This hook buffers them
 * and releases 2-3 words at a time on a short interval so the UI types
 * smoothly instead of jumping in big chunks.
 *
 * Usage:
 *   const { streamedText, isLoading, error, startStream, reset } = useStreamFetch();
 *   startStream("Write a cover letter for...");
 */
export default function useStreamFetch() {
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isDev = process.env.NODE_ENV !== "production";

  const abortControllerRef = useRef(null);
  const pendingRef = useRef("");
  const timerRef = useRef(null);
  const receivingRef = useRef(false);

  const WORDS_PER_TICK = 2;
  const TICK_MS = 60;

  const stopReleasing = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishStream = useCallback(() => {
    receivingRef.current = false;

    if (!pendingRef.current) {
      stopReleasing();
      setIsLoading(false);
    }
  }, [stopReleasing]);

  const startReleasing = useCallback(() => {
    if (timerRef.current) return; 

    timerRef.current = setInterval(() => {
      const pending = pendingRef.current;
      if (!pending) {
        if (!receivingRef.current) {
          stopReleasing();
          setIsLoading(false);
        }
        return;
      }

      const words = pending.match(/\S+\s*/g) || [];
      const take = [];
      let wordCount = 0;

      for (const token of words) {
        take.push(token);
        if (token.trim()) wordCount++; 
        if (wordCount >= WORDS_PER_TICK) break;
      }

      const release = take.join("");
      pendingRef.current = pending.slice(release.length);

      setStreamedText((prev) => prev + release);
    }, TICK_MS);
  }, [stopReleasing]);

const startStream = useCallback(async (prompt, conversationId = null) => {x
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopReleasing();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000);

    pendingRef.current = "";
    receivingRef.current = true;
    setStreamedText("");
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
  prompt,
  conversationId,
}),
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${response.status})`);
      }

      if (!response.body) {
        throw new Error("Readable stream not supported");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data: ")) continue;

          const data = line.slice(6);

          if (data === "[DONE]") {
            finishStream();
            if (pendingRef.current && !timerRef.current) {
              startReleasing();
            }
            return;
          }

          try {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              setError(parsed.error);
              finishStream();
              return;
            }

            if (parsed.text) {
              pendingRef.current += parsed.text;
              startReleasing();
            }
          } catch (parseError) {
            if (isDev) {
              console.warn("[useStreamFetch] Ignoring malformed SSE payload", parseError, data);
            }
            continue;
          }
        }
      }

      finishStream();
    } catch (err) {
      if (err.name === "AbortError") {
        finishStream();
        return;
      }

      setError(err.message || "Stream failed");
      finishStream();
      if (isDev) {
        console.warn("[useStreamFetch] Stream failed", err);
      }
    } finally {
      clearTimeout(timeoutId);
      abortControllerRef.current = null;
      finishStream();
    }
  }, [finishStream, isDev, startReleasing, stopReleasing]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopReleasing();
    pendingRef.current = "";
    receivingRef.current = false;
    setStreamedText("");
    setError(null);
    setIsLoading(false);
  }, [stopReleasing]);
  
  useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    stopReleasing();
  };
  }, [stopReleasing]);

  return { streamedText, isLoading, error, startStream, reset };
}
