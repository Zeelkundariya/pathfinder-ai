import Link from "next/link";

export default function DashboardFooter() {
  return (
    <footer className="border-t border-border/30 mt-12 md:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground/50">
          <p>&copy; {new Date().getFullYear()} PathFinder AI. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy-policy" className="hover:text-muted-foreground/80 transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="hover:text-muted-foreground/80 transition-colors">
              Terms
            </Link>
            <Link href="/help" className="hover:text-muted-foreground/80 transition-colors">
              Help
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
