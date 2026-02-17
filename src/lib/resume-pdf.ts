'use client';

import { ResumeData } from '@/types/resume';

export async function generateResumePDF(data: ResumeData, addWatermark: boolean): Promise<void> {
  const html2canvas = (await import('html2canvas-pro')).default;
  const { jsPDF } = await import('jspdf');

  const el = document.getElementById('resume-preview');
  if (!el) return;

  // Temporarily reset scale for capture
  const parent = el.parentElement;
  const origTransform = el.style.transform;
  const origWidth = el.style.width;
  el.style.transform = 'scale(1)';
  el.style.width = '794px';

  // If in mobile modal, we need the element visible
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    width: 794,
    windowWidth: 794,
  });

  el.style.transform = origTransform;
  el.style.width = origWidth;

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = 210;
  const pdfHeight = 297;

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = pdfWidth / (imgWidth / 2); // scale 2
  const scaledHeight = (imgHeight / 2) * ratio;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(scaledHeight, pdfHeight));

  if (addWatermark) {
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text('Built with SheruTools — sherutools.com', pdfWidth / 2, pdfHeight - 5, { align: 'center' });
  }

  const name = data.personal.fullName || 'resume';
  pdf.save(`${name.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`);
}
