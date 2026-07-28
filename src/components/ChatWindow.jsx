import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";

const LM_STUDIO_BASE_URL = "http://localhost:1234/v1";
const logo = <img className="rounded rounded-full" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoIF4oa5zeeO-atBts_wkA79pRWah0rNbwFSpc6K-wt6bV6VwCt5ckqujr&s=10"></img>

const lmStudioClient = axios.create({
  baseURL: LM_STUDIO_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 120_000,
});

const SYSTEM_PROMPT =
  "## System prompt: You are a helpful IT assistant for Colusa County. If a PC reboot sounds like it *could* fix things, give it as a recommendation, can't go wrong with it. If the problem a user presents to you seems a bit too complex for the end user, give them initial instructions (an attempt to solve it on their own) and let them know an IT professional will be with them shortly, either Henry, Andrew, Benny or Sam. Do not tell the user that the IT professional has been notified. If for whatever reason a user asks who has built you, answer by explaining that Henry Graves set up this app, if they ask who that is, say: 'The IT guy that put this all together!'. If for some reason the users request seems to be non-IT related or they're just asking other questions, feel free to generalize your response and move off the help desk mindset for a bit. Some context on colusa county--We are somewhat outdated infrastructure wise, we have just started adopting M365/exchange online. Here is the users help request message: ";

function Avatar({ role }) {
  const isUser = role === "user";
  return (
    <div
      className={`flex h-9 w-9 shrink-0 select-none items-center justify-center rounded-full text-sm font-bold shadow-sm text-white ${
        isUser
          ? "bg-gradient-to-br from-emerald-400 to-teal-600 text-white"
          : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
      }`}
    >
      {isUser ? "You" : logo}
    </div>
  );
}

function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  const renderContent = (text) => {
    const parts = [];
    // Split out fenced code blocks
    const segments = text.split(/(```[\s\S]*?```)/g);
    segments.forEach((seg, i) => {
      if (seg.startsWith("```")) {
        const code = seg.replace(/^```(\w+)?\n/, "").replace(/```$/, "");
        parts.push(
          <pre
            key={i}
            className="my-2 overflow-x-auto rounded-lg bg-gray-900 p-3 text-sm text-gray-100 ring-1 ring-gray-700"
          >
            <code>{code}</code>
          </pre>
        );
      } else {
        // Inline code + bold
        const inlineProcessed = seg
          .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
          .map((chunk, j) => {
            if (chunk.startsWith("**") && chunk.endsWith("**")) {
              return (
                <strong key={`${i}-${j}`}>
                  {chunk.slice(2, -2)}
                </strong>
              );
            }
            if (chunk.startsWith("`") && chunk.endsWith("`")) {
              return (
                <code
                  key={`${i}-${j}`}
                  className="rounded bg-gray-200 px-1 py-0.5 text-sm font-mono text-pink-600"
                >
                  {chunk.slice(1, -1)}
                </code>
              );
            }
            return <React.Fragment key={`${i}-${j}`}>{chunk}</React.Fragment>;
          });
        parts.push(...inlineProcessed);
      }
    });
    return parts;
  };

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar role={msg.role} />
      <div
        className={`group relative max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md ${
          isUser
            ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            : "bg-white text-gray-800 ring-1 ring-gray-200"
        }`}
      >
        {/* Tail */}
        <div
          className={`absolute top-3 h-3 w-3 rotate-45 ${
            isUser
              ? "-right-1 bg-teal-600 ring-2 ring-indigo" 
              : "-left-1 bg-white ring-1 ring-gray-200"
          }`}
          style={
            isUser
              ? { right: "-6px" }
              : { left: "-6px" }
          }
        />
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
          {msg.content ? (
            renderContent(msg.content)
          ) : (<>
            <p className="flex text-gray-400">Processing your message...</p>
            <span className="inline-flex items-center gap-1 text-gray-400">
              <TypingDots />
            </span>
         </> )}
        </div>
        {msg.model && (
          <div
            className={`mt-2 text-[10px] uppercase tracking-wide ${
              isUser ? "text-emerald-100" : "text-gray-400"
            }`}
          >
            {msg.model}
          </div>
        )}
      </div>
    </div>
  );
}

/** Animated typing indicator */
function TypingDots() {
  return ( <>
    
    <span className="inline-flex items-center gap-1">
      
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
          style={{ animationDelay: `${i * 150}ms` }}
        /> 
      ))}
    </span>
    </>
  );
}

/** Suggestions shown when the chat is empty */
function WelcomeScreen({ onPick }) {
  const suggestions = [
    // { icon: "💡", title: "Technical Issues?", text: "I'm having some technical problems! Can you assist?" }
  ];
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-lg">
        {logo}
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Colusa County AI Tech Assistance</h2>
      <p className="mt-1 text-sm text-gray-500">
        Powered by Colusa County AI
      </p>
      <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-1">
        {suggestions.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.text)}
            className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
          >
            <span className="text-2xl">{s.icon}</span>
            <div>
              <div className="font-semibold text-gray-700 group-hover:text-violet-600">
                {s.title}
              </div>
              <div className="text-sm text-gray-400">{s.text}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="text-4xl color-red-100">
        How can I help you today?
      </div>
    </div>
  );
}

