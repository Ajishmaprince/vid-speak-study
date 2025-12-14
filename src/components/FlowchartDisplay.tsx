import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface FlowchartDisplayProps {
  mermaidCode: string;
  description?: string;
}

export const FlowchartDisplay = ({ mermaidCode, description }: FlowchartDisplayProps) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    const renderDiagram = async () => {
      if (!mermaidCode) return;
      
      setError(null);
      
      try {
        mermaid.initialize({ 
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
        });

        // Clean the mermaid code - remove any extra whitespace or invalid chars
        const cleanCode = mermaidCode
          .trim()
          .replace(/```mermaid/g, '')
          .replace(/```/g, '')
          .trim();

        const uniqueId = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, cleanCode);
        setSvgContent(svg);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Failed to render flowchart");
      }
    };

    renderDiagram();
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
        {error ? (
          <div className="text-destructive text-sm p-4 bg-destructive/10 rounded-lg">
            <p className="font-medium">Failed to render flowchart</p>
            <p className="text-xs mt-1 opacity-75">{error}</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs">View raw code</summary>
              <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap bg-muted p-2 rounded">
                {mermaidCode}
              </pre>
            </details>
          </div>
        ) : (
          <div 
            ref={mermaidRef} 
            className="flex justify-center"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}
      </div>
    </div>
  );
};
