import React from "react";
import ProseRenderer from "@/components/public/ProseRenderer";

interface PostProseProps {
  content: string;
}

export default function PostProse({ content }: PostProseProps) {
  return (
    <div className="max-w-none text-text-secondary font-body text-[20px] leading-relaxed
      [&_p]:mb-6
      [&_h2]:font-display [&_h2]:text-text [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2
      [&_h3]:font-display [&_h3]:text-text [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-4
      [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
      [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:italic [&_blockquote]:bg-bg-secondary [&_blockquote]:px-6 [&_blockquote]:py-3 [&_blockquote]:my-6
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul_li]:mb-2
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol_li]:mb-2
      [&_img]:rounded-lg [&_img]:my-8 [&_img]:w-full [&_img]:object-contain
      [&_.ProseMirror]:outline-none [&_.ProseMirror]:!w-full [&_.ProseMirror]:!max-w-none [&_.ProseMirror]:!p-0 [&_.ProseMirror]:!min-h-0 [&_.ProseMirror]:!bg-transparent [&_.ProseMirror]:!shadow-none [&_.ProseMirror]:!filter-none"
    >
      <ProseRenderer content={content} />
    </div>
  );
}