export default function ChatWindow() {

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]); // loaded models from LM Studio
  const [selectedModel, setSelectedModel] = useState("");

  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  // ─── Auto-scroll to bottom on new content ───
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ─── Fetch available models on mount ───
  useEffect(() => {
    (async () => {
      try {
        const { data } = await lmStudioClient.get("/models");
        const ids = data?.data?.map((m) => m.id) ?? [];
        setModels(ids);
        if (ids.length > 0) setSelectedModel(ids[0]);
      } catch (err) {
        // Non-critical — LM Studio may still serve on default model
        console.warn("Could not fetch model list:", err.message);
      }
    })();
  }, []);

  // ─── Send a message (with streaming via fetch) ───
  const sendMessage = useCallback(
    async (text) => {
      const userText = text.trim();
      if (!userText || isStreaming) return;

      setError(null);
      setInput("");

      // Build the full conversation history for the API call
      const apiMessages = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: userText },
      ];

      // Optimistically push the user message + an empty assistant placeholder
      const userMsg = { role: "user", content: userText };
      const assistantMsg = { role: "assistant", content: "", model: selectedModel || "local-model" };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // We use raw fetch here because axios doesn't natively support
        // streaming response bodies in the browser.  The request payload
        // matches LM Studio's OpenAI-compatible /chat/completions endpoint.
        const response = await fetch(`${LM_STUDIO_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: selectedModel || "local-model",
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: -1, // -1 = no limit (LM Studio convention)
            stream: true,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // SSE format: lines start with "data: "
          const lines = buffer.split("\n");
          buffer = lines.pop(); // keep the partial line for next iteration

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data:")) continue;

            const payload = trimmed.replace(/^data:\s*/, "");

            if (payload === "[DONE]") {
              break;
            }

            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                // Update only the last (placeholder) message
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    ...copy[copy.length - 1],
                    content: assistantContent,
                  };
                  return copy;
                });
              }
            } catch {
              // Partial JSON — ignore, will complete on next chunk
            }
          }
        }
      } catch (err) {
        if (err.name === "AbortError") {
          // User clicked stop — leave whatever was streamed so far
        } else {
          setError(err.message || "Something went wrong. Is LM Studio running?");
          // Remove the empty assistant placeholder on failure
          setMessages((prev) => {
            const copy = [...prev];
            if (copy[copy.length - 1]?.role === "assistant" && !copy[copy.length - 1].content) {
              copy.pop();
            }
            return copy;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, isStreaming, selectedModel]
  );

  // ─── Stop generation ───
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ─── Clear conversation ───
  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  // ─── Regenerate last response ───
  const regenerate = useCallback(() => {
    setMessages((prev) => {
      // Find the last user message
      let lastUserIdx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].role === "user") {
          lastUserIdx = i;
          break;
        }
      }
      if (lastUserIdx === -1) return prev;
      const lastUserText = prev[lastUserIdx].content;
      const trimmed = prev.slice(0, lastUserIdx); // drop user msg + everything after
      // Re-send in next tick after state settles
      setTimeout(() => sendMessage(lastUserText), 0);
      return trimmed;
    });
  }, [sendMessage]);

  // ─── Keyboard handler ───
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };


  // ─── Render ───
  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center text-xl rounded rounded-full">
            {logo}
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Colusa County AI Tech Assistant</h1>
            <p className="text-xs text-gray-400">
              {isStreaming ? "Generating…" : "Ready"} · {selectedModel ? `AI model loaded: ${selectedModel}` : "No model loaded"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model selector */}
          {/* {models.length > 0 && (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )} */}

          {/* Regenerate */}
          {/* <button
            onClick={regenerate}
            disabled={messages.length === 0 || isStreaming}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
            title="Regenerate last response"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992V4.356M4.018 13.65h-4.992v4.992M4.985 4.984A8 8 0 0119.014 9.348M3.0 13.652a8 8 0 0011.33 7.245" />
            </svg>
          </button> */}

          {/* Clear chat */}
          <button
            onClick={clearChat}
            disabled={messages.length === 0}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
            title="Clear conversation"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V3a1 1 0 011-1h4a1 1 0 011 1v4" />
            </svg>
          </button>
        </div>
      </header>

      {/* ─── Messages Area ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
        {messages.length === 0 ? (
          <WelcomeScreen onPick={(text) => sendMessage(text)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} />
            ))}

            {error && (
              <div className="flex justify-center">
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-200">
                  ⚠️ {error}
                  <span className="ml-2 text-red-400">
                    Make sure LM server is running with a loaded model.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Input Area ─── */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="relative flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message…"
                rows={1}
                className="max-h-40 w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-[15px] text-gray-800 placeholder-gray-400 outline-none transition-all focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
                style={{
                  minHeight: "52px",
                  height: "auto",
                }}
                onInput={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
                }}
                disabled={isStreaming}
              />
            </div>

            {isStreaming ? (
              <button
                onClick={stopGeneration}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 active:scale-95"
                title="Stop generation"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg transition-all hover:shadow-xl hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:bg-none disabled:shadow-none"
                title="Send message"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </button>
            )}
          </div>
          <p className="mt-2 text-center text-xs text-gray-800">
            Responses are generated locally by our dedicated AI server. Your data and messages do not leave the Colusa County network. 
          </p>
        </div>
      </div>
    </div>
  );
}