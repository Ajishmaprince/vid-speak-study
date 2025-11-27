import { useEffect, useRef } from "react";
import mermaid from "mermaid";

interface FlowchartDisplayProps {
  mermaidCode: string;
  description?: string;
}

export const FlowchartDisplay = ({ mermaidCode, description }: FlowchartDisplayProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current && mermaidCode) {
      mermaid.initialize({ 
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
      });
      
      mermaidRef.current.innerHTML = mermaidCode;
      mermaid.contentLoaded();
    }
  }, [mermaidCode]);

  if (!mermaidCode) {
    return null;
  }

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      <div className="overflow-x-auto bg-background p-4 rounded-lg border">
        <div ref={mermaidRef} className="mermaid" />
      </div>
    </div>
  );
};
