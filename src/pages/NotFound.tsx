import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">Oops! This page doesn't exist</p>
        <p className="mb-8 text-muted-foreground">The gift you're looking for might be elsewhere</p>
        <a 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-primary text-primary-foreground rounded-lg hover:shadow-glow transition-smooth font-semibold"
        >
          Return to Amour
        </a>
      </div>
    </div>
  );
};

export default NotFound;
