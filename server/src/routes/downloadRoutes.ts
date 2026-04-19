import { Router } from 'express';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

const router = Router();

router.post('/docx', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const paragraphs = content.split('\n').map(line => {
      if (line.trim() === '') {
        return new Paragraph({ text: '' });
      }
      if (line.match(/^[A-Z][A-Z\s]+$/)) {
        return new Paragraph({
          children: [new TextRun({ text: line.trim(), bold: true, size: 28 })],
          heading: HeadingLevel.HEADING_1,
        });
      }
      if (line.match(/^\d{4}/) || line.match(/^[A-Z][a-z]+, [A-Z][a-z]+,/)) {
        return new Paragraph({
          children: [new TextRun({ text: line.trim(), bold: true, size: 22 })],
        });
      }
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        return new Paragraph({
          text: line.trim(),
          bullet: { level: 0 },
        });
      }
      return new Paragraph({
        children: [new TextRun({ text: line.trim(), size: 20 })],
      });
    });

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'resume'}.docx"`);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

router.post('/pdf', async (req, res) => {
  try {
    const { content, filename } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const PDFDocument = (await import('pdfkit')).default;
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename || 'resume'}.pdf"`);
        res.send(pdfBuffer);
        resolve(true);
      });
      doc.on('error', reject);

      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.trim() === '') {
          doc.moveDown(0.5);
        } else if (line.match(/^[A-Z][A-Z\s]+$/) || line.length < 30) {
          doc.fontSize(14).fillColor('black').text(line, { align: 'center' });
          doc.moveDown(0.5);
        } else {
          doc.fontSize(10).fillColor('black').text(line, {
            align: 'left',
            lineGap: 2,
          });
        }
      });

      doc.end();
    });
  } catch (error) {
    res.status(500).json({ success: false, error: String(error) });
  }
});

export default router;