import { describe, expect, it } from "vitest";
import { toContentHtml } from "./rich-text-editor-html";

const P = '<p class="mb-2 last:mb-0">';
const SPAN = '<span style="white-space: pre-wrap;">';

describe("toContentHtml", () => {
  it("unwraps a single paragraph to its text", () => {
    expect(
      toContentHtml(`${P}${SPAN}Want to see what Frends can do for your institution?</span></p>`)
    ).toBe("Want to see what Frends can do for your institution?");
  });

  it("drops dir and text-align that Lexical adds to paragraphs", () => {
    expect(
      toContentHtml(`<p class="mb-2 last:mb-0" dir="ltr" style="text-align: center;">${SPAN}Hi</span></p>`)
    ).toBe("Hi");
  });

  it("keeps dir=rtl so right-to-left content still renders correctly", () => {
    expect(toContentHtml(`<p class="mb-2 last:mb-0" dir="rtl">${SPAN}שלום</span></p>`)).toBe(
      '<p dir="rtl">שלום</p>'
    );
    expect(
      toContentHtml(
        `<p class="mb-2 last:mb-0" dir="rtl">${SPAN}مرحبا</span></p>` +
          `<p class="mb-2 last:mb-0" dir="ltr">${SPAN}Hello</span></p>`
      )
    ).toBe('<p dir="rtl">مرحبا</p><p>Hello</p>');
  });

  it("keeps formatting wrappers but drops the theme classes on their spans", () => {
    expect(
      toContentHtml(
        `${P}<b><span class="font-bold" style="white-space: pre-wrap;">H</span></b>` +
          `<sub style="white-space: pre-wrap;">2</sub>${SPAN}O is </span>` +
          `<u><i><span class="italic underline" style="white-space: pre-wrap;">2x</span></i></u>` +
          `${SPAN} faster</span></p>`
      )
    ).toBe("<b>H</b><sub>2</sub>O is <u><i>2x</i></u> faster");
  });

  it("keeps soft line breaks and bare paragraph boundaries", () => {
    expect(
      toContentHtml(
        `${P}${SPAN}Line one</span><br>${SPAN}still one</span></p>` +
          `${P}<br></p>` +
          `${P}${SPAN}Line two</span></p>`
      )
    ).toBe("<p>Line one<br>still one</p><p><br></p><p>Line two</p>");
  });

  it("drops empty paragraphs at either end", () => {
    expect(toContentHtml(`${P}<br></p>${P}${SPAN}Hello</span></p>${P}<br></p>`)).toBe("Hello");
  });

  it("treats a paragraph holding only empty formatting wrappers as empty", () => {
    expect(toContentHtml(`${P}<b><span class="font-bold"></span></b></p>${P}${SPAN}Hello</span></p>`)).toBe(
      "Hello"
    );
  });

  it("returns an empty string for an empty editor", () => {
    expect(toContentHtml(`${P}<br></p>`)).toBe("");
  });

  it("preserves entities", () => {
    expect(toContentHtml(`${P}${SPAN}R&amp;D &lt;fast&gt;</span></p>`)).toBe("R&amp;D &lt;fast&gt;");
  });
});
