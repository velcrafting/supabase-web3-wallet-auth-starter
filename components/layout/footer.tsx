// footer.tsx
import Link from "next/link";
import { siteConfig } from "@/lib/config";

const Footer = () => {
  return (
    <footer className="w-full border-t h-8 flex-shrink-0">
      <div className="container mx-auto h-full flex items-center gap-2 sm:gap-6 px-4 lg:px-6">
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {siteConfig.copyright}
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
