const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2 mb-3">
      <div className="bg-muted rounded-lg p-2.5 max-w-[70px]">
        <div className="flex items-center space-x-0.5">
          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
          <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
