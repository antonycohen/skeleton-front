/**
 * Reduces the HTML Lexical exports from the rich-text editor to the user's content.
 *
 * `$generateHtmlFromNodes` serializes the editor's own presentation along with the content:
 * every paragraph as `<p class="mb-2 last:mb-0" [dir] [style="text-align: …"]>`, every text run
 * as `<span style="white-space: pre-wrap;">`, formatting as `<b>/<i>/<s>/<u>` wrappers whose span
 * carries the theme classes (`font-bold`, `italic`, `underline`, `line-through`), and an empty
 * paragraph as `<p><br></p>`. None of that is the user's edit, and the backend merge treats it as
 * noise to strip — or, in the LLM path, as something the model must not copy into the page.
 *
 * This keeps only the content: text, the formatting wrappers (`<b>`, `<i>`, `<s>`, `<u>`,
 * `<code>`, `<sub>`, `<sup>`, `<mark>`), `<br>` line breaks, and bare `<p>` boundaries when the
 * user typed more than one paragraph. A single paragraph is unwrapped to its inner HTML, and an
 * empty editor yields an empty string. `dir="rtl"` is the one attribute kept, since the target page
 * cannot infer it once the editor markup is gone.
 */
export function toContentHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const body = doc.body;

  for (const element of Array.from(body.querySelectorAll("*"))) {
    element.removeAttribute("class");
    element.removeAttribute("style");
    // Lexical stamps every paragraph with its detected direction. `ltr` is the default and pure
    // noise; `rtl` is the only signal the target page cannot recover on its own, so it is kept.
    if (element.getAttribute("dir") !== "rtl") {
      element.removeAttribute("dir");
    }
  }

  // Lexical's text-run spans carry nothing once their style is gone: unwrap them.
  for (const span of Array.from(body.querySelectorAll("span"))) {
    if (span.attributes.length === 0) {
      span.replaceWith(...Array.from(span.childNodes));
    }
  }

  const paragraphs = Array.from(body.children).filter((el) => el.tagName === "P");
  const onlyParagraphs =
    paragraphs.length > 0 && paragraphs.length === body.children.length;

  if (onlyParagraphs) {
    // Trailing/leading empty paragraphs (<p><br></p>) carry nothing.
    while (paragraphs.length > 0 && isEmptyParagraph(paragraphs[paragraphs.length - 1])) {
      paragraphs.pop()?.remove();
    }
    while (paragraphs.length > 0 && isEmptyParagraph(paragraphs[0])) {
      paragraphs.shift()?.remove();
    }
    if (paragraphs.length === 0) {
      return "";
    }
    // A single bare paragraph is unwrapped; one that still carries a `dir="rtl"` keeps its
    // wrapper, otherwise the direction would be lost.
    if (paragraphs.length === 1 && paragraphs[0].attributes.length === 0) {
      return paragraphs[0].innerHTML.trim();
    }
  }

  return body.innerHTML.trim();
}

/**
 * `<p><br></p>`, `<p></p>`, or a paragraph whose only children are empty formatting wrappers
 * (`<p><b></b></p>`): nothing the user typed.
 */
function isEmptyParagraph(paragraph: Element): boolean {
  return (paragraph.textContent ?? "").trim() === "";
}
