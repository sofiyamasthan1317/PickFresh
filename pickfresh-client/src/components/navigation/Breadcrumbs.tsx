import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
  const location = useLocation();
  const crumbs = location.pathname.split("/").filter(Boolean);

  if (crumbs.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-ink-500 dark:text-ink-100/50 font-medium">
      {crumbs.map((crumb, i) => {
        const path = `/${crumbs.slice(0, i + 1).join("/")}`;
        const isLast = i === crumbs.length - 1;

        return (
          <span key={crumb} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-400" />}
            {isLast ? (
              <span className="capitalize font-bold text-ink-950 dark:text-white">
                {crumb.replace(/-/g, " ")}
              </span>
            ) : (
              <Link to={path} className="hover:text-ink-950 dark:hover:text-white capitalize transition-colors">
                {crumb.replace(/-/g, " ")}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};
