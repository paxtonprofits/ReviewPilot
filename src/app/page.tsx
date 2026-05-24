import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "ReviewPilot — AI-Powered Google Review Responses",
  description: "ReviewPilot generates professional responses to every Google review. You approve in one tap. It posts automatically. $49/month per location.",
};

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[#0a1f35] text-white">
      {/* Nav */}
      <nav className="border-b border-white/[0.07] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight">ReviewPilot</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#pricing" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Pricing</a>
            <a href="#faq" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">FAQ</a>
            {isLoggedIn ? (
              <Link href="/dashboard" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Dashboard →
              </Link>
            ) : (
              <Link href="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-20">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/6 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              AI-powered · Approved by you · Posted automatically
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold leading-[1.08] tracking-tight mb-6">
              Every Google review,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                responded to automatically.
              </span>
            </h1>

            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              ReviewPilot generates professional AI responses to every review. You approve in one tap. It posts under your name — automatically.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-7 py-3.5 rounded-xl transition-all duration-150 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/25 text-[15px]"
              >
                Start free trial — no card needed
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto text-slate-300 hover:text-white font-medium px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-150 text-[15px] text-center"
              >
                See how it works →
              </a>
            </div>
            <p className="text-slate-600 text-xs mt-4">7-day free trial · $49/month after · Cancel anytime</p>
          </div>

          {/* Product mockup */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#0f2d4a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
              {/* Mockup header */}
              <div className="border-b border-white/[0.06] px-5 py-3.5 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                <span className="text-slate-500 text-xs ml-2">ReviewPilot — New review</span>
              </div>

              {/* Review card */}
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">S</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-semibold">Sarah M.</span>
                      <span className="text-yellow-400 text-xs">★★★★★</span>
                      <span className="text-slate-500 text-xs">2 hours ago</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">"Absolutely love this place. Best service I've had in years. Will definitely be coming back!"</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2.5">
                    <div className="w-4 h-4 bg-indigo-500 rounded flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <span className="text-indigo-300 text-xs font-semibold">AI Response Draft</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">"Thank you so much, Sarah! We're thrilled you had such a wonderful experience. Your kind words mean the world to our team, and we can't wait to welcome you back soon!"</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2.5 pt-1">
                  <button className="flex-1 bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl">
                    ✓ Approve &amp; Post
                  </button>
                  <button className="px-4 text-slate-400 text-sm font-medium border border-white/10 rounded-xl">
                    Edit
                  </button>
                  <button className="px-4 text-slate-400 text-sm font-medium border border-white/10 rounded-xl">
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Up and running in minutes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Connect your Google Business Profile",
                desc: "Sign in with Google and authorize ReviewPilot to monitor your reviews. Takes 60 seconds.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                ),
              },
              {
                step: "02",
                title: "AI drafts every response instantly",
                desc: "New review comes in — ReviewPilot reads it and writes a professional, personalized response in seconds.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                ),
              },
              {
                step: "03",
                title: "Approve in one tap — it posts automatically",
                desc: "You get a notification, read the draft, and tap approve. Nothing goes live without your sign-off.",
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
              },
            ].map((item) => (
              <div key={item.step} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-7 hover:border-indigo-500/30 transition-colors duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-indigo-500/50 font-bold text-xs tracking-widest">{item.step}</span>
                  <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {item.icon}
                    </svg>
                  </div>
                </div>
                <h3 className="font-semibold text-white text-[15px] mb-2 leading-snug">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need,<br />nothing you don&apos;t</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "AI-generated responses", desc: "Every review gets a professional, personalized response — written by AI, sounding like you." },
              { title: "One-tap approval", desc: "Nothing posts without your sign-off. Edit, regenerate, or approve in seconds from any device." },
              { title: "Auto-post after approval", desc: "Once you approve, ReviewPilot posts the response directly to Google. Zero copy-paste." },
              { title: "Review monitoring", desc: "We check your Google Business Profile every 15 minutes and notify you the moment a new review lands." },
              { title: "Multi-location support", desc: "Manage reviews across multiple locations from one dashboard. Each location billed separately." },
              { title: "Email notifications", desc: "Get an email the moment a new review comes in with the AI draft ready to approve." },
            ].map((f) => (
              <div key={f.title} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-indigo-500/20 transition-colors duration-300">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mb-4" />
                <h3 className="font-semibold text-white text-[14px] mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, transparent pricing</h2>
            <p className="text-slate-400 mt-3 text-base">One plan. Everything included. Cancel anytime.</p>
          </div>

          <div className="max-w-sm mx-auto">
            <div className="bg-gradient-to-b from-indigo-500/20 to-indigo-500/5 border border-indigo-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative">
                <p className="text-indigo-300 text-sm font-semibold mb-1">Per location</p>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-6xl font-bold text-white">$49</span>
                  <span className="text-slate-400 text-base mb-2">/month</span>
                </div>
                <p className="text-slate-500 text-xs mb-8">7-day free trial · No credit card required</p>

                <div className="space-y-3 text-left mb-8">
                  {[
                    "AI-generated responses for every review",
                    "One-tap approval flow",
                    "Auto-post to Google",
                    "Review monitoring every 15 min",
                    "Email notifications",
                    "Multi-location support",
                    "Cancel anytime",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-slate-300 text-sm">{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/login"
                  className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-150 hover:scale-[1.02] text-[15px]"
                >
                  Start free trial
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Common questions</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Does anything post without my approval?",
                a: "Never. Every response goes through you first. You can approve, edit, regenerate, or dismiss any response. ReviewPilot never posts anything automatically without your explicit sign-off.",
              },
              {
                q: "What Google Business Profile access do you need?",
                a: "We use Google's official OAuth. You authorize ReviewPilot to read your reviews and post responses. You can revoke access at any time from your Google account settings.",
              },
              {
                q: "How long does the free trial last?",
                a: "7 days, no credit card required. You get full access to everything. After the trial, it's $49/month per location.",
              },
              {
                q: "What if I have multiple locations?",
                a: "Each location is $49/month and managed from one dashboard. You can add and remove locations anytime.",
              },
              {
                q: "Can I edit the AI-generated responses?",
                a: "Yes — you can edit any response before approving, or hit regenerate to get a completely different draft. The AI takes another pass every time.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 hover:border-indigo-500/20 transition-colors duration-300">
                <h3 className="font-semibold text-white text-[14px] mb-2">{item.q}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-24 border-t border-white/[0.05]">
        <div className="max-w-2xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-indigo-600/8 rounded-3xl blur-3xl pointer-events-none" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Stop leaving reviews unanswered.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed mb-8 max-w-md mx-auto">
              Every unanswered review is a potential customer choosing someone else. ReviewPilot fixes that in 60 seconds.
            </p>
            <Link
              href="/login"
              className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-150 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/25 text-[15px]"
            >
              Start your free trial today
            </Link>
            <p className="text-slate-600 text-xs mt-4">7 days free · No credit card · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-slate-400 text-sm font-medium">ReviewPilot</span>
          </div>
          <p className="text-slate-600 text-xs">© 2026 ReviewPilot. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/login" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Sign in</Link>
            <a href="mailto:paxtoncool10@gmail.com" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
