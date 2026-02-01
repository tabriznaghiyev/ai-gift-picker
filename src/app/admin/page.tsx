"use client";

import { useState } from "react";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret.trim()) return;
    fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Admin-Secret": secret },
      body: JSON.stringify({ action: "check" }),
    })
      .then((r) => {
        if (r.ok) setAuthenticated(true);
        else setMessage("Invalid secret");
      })
      .catch(() => setMessage("Request failed"));
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !secret) return;
    setUploadStatus("uploading");
    setMessage("");
    const form = new FormData();
    form.append("file", file);
    fetch("/api/admin/upload", {
      method: "POST",
      headers: { "X-Admin-Secret": secret },
      body: form,
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          setUploadStatus("ok");
          setMessage(data.message || `Imported ${data.count ?? 0} products`);
          setFile(null);
        } else {
          setUploadStatus("error");
          setMessage(data.error || r.statusText);
        }
      })
      .catch(() => {
        setUploadStatus("error");
        setMessage("Upload failed");
      });
  };

  if (!authenticated) {
    return (
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-xl font-semibold mb-4">Admin — sign in</h1>
        <form onSubmit={handleAuth} className="space-y-3">
          <input
            type="password"
            placeholder="Admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
          />
          <button type="submit" className="w-full px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">
            Continue
          </button>
        </form>
        {message && <p className="mt-2 text-red-600 text-sm">{message}</p>}
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-xl font-semibold mb-2">Admin — upload products</h1>
      <p className="text-sm text-slate-500 mb-6">
        CSV columns: id, title, description, category, tags, price_min, price_max, amazon_url, image_url, locale, active
      </p>
      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-sky-50 file:text-sky-700"
        />
        <button
          type="submit"
          disabled={!file || uploadStatus === "uploading"}
          className="w-full px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {uploadStatus === "uploading" ? "Uploading…" : "Upload CSV"}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${uploadStatus === "error" ? "text-red-600" : "text-slate-600"}`}>
          {message}
        </p>
      )}
    </main>
  );
}
