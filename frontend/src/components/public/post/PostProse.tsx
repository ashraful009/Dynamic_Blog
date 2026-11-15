import React from "react";
import ProseRenderer from "@/components/public/ProseRenderer";

interface PostProseProps {
  content: string;
}

export default function PostProse({ content }: PostProseProps) {
  return (
    <div className="flow-root max-w-none text-body font-body text-lead leading-relaxed
      [&_p]:mb-6
      [&_h2]:font-display [&_h2]:text-heading [&_h2]:text-3xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-line [&_h2]:pb-2
      [&_h3]:font-display [&_h3]:text-heading [&_h3]:text-2xl [&_h3]:mt-8 [&_h3]:mb-4
      [&_h4]:font-display [&_h4]:text-heading [&_h4]:text-xl [&_h4]:mt-6 [&_h4]:mb-3
      [&_a]:text-link [&_a]:no-underline hover:[&_a]:text-link-hover hover:[&_a]:underline
      [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:italic [&_blockquote]:bg-surface-2 [&_blockquote]:px-6 [&_blockquote]:py-3 [&_blockquote]:my-6
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul_li]:mb-2
      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol_li]:mb-2
      [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
      [&_pre]:p-4 [&_pre]:rounded-card [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre_code]:p-0 [&_pre_code]:bg-transparent
      [&_mark]:px-1 [&_mark]:rounded
      [&_sub]:text-xs [&_sub]:align-sub [&_sup]:text-xs [&_sup]:align-super
      [&_hr]:my-8 [&_hr]:border-line
      [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto [&_table]:my-6 [&_table]:border-collapse
      [&_th]:border [&_th]:border-line [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
      [&_td]:border [&_td]:border-line [&_td]:px-3 [&_td]:py-2
      [&_video]:rounded-card [&_video]:my-8 [&_video]:max-w-full max-sm:[&_video[data-float='left']]:!float-none max-sm:[&_video[data-float='right']]:!float-none max-sm:[&_video[data-float='left']]:!w-full max-sm:[&_video[data-float='right']]:!w-full max-sm:[&_video[data-float='left']]:!mx-0 max-sm:[&_video[data-float='right']]:!mx-0
      [&_img]:rounded-card [&_img]:my-8 [&_img]:max-w-full [&_img:not([data-width])]:w-full [&_img:not([data-aspect-ratio])]:object-contain [&_img[data-aspect-ratio='16/9']]:aspect-video [&_img[data-aspect-ratio='16/9']]:object-cover max-sm:[&_img[data-float='left']]:!float-none max-sm:[&_img[data-float='right']]:!float-none max-sm:[&_img[data-float='left']]:!w-full max-sm:[&_img[data-float='right']]:!w-full max-sm:[&_img[data-float='left']]:!mx-0 max-sm:[&_img[data-float='right']]:!mx-0
      [&_.pdf-embed]:w-full [&_.pdf-embed]:max-w-full [&_.pdf-embed]:my-8
      [&_.yt-embed]:max-w-full [&_.yt-embed]:rounded-card max-sm:[&_.yt-embed[data-float='left']]:!float-none max-sm:[&_.yt-embed[data-float='right']]:!float-none max-sm:[&_.yt-embed[data-float='left']]:!w-full max-sm:[&_.yt-embed[data-float='right']]:!w-full max-sm:[&_.yt-embed[data-float='left']]:!mx-0 max-sm:[&_.yt-embed[data-float='right']]:!mx-0"
    >
      <ProseRenderer content={content} />
    </div>
  );
}
