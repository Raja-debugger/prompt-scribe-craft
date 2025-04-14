
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import ProfileSection from "./ProfileSection";
import { FileText, Save, PenSquare, Headphones, MessageSquareText } from "lucide-react";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuList, NavigationMenuTrigger } from "./ui/navigation-menu";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">
              MindCMS
            </span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Articles</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px]">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        to="/"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      >
                        <PenSquare className="h-6 w-6 mb-2" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Generate New Article
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Create a new AI-powered article
                        </p>
                      </Link>
                      <Link
                        to="/saved-articles"
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      >
                        <Save className="h-6 w-6 mb-2" />
                        <div className="mb-2 mt-4 text-lg font-medium">
                          Saved Articles
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          View your published and draft articles
                        </p>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400" id="summary-button">
              <MessageSquareText className="h-4 w-4 mr-2" />
              Summarize
            </Button>
            <Button variant="ghost" size="sm" className="text-green-600 dark:text-green-400" id="voiceover-button">
              <Headphones className="h-4 w-4 mr-2" />
              Voice Over
            </Button>
            <Link to="/saved-articles">
              <Button variant="ghost" size="sm">
                <Save className="h-4 w-4 mr-2" />
                My Articles
              </Button>
            </Link>
            {isAuthenticated ? (
              <ProfileSection size="compact" className="shadow-sm" />
            ) : (
              <>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
