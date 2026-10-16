"use client";

import { useCallback, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $insertNodes,
  type LexicalEditor,
  EditorState,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  $createTextNode,
} from "lexical";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { cn } from "@skeleton/core-utils";
import { toContentHtml } from "./rich-text-editor-html";
import { Bold, Italic, Underline, Strikethrough } from "lucide-react";
import { Button } from "../ui/button";
import { useTranslation } from "@skeleton/core-translations";

const theme = {
  paragraph: "mb-2 last:mb-0",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "line-through",
  },
};

function onError(error: Error) {
  console.error(error);
}

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation();

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
  }, [editor]);

  const formatStrikethrough = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
  }, [editor]);

  return (
    <div className="border-input flex gap-1 border-b p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatBold}
        className="h-8 w-8 p-0"
        aria-label={t('components.richTextEditor.bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatItalic}
        className="h-8 w-8 p-0"
        aria-label={t('components.richTextEditor.italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatUnderline}
        className="h-8 w-8 p-0"
        aria-label={t('components.richTextEditor.underline')}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={formatStrikethrough}
        className="h-8 w-8 p-0"
        aria-label={t('components.richTextEditor.strikethrough')}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
    </div>
  );
}

type InitialValuePluginProps = {
  initialValue?: string;
};

function InitialValuePlugin({ initialValue }: InitialValuePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialValue) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        const parser = new DOMParser();
        const dom = parser.parseFromString(initialValue, "text/html");
        const nodes = $generateNodesFromDOM(editor, dom);

        if (nodes.length > 0) {
          $insertNodes(nodes);
        } else {
          const paragraph = $createParagraphNode();
          paragraph.append($createTextNode(initialValue));
          root.append(paragraph);
        }
      });
    }
  }, [editor, initialValue]);

  return null;
}

export type RichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  actions?: React.ReactNode;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder: placeholderProp,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
  actions,
}: RichTextEditorProps) {
  const { t } = useTranslation();
  const placeholder = placeholderProp ?? t("components.richTextEditor.placeholder");
  const initialConfig = {
    namespace: "RichTextEditor",
    theme,
    onError,
    editable: !disabled,
  };

  const handleChange = useCallback(
    (editorState: EditorState, editor: LexicalEditor) => {
      editorState.read(() => {
        // Hand consumers the content, not Lexical's wrapper markup (see toContentHtml).
        onChange?.(toContentHtml($generateHtmlFromNodes(editor)));
      });
    },
    [onChange]
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div
        id={id}
        data-disabled={disabled}
        aria-invalid={ariaInvalid}
        className={cn(
          "border-input bg-input-background overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
          className
        )}
      >
        <ToolbarPlugin />
        <div className="relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={cn(
                  "text-foreground min-h-[120px] bg-transparent px-3 py-2 text-sm outline-none"
                )}
                aria-placeholder={placeholder}
                placeholder={
                  <div className="text-muted-foreground pointer-events-none absolute top-0 left-3 pt-2 text-sm">
                    {placeholder}
                  </div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <InitialValuePlugin initialValue={value} />
        {actions && (
          <div className="flex items-center justify-end px-3 pb-3 pt-1.5">
            {actions}
          </div>
        )}
      </div>
    </LexicalComposer>
  );
}
