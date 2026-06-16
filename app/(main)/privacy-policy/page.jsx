"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const sections = [
  {
    title: "Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, use our AI-powered tools, or contact us for support. This includes your name, email address, career information, resume data, and any other content you submit through our platform.

We also automatically collect certain information when you use PathFinder AI, including log data, device information, and usage analytics to improve your experience.`,
  },
  {
    title: "How We Use Your Information",
    content: `We use the information we collect to provide, maintain, and improve our services — including generating AI-powered resumes, cover letters, and interview preparation content personalized to you.

Your data helps us understand how our platform is used, detect and prevent fraudulent or abusive activity, and communicate with you about updates, features, and support.`,
  },
  {
    title: "AI & Data Processing",
    content: `PathFinder AI uses Google's Gemini API to power its AI features. When you use AI features, relevant portions of your input are processed through these services to generate responses. We do not use your personal career data to train third-party AI models without your explicit consent.

All AI-generated content is produced for your personal use and is not shared with other users.`,
  },
  {
    title: "Data Storage & Security",
    content: `Your data is stored securely using industry-standard encryption. We use PostgreSQL databases hosted on trusted cloud providers, and all data transmission is encrypted via HTTPS.

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.`,
  },
  {
    title: "Sharing Your Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only with service providers who assist us in operating our platform (such as authentication and database providers), or when required by law.

All third-party service providers are bound by confidentiality agreements and are only permitted to use your data as necessary to provide services to us.`,
  },
  {
    title: "Your Rights & Choices",
    content: `You have the right to access, correct, or delete your personal information at any time through your account settings. You may also request a copy of your data or ask us to restrict its processing.

You can opt out of non-essential communications at any time. If you wish to delete your account and all associated data, please contact us at the email below.`,
  },
  {
    title: "Cookies & Tracking",
    content: `We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and analyze platform usage. Essential cookies are required for the platform to function; others are optional.

You can manage your cookie preferences through your browser settings. For more details, see our Cookies Policy.`,
  },
  {
    title: "Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of PathFinder AI after changes become effective constitutes your acceptance of the updated policy.`,
  },
];

export default function PrivacyPolicyPage() {
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
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Privacy Policy
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
              Last updated: June 2026
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto">
              At PathFinder AI, your privacy matters. This policy explains what data we collect, how we use it, and the choices you have.
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto">
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
                  {i + 1}. {section.title}
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
                If you have any questions about this Privacy Policy, please reach out:
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
