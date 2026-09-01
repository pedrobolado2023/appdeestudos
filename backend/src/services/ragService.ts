import { db } from '../database/db.js';
import { TextChunk } from '../types/index.js';

export class RagService {
  /**
   * Busca os trechos mais relevantes do material carregado com base na consulta
   * Utiliza busca semântica de relevância por termos-chave e referências legais.
   */
  public searchRelevantChunks(query: string, subject?: string, limit: number = 3): TextChunk[] {
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(t => t.length > 2);

    let candidates = db.chunks;
    if (subject) {
      candidates = candidates.filter(c => c.subject.toLowerCase().includes(subject.toLowerCase()));
    }

    if (candidates.length === 0) {
      candidates = db.chunks;
    }

    const scored = candidates.map(chunk => {
      const contentLower = chunk.content.toLowerCase();
      let score = 0;

      terms.forEach(term => {
        if (contentLower.includes(term)) {
          score += 1;
        }
      });

      // Bônus se houver referência ao artigo da lei
      if (chunk.articleReference && query.toLowerCase().includes(chunk.articleReference.toLowerCase())) {
        score += 3;
      }

      return { chunk, score };
    });

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(item => item.chunk);
  }
}

export const ragService = new RagService();
