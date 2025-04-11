
import { Link, useLocation } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Save, Edit } from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
    icon: React.ElementType;
  }[];
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              location.pathname === item.href
                ? "bg-muted hover:bg-muted"
                : "hover:bg-transparent hover:underline",
              "justify-start"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

export const sidebarNavItems = [
  {
    title: "Generate Article",
    href: "/",
    icon: FileText,
  },
  {
    title: "Published Articles",
    href: "/saved-articles?tab=published",
    icon: Save,
  },
  {
    title: "Draft Articles",
    href: "/saved-articles?tab=draft",
    icon: Edit,
  },
];
