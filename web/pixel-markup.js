// Keep the SVG envelope for existing layout and accessibility, but let the
// browser cache a single image instead of hundreds of DOM rectangles per sprite.
export function pixelMarkup(html) {
  return html.replace(
    /<svg\b([^>]*\bdata-pixel-art="[^"]+"[^>]*)>([\s\S]*?)<\/svg>/g,
    (whole, attributes, body) => {
      if (
        attributes.includes('data-pixel-art="icon"') ||
        body.includes("<image ")
      )
        return whole;
      const box = attributes.match(/viewBox="([^\"]+)"/);
      if (!box) return whole;
      const [, , width, height] = box[1].split(/\s+/).map(Number);
      const light = body.match(/<g data-light-art="[^"]+"\/>/)?.[0] || "";
      return `<svg${attributes}><image width="${width}" height="${height}" href="data:image/svg+xml;charset=utf-8,${encodeURIComponent(whole)}"/>${light}</svg>`;
    },
  );
}
