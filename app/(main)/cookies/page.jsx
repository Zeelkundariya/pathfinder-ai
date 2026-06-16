"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Cookie, ArrowLeft } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const cookieTypes = [
  {
    name: "Essential Cookies",
    required: true,
    description:
      "These cookies are necessary for PathFinder AI to function correctly. They enable core features like authentication, session management, and security. You cannot opt out of these cookies as the platform cannot operate without them.",
    examples: "Session tokens, CSRF protection, authentication state (Clerk)",
  },
  {
    name: "Functional Cookies",
    required: false,
    description:
      "Functional cookies remember your preferences and settings to provide a more personalized experience. For example, they remember your theme preference (dark/light mode) and onboarding state.",
    examples: "Theme preference, onboarding completion, language settings",
  },
  {
    name: "Analytics Cookies",
    required: false,
    description:
      "We use analytics cookies to understand how visitors interact with PathFinder AI. This helps us identify which features are most used, where users encounter issues, and how to improve the platform.",
    examples: "Page views, feature usage, session duration, error tracking",
  },
  {
    name: "Performance Cookies",
    required: false,
    description:
      "Performance cookies help us monitor and improve the speed and reliability of our platform. They collect anonymous data about load times, API response times, and rendering performance.",
    examples: "Load time tracking, API performance monitoring",
  },
];

const sections = [
  {
    title: "What Are Cookies?",
    content: `Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, remember your preferences, and provide information to site owners.

PathFinder AI uses cookies and similar technologies (such as local storage and session storage) to keep you signed in, remember your settings, and improve your overall experience.`,
  },
  {
    title: "How We Use Cookies",
    content: `We use cookies to authenticate users via Clerk (our auth provider), maintain your session across page navigations, store your UI preferences like dark mode, and collect anonymized analytics to improve the platform.

We do not use cookies to track you across other websites or serve third-party advertisements.`,
  },
  {
    title: "Managing Your Cookie Preferences",
    content: `You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies. However, blocking essential cookies will prevent PathFinder AI from functioning correctly and you may not be able to sign in.

To manage cookies in your browser:
• Chrome: Settings → Privacy & Security → Cookies
• Firefox: Settings → Privacy & Security → Cookies and Site Data
• Safari: Preferences → Privacy → Manage Website Data
• Edge: Settings → Cookies and Site Permissions`,
  },
  {
    title: "Third-Party Cookies",
    content: `Some features of PathFinder AI use third-party services that may set their own cookies. These include Clerk for authentication and analytics providers. These third parties have their own privacy policies and cookie practices.

We do not control third-party cookies and recommend reviewing the privacy policies of these services.`,
  },
  {
    title: "Updates to This Policy",
    content: `We may update this Cookies Policy from time to time as our platform evolves or regulations change. We will notify you of significant changes through the platform or via email.

Continued use of PathFinder AI after any updates constitutes your acceptance of the revised Cookies Policy.`,
  },
];

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 py-16 md:py-24">
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Cookie className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Cookies Policy
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
              Last updated: June 2026
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto">
              This policy explains how PathFinder AI uses cookies and similar technologies to provide and improve our services.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto space-y-16">

          {/* Cookie types table */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-2xl font-bold mb-6">
              Types of Cookies We Use
            </motion.h2>
            <div className="space-y-4">
              {cookieTypes.map((cookie, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="border border-border rounded-2xl p-6 bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">{cookie.name}</h3>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        cookie.required
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {cookie.required ? "Required" : "Optional"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    {cookie.description}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    <span className="font-medium text-muted-foreground">Examples: </span>
                    {cookie.examples}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sections */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="space-y-10"
          >
            {sections.map((section, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="border border-border rounded-2xl p-6 md:p-8 bg-card hover:border-primary/30 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  {section.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </motion.div>
            ))}

            {/* Contact */}
            <motion.div
              variants={fadeUp}
              className="border border-primary/30 rounded-2xl p-6 md:p-8 bg-primary/5 text-center"
            >
              <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
              <p className="text-muted-foreground mb-4">
                Questions about our use of cookies? Get in touch:
              </p>
              <a
                href="mailto:harshvardhandwivedi18@gmail.com"
                className="text-primary hover:underline font-medium"
              >
                harshvardhandwivedi18@gmail.com
              </a>
            </motion.div>

            {/* Back link */}
            <motion.div variants={fadeUp} className="flex justify-center pt-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
