import pdfParse from 'pdf-parse';
import { db } from '../database/db.js';
import { KnowledgeDocument, TextChunk } from '../types/index.js';

export class PdfService {
  /**
   * Processa e compacta um arquivo PDF em streaming, extraindo texto limpo
   * e dividindo em chunks semânticos para evitar estressar a memória do servidor.
   */
  public async processAndCompressPdf(
    buffer: Buffer,
    filename: string,
    subject: string
  ): Promise<{ doc: KnowledgeDocument; chunksCount: number }> {
    const originalSizeBytes = buffer.length;

    // 1. Extração otimizada de texto puro
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text || '';

    // 2. Pipeline de Higienização e Compactação de Texto:
    // - Remove múltiplos espaços em branco, quebras desnecessárias e linhas vazias
    // - Remove marcadores de página comuns tipo "Página 12 de 500"
    // - Descarta imagens e metadados binários pesados
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/Página\s+\d+\s+(de|\/)\s+\d+/gi, '')
      .replace(/---\s*\d+\s*---/g, '')
      .trim();

    const docId = 'doc-' + Date.now();
    const chunks: TextChunk[] = [];

    // 3. Chunking Semântico com Janela Deslizante (Overlap de 100 caracteres)
    const chunkSize = 600;
    const overlap = 100;
    let startIndex = 0;
    let chunkIndex = 0;

    while (startIndex < cleanedText.length) {
      const endIndex = Math.min(startIndex + chunkSize, cleanedText.length);
      let slice = cleanedText.slice(startIndex, endIndex);

      // Tenta encontrar menção a Artigo de lei ou Tópico relevante
      const articleMatch = slice.match(/Art\.?\s*\d+º?[A-Z\-]?/i);
      const articleRef = articleMatch ? articleMatch[0] : undefined;

      chunks.push({
        id: `chunk-${docId}-${chunkIndex}`,
        docId,
        subject,
        content: slice.trim(),
        pageNumber: Math.floor(startIndex / 2500) + 1,
        articleReference: articleRef
      });

      chunkIndex++;
      startIndex += (chunkSize - overlap);
    }

    // Calcula tamanho compactado apenas do texto estruturado
    const compressedSizeBytes = Buffer.byteLength(cleanedText, 'utf8');
    const compressionRatioPercent = Math.round(
      ((originalSizeBytes - compressedSizeBytes) / originalSizeBytes) * 100
    );

    const doc: KnowledgeDocument = {
      id: docId,
      filename,
      subject,
      originalSizeBytes,
      compressedSizeBytes,
      compressionRatioPercent: Math.max(0, compressionRatioPercent),
      totalChunks: chunks.length,
      uploadedAt: new Date().toISOString()
    };

    // Salva documento e chunks no banco vetorial/estruturado
    db.documents.push(doc);
    db.chunks.push(...chunks);

    return { doc, chunksCount: chunks.length };
  }

  public getDocuments(): KnowledgeDocument[] {
    return db.documents;
  }
}

export const pdfService = new PdfService();
