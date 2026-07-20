"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { subscribersApi } from "@/lib/api";
import toast from "react-hot-toast";
interface DatumNewsletterProps {
  settings: Record<string, unknown> | any;
}
export default function DatumNewsletter({ settings }: DatumNewsletterProps) {
  const [email, setEmail] = useState("");
  const mutation = useMutation({
    mutationFn: (emailToSubscribe: string) => subscribersApi.subscribe(emailToSubscribe),
    onSuccess: () => {
      toast.success("Successfully subscribed!");
      setEmail("");
    },
    onError: (error: Error | unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to subscribe.");
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate(email);
  };
  return (
    <section className="py-10 sm:py-14 lg:py-20" id="subscribe">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 lg:px-11">
        <div className="relative bg-datum-ink text-datum-surface rounded-lg p-6 sm:p-10 lg:px-16 lg:py-20">
          <div className="corner-bracket corner-bracket-tl top-6 left-6" />
          <div className="corner-bracket corner-bracket-tr top-6 right-6" />
          <div className="corner-bracket corner-bracket-bl bottom-6 left-6" />
          <div className="corner-bracket corner-bracket-br bottom-6 right-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div>
              <h2 className="font-datum-display font-bold text-[clamp(28px,4vw,40px)] leading-[1.15] text-datum-surface mb-3">
                {settings?.newsletterTitle || "Get new notes by email."}
              </h2>
              {settings?.newsletterSubtitle && (
                <p className="text-[14px] sm:text-[15px] leading-relaxed text-datum-ink-faint max-w-[90vw] sm:max-w-[380px]">
                  {settings.newsletterSubtitle}
                </p>
              )}
            </div>
            <div>
              <form onSubmit={handleSubmit} className="flex flex-col xs:flex-row gap-3">
                <input
                  type="email"
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 font-datum-body text-[14px] text-datum-surface placeholder:text-white/50 outline-none focus:border-datum-surface transition-colors"
                  placeholder={settings?.newsletterPlaceholder || "your@email.com"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-datum-accent text-datum-surface font-datum-mono text-[11px] font-medium tracking-[0.08em] uppercase px-6 py-3 rounded-full border-none cursor-pointer transition-all duration-200 hover:bg-datum-surface hover:text-datum-ink disabled:opacity-50"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "..." : (settings?.newsletterBtnText || "Subscribe")}
                </button>
              </form>
              <div className="font-datum-mono text-[10.5px] tracking-[0.04em] text-datum-ink-faint mt-3">
                {settings?.newsletterNote || "Free. Unsubscribe anytime."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
