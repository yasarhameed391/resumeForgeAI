declare module 'swagger-ui-express';
declare module 'swagger-jsdoc';
declare module 'pdf-parse';
declare module 'docx';
declare module 'pdfkit';

declare module 'mammoth' {
  export function extractRawText(options: { buffer: Buffer }): Promise<{ value: string }>;
  export function extractFullText(options: { buffer: Buffer }): Promise<{ value: string }>;
}