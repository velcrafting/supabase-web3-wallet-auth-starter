// footer.tsx
import Link from "next/link";
import { Github, Twitter, GlobeIcon } from "lucide-react";
import { siteConfig } from "@/lib/config";

const Footer = () => {
  return (
    <footer className="w-full border-t h-12 flex-shrink-0">
      <div className="container mx-auto h-full flex items-center justify-between px-4 lg:px-6">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {siteConfig.footerMessage}
        </p>
        <div className="flex items-center gap-4 text-neutral-500 dark:text-neutral-400">
          <Link
            href={siteConfig.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4 hover:text-neutral-900 dark:hover:text-neutral-50" />
          </Link>
          <Link
            href={siteConfig.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
          >
            <Twitter className="h-4 w-4 hover:text-neutral-900 dark:hover:text-neutral-50" />
          </Link>
          <Link
            href={siteConfig.social.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Website"
          >
            <GlobeIcon className="h-4 w-4 hover:text-neutral-900 dark:hover:text-neutral-50" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;