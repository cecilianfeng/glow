import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportElementAsPng(element, filename = 'glow-export.png') {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export async function exportElementsAsPdf(elements, filename = 'glow-carousel.pdf') {
  if (!elements.length) return;

  const firstCanvas = await html2canvas(elements[0], {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const imgWidth = 210; // A4 width in mm
  const imgHeight = (firstCanvas.height / firstCanvas.width) * imgWidth;

  const pdf = new jsPDF({
    orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [imgWidth, imgHeight],
  });

  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    if (i > 0) {
      pdf.addPage([imgWidth, imgHeight]);
    }

    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
  }

  pdf.save(filename);
}

export async function exportElementsAsZip(elements, prefix = 'slide') {
  // Export each element as individual PNG download
  for (let i = 0; i < elements.length; i++) {
    const canvas = await html2canvas(elements[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    const link = document.createElement('a');
    link.download = `${prefix}-${i + 1}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Small delay between downloads
    await new Promise(r => setTimeout(r, 200));
  }
}
