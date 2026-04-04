/**
 * Extract text and page-render images from a PDF file.
 * pdfjs-dist is imported dynamically inside the function — never at module
 * init time — so it cannot crash the React app on initial load.
 */
export async function extractFromPdf(file) {
  // Dynamic import keeps pdfjs out of the initial bundle / module graph
  const pdfjsLib = await import('pdfjs-dist');

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const numPages = pdf.numPages;
  let fullText = '';
  const images = [];
  const maxImagePages = Math.min(3, numPages);

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);

    const textContent = await page.getTextContent();
    fullText += textContent.items.map(item => item.str).join(' ') + '\n';

    if (i <= maxImagePages) {
      try {
        const viewport = page.getViewport({ scale: 1.2 });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
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
