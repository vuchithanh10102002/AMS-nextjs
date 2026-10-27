"use client";

import { useRef, useState } from "react";
import { Editor as TinyEditor } from "@tinymce/tinymce-react";
import type { Editor as TinyInstance } from "tinymce";
import { MediaPicker } from "./media-picker";
import { isImage } from "@/lib/media";

const SITE_PATH = process.env.NEXT_PUBLIC_SITE_PATH ?? "";

export function Editor({ name, defaultValue, height = 400 }: { name: string; defaultValue?: string; height?: number }) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [picker, setPicker] = useState(false);
  const editorRef = useRef<TinyInstance | null>(null);

  const insert = (paths: string[]) => {
    const html = paths
      .map((p) => {
        const url = `${SITE_PATH}/${p}`;
        return isImage(p) ? `<img src="${url}" alt="" />` : `<a href="${url}">${p.split("/").pop()}</a>`;
      })
      .join("");
    editorRef.current?.insertContent(html);
  };

  return (
    <>
      <input type="hidden" name={name} value={value} />
      <TinyEditor
        tinymceScriptSrc="/tinymce/tinymce.min.js"
        licenseKey="gpl"
        value={value}
        onEditorChange={setValue}
        onInit={(_, editor) => (editorRef.current = editor)}
        init={{
          height,
          menubar: "edit view insert format table tools",
          promotion: false,
          branding: false,
          language: undefined,
          plugins:
            "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table wordcount",
          toolbar:
            "undo redo | blocks fontsize lineheight | bold italic underline forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link library media table | removeformat code fullscreen",
          valid_elements: "*[*]",
          extended_valid_elements: "*[*]",
          valid_children: "+body[style],+a[div|p|h1|h2|h3|h4|h5|h6|img|span]",
          verify_html: false,
          convert_urls: false,
          relative_urls: false,
          document_base_url: typeof window === "undefined" ? undefined : `${location.origin}${process.env.NEXT_PUBLIC_SITE_PATH ?? ""}/`,
          image_advtab: true,
          content_style: "body{font-family:Inter,system-ui,sans-serif;font-size:15px} img{max-width:100%;height:auto}",
          setup: (editor) => {
            editor.ui.registry.addButton("library", {
              icon: "image",
              tooltip: "Chèn ảnh/file từ thư viện",
              onAction: () => setPicker(true),
            });
          },
        }}
      />
      <MediaPicker open={picker} onOpenChange={setPicker} onSelect={insert} multiple />
    </>
  );
}
