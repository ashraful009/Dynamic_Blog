
interface ProseRendererProps {
  content: string;
}
export default function ProseRenderer({ content }: ProseRendererProps) {
  return (
    <div
      className="ProseMirror"
      style={{
        padding: 0,
        minHeight: "auto",
        outline: "none",
        color: "var(--text-primary)",
      }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
