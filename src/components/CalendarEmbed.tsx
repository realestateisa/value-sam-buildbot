import { useRef, useLayoutEffect, useState } from "react";
import { TERRITORIES } from "@/types/chat";

interface CalendarEmbedProps {
  territory: string;
  onError?: (error: string) => void;
  onLoaded?: () => void;
}

export const CalendarEmbed = ({ territory, onError, onLoaded }: CalendarEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);

  // Load Cal.com script
  useLayoutEffect(() => {
    const w = window as any;

    // Ensure Cal stub exists
    if (!w.Cal) {
      const Cal = function (...args: any[]) {
        (Cal as any).q = (Cal as any).q || [];
        (Cal as any).q.push(args);
      } as any;
      Cal.ns = {};
      w.Cal = Cal;
    }

    // Load CSS
    if (!document.querySelector('link[href="https://app.cal.com/embed/embed.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://app.cal.com/embed/embed.css";
      document.head.appendChild(link);
    }

    // Load JS
    const existingScript = document.querySelector('script[src="https://app.cal.com/embed/embed.js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://app.cal.com/embed/embed.js";
      script.async = true;
      script.onload = () => setScriptReady(true);
      script.onerror = () => {
        console.error("Failed to load Cal.com script");
        onError?.("Failed to load calendar");
      };
      document.head.appendChild(script);
    } else {
      // Script already exists
      if (w.Cal && typeof w.Cal === 'function' && w.Cal.ns) {
        setScriptReady(true);
      } else {
        existingScript.addEventListener('load', () => setScriptReady(true), { once: true });
      }
    }
  }, [onError]);

  // Initialize Cal.com after script and container are ready
  useLayoutEffect(() => {
    if (!scriptReady || !containerRef.current) return;

    const w = window as any;
    const territoryConfig = Object.values(TERRITORIES).find(t => t.calNamespace === territory);
    
    if (!territoryConfig) {
      console.error("Territory not found:", territory);
      onError?.("Invalid territory");
      return;
    }

    // Clear container
    containerRef.current.innerHTML = "";

    try {
      // Initialize Cal.com with namespace
      w.Cal("init", territoryConfig.calNamespace, {
        origin: "https://app.cal.com"
      });

      // Configure UI
      w.Cal("ui", {
        hideEventTypeDetails: true,
        layout: "month_view",
        styles: {
          branding: {
            brandColor: "#000000"
          }
        }
      });

      // Render inline calendar - pass actual element, not selector
      w.Cal("inline", {
        namespace: territoryConfig.calNamespace,
        elementOrSelector: containerRef.current,
        calLink: territoryConfig.calLink,
        config: {
          theme: "light"
        }
      });

      onLoaded?.();
    } catch (error) {
      console.error("Cal.com initialization error:", error);
      onError?.("Failed to initialize calendar");
    }
  }, [scriptReady, territory, onError, onLoaded]);

  return (
    <div 
      ref={containerRef} 
      id={`cal-inline-${territory}`}
      className="flex-1 w-full overflow-auto"
    />
  );
};
