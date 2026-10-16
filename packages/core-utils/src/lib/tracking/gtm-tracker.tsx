import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: any;
  }
}

if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
}

export const useInitGTM = (containerId: string) => {
  useEffect(() => {
    // Main script
    const w: any = window;
    const d: Document = document;
    const s = "script";
    const l = "dataLayer";
    const i = containerId;

    w[l] = w[l] || [];
    w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    const f: HTMLElement = d.getElementsByTagName(s)[0];
    const script: HTMLScriptElement = d.createElement(s) as HTMLScriptElement;
    const dl: string = l !== "dataLayer" ? "&l=" + l : "";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;

    if (f && f.parentNode) {
      f.parentNode.insertBefore(script, f);
    } else {
      d.head.appendChild(script);
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [containerId]);

  useEffect(() => {
    const d: Document = document;
    const body: HTMLElement | null = d.querySelector("body");

    if (!body) {
      return;
    }

    const noscript: HTMLIFrameElement = d.createElement("iframe");
    noscript.src = `https://www.googletagmanager.com/ns.html?id=${containerId}`;
    noscript.height = "0";
    noscript.width = "0";
    noscript.style.display = "none";
    noscript.style.visibility = "hidden";

    const noscriptContainer: HTMLDivElement = d.createElement("div");
    noscriptContainer.appendChild(noscript);

    if (body.firstChild) {
      body.insertBefore(noscriptContainer, body.firstChild);
    } else {
      body.appendChild(noscriptContainer);
    }

    return () => {
      if (noscriptContainer.parentNode) {
        noscriptContainer.parentNode.removeChild(noscriptContainer);
      }
    };
  }, [containerId]);
};

export const gtmTrackEvent = (
  name: string,
  properties?: Record<string, any>,
) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: name,
      ...properties,
    });
  }
};
