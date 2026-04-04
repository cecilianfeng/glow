import * as pdfjsLib from 'pdfjs-dist';

// Point worker to the bundled worker script
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString();

/**
 * Extract text and images from a PDF file (ArrayBuffer or File).
 * Returns { title, text, images } where images are data URLs rendered from PDF pages.
 */
export async function extractFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const numPages = pdf.numPages;
  let fullText = '';
  const images = [];

  // Render first 3 pages as images (thumbnail-quality captures of PDF pages)
  const maxImagePages = Math.min(3, numPages);

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);

    // Extract text
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';

    // Render page to canvas → data URL (only first N pages)
    if (i <= maxImagePages) {
      try {
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        await page.render({ canvasContext: ctx, viewport }).promise;

        images.push({
          url: canvas.toDataURL('image/jpeg', 0.85),
          alt: `Page ${i}`,
          isPageRender: true,
          pageNum: i,
        });
      } catch (err) {
        console.warn(`Could not render PDF page ${i}:`, err);
      }
    }
  }

  // Get PDF metadata for title
  let title = file.name.replace(/\.pdf$/i, '');
  try {
    const meta = await pdf.getMetadata();
    if (meta?.info?.Title) title = meta.info.Title;
  } catch {}

  return {
    title,
    text: fullText.replace(/\s+/g, ' ').trim().slice(0, 8000),
    images,
    type: 'file',
    url: null,
  };
}
