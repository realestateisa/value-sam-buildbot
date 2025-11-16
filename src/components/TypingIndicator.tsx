const TypingIndicator = () => {
  return (
    <div className="flex items-start gap-2 mb-4">
      <div className="bg-muted rounded-lg p-3 max-w-[80px]">
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
