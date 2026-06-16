"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ScrollText, ArrowLeft } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const sections = [
  {
    title: "Acceptance of Terms",
    content: `By accessing or using PathFinder AI, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.

These terms apply to all visitors, users, and others who access or use PathFinder AI, including its AI-powered career tools, resume builder, cover letter generator, and interview preparation features.`,
  },
  {
    title: "Use of the Platform",
    content: `PathFinder AI is intended for personal, non-commercial career development use. You agree to use the platform only for lawful purposes and in a way that does not infringe the rights of others.

You must not misuse our services by knowingly introducing malicious content, attempting to gain unauthorized access to any part of the platform, or using automated tools to scrape or extract data without our written permission.`,
  },
  {
    title: "Account Responsibilities",
    content: `You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.

You must provide accurate, current, and complete information when creating your account. PathFinder AI reserves the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: "AI-Generated Content",
    content: `PathFinder AI uses artificial intelligence to generate resumes, cover letters, interview questions, and career advice. While we strive for accuracy and quality, AI-generated content may not always be perfect or suitable for every situation.

You are solely responsible for reviewing, editing, and using any AI-generated content. PathFinder AI makes no guarantees regarding the accuracy, completeness, or fitness for purpose of AI-generated outputs.`,
  },
  {
    title: "Intellectual Property",
    content: `The PathFinder AI platform, including its design, code, branding, and original content, is owned by Harsh Dwivedi and protected by applicable intellectual property laws.

Content you create using PathFinder AI — such as your resume or cover letter — belongs to you. By using our platform, you grant us a limited license to process your content solely to provide our services to you.`,
  },
  {
    title: "Prohibited Activities",
    content: `You may not use PathFinder AI to generate content that is fraudulent, misleading, defamatory, or violates any applicable law. This includes creating fake resumes, impersonating others, or generating content intended to deceive employers or third parties.

Reverse engineering, decompiling, or attempting to extract the source code of our platform is strictly prohibited.`,
  },
  {
    title: "Disclaimers & Limitation of Liability",
    content: `PathFinder AI is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the platform will be uninterrupted, error-free, or that it will meet your specific career goals.

To the fullest extent permitted by law, PathFinder AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.`,
  },
  {
    title: "Modifications to Terms",
    content: `We reserve the right to modify these Terms of Service at any time. We will notify users of significant changes via email or a notice on the platform. Continued use of PathFinder AI after changes take effect constitutes acceptance of the revised terms.`,
  },
];

export default function TermsOfServicePage() {
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
                <ScrollText className="h-8 w-8 text-primary" />
              </div>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-4"
            >
              Terms of Service
            </motion.h1>
            <motion.p variants={fadeUp} className="text-muted-foreground text-lg">
              Last updated: June 2026
            </motion.p>
            <motion.p variants={fadeUp} className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Please read these terms carefully before using PathFinder AI. By using our platform, you agree to be bound by these terms.
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
              <h2 className="text-xl font-semibold mb-2">Questions?</h2>
              <p className="text-muted-foreground mb-4">
                If you have any questions about these Terms of Service, contact us at:
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
