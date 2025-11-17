import { useEffect } from 'react';
import { ChatWidget } from '@/components/ChatWidget';

const WidgetOnly = () => {
  useEffect(() => {
    // Make background transparent for widget-only mode
    document.body.style.background = 'transparent';
    document.documentElement.style.background = 'transparent';
    
    return () => {
      // Restore default background when leaving
      document.body.style.background = '';
      document.documentElement.style.background = '';
    };
  }, []);

  // Return a positioned container for the ChatWidget to anchor to
  return (
    <>
      <div className="fixed inset-0 pointer-events-none" />
      <ChatWidget />
    </>
  );
};

export default WidgetOnly;
