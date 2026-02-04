"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SLIDES = [
  {
    title: "AI-Powered Gift Finder",
    subtitle: "Personalized recommendations in seconds",
    stat: "4-step quiz",
    statLabel: "to get started",
    gradient: "from-violet-600 via-fuchsia-600 to-cyan-500",
    icon: "🎁",
  },
  {
    title: "Smart Matching",
    subtitle: "ML + LLM rank 8,000+ products",
    stat: "6",
    statLabel: "curated picks per session",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    icon: "✨",
  },
  {
    title: "Built to Scale",
    subtitle: "Next.js • Prisma • SQLite → Postgres ready",
    stat: "100%",
    statLabel: "white-label ready",
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    icon: "🚀",
  },
];

function useStats() {
  const [stats, setStats] = useState({ products: 8000, categories: 0 });
  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.products != null) setStats((s) => ({ ...s, products: d.products }));
        if (d.categories != null) setStats((s) => ({ ...s, categories: d.categories }));
      })
      .catch(() => {});
  }, []);
  return stats;
}

function CountUp({ end, duration = 2, suffix = "" }: { end: number; duration?: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration * 60);
    const t = setInterval(() => {
      start += step;
      if (start >= end) {
        setValue(end);
        clearInterval(t);
        return;
      }
      setValue(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(t);
  }, [end, duration]);
  return <>{value.toLocaleString()}{suffix}</>;
}

export default function ShowcasePage() {
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  const stats = useStats();

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,80,220,0.25),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_50%,rgba(6,182,212,0.12),transparent)] pointer-events-none" />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        <Link
          href="/"
          className="text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          ← Back to Gift Finder
        </Link>
        <span className="text-white/50 text-sm">Project Showcase</span>
      </nav>

      {/* Hero slideshow */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div
            key={slide}
            className={`rounded-3xl bg-gradient-to-br ${SLIDES[slide].gradient} p-1 transition-all duration-700 ${
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="rounded-[22px] bg-slate-900/90 backdrop-blur-xl p-8 sm:p-12 min-h-[280px] flex flex-col items-center justify-center">
              <span className="text-5xl sm:text-6xl mb-4 animate-float inline-block">
                {SLIDES[slide].icon}
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2">
                {SLIDES[slide].title}
              </h1>
              <p className="text-white/80 text-lg sm:text-xl mb-6">
                {SLIDES[slide].subtitle}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black bg-white/20 px-4 py-2 rounded-2xl">
                  {SLIDES[slide].stat}
                </span>
                <span className="text-white/70">{SLIDES[slide].statLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide ? "w-8 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive stats */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
            By the numbers
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                value: stats.products,
                label: "Products in catalog",
                suffix: "",
                isCount: true,
              },
              {
                value: stats.categories > 0 ? stats.categories : 45,
                label: "Categories",
                suffix: "",
                isCount: true,
              },
              { value: 4, label: "Quiz steps", suffix: "", isCount: true },
              { value: 6, label: "Recommendations per run", suffix: "", isCount: true },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              >
                <div className="text-3xl sm:text-4xl font-black text-cyan-400 mb-1">
                  {item.isCount ? (
                    <CountUp end={item.value} suffix={item.suffix} />
                  ) : (
                    item.value + item.suffix
                  )}
                </div>
                <div className="text-white/70 text-sm sm:text-base">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's happening / How it works */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-4">
            What&apos;s happening under the hood
          </h2>
          <p className="text-white/70 text-center mb-12 max-w-xl mx-auto">
            From a short quiz to personalized gift picks in seconds.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Quiz",
                desc: "Occasion, relationship, age, budget",
                icon: "📋",
              },
              {
                step: "2",
                title: "AI + Retrieval",
                desc: "Profile built, candidates fetched & ranked",
                icon: "🧠",
              },
              {
                step: "3",
                title: "Results",
                desc: "Top 3 picks + 3 alternatives with reasons",
                icon: "🎯",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="relative rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-sm overflow-hidden group hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-cyan-400 font-mono text-sm mb-1">Step {item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-white/70 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selling points */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-12">
            Why this project
          </h2>
          <ul className="space-y-4">
            {[
              "Full-stack: Next.js 16, React 18, Prisma, SQLite (Postgres-ready).",
              "AI-ready: Optional OpenAI for ranking; local ML (ONNX) path included.",
              "Scalable catalog: 8,000+ products, 45+ categories, easy to extend.",
              "Session persistence: Store quiz + results for analytics or replay.",
              "White-label: No branding lock-in; ready to rebrand and deploy.",
            ].map((text, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/10 px-5 py-4 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/30 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span className="text-white/90">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-white/70 mb-6">
            Try the experience and see how recommendations are generated.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300 hover:scale-105"
          >
            Open Gift Finder
          </Link>
        </div>
      </section>
    </div>
  );
}
