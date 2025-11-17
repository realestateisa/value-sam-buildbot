import logo from '@/assets/logo.png';

const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2 mb-3 animate-fade-in">
      <div className="flex-shrink-0">
        <img src={logo} alt="Sam" className="h-9 w-9 rounded-full bg-white p-0.5 animate-pulse" />
      </div>
      <div className="bg-muted rounded-lg p-3 shadow-sm">
        <div className="flex items-center space-x-1">
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
          <span className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
