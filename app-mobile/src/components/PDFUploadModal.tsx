import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle, Zap, HardDrive, AlertCircle, X } from 'lucide-react';
import { KnowledgeDocument } from '../types';
import { api } from '../services/api';

interface PDFUploadModalProps {
  onClose: () => void;
}

export const PDFUploadModal: React.FC<PDFUploadModalProps> = ({ onClose }) => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [subject, setSubject] = useState('Direito Constitucional');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const loadDocuments = async () => {
    try {
      const data = await api.getDocuments();
      setDocuments(data.documents);
      setTotalChunks(data.totalChunks);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setUploadSuccess(null);

    try {
      const res = await api.uploadPdf(file, subject);
      setUploadSuccess(`PDF processado com sucesso! Redução de ${res.document.compressionRatioPercent}% no tamanho do arquivo.`);
      setFile(null);
      loadDocuments();
    } catch (err: any) {
      alert('Erro ao enviar arquivo: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-black text-white">Central de PDFs & RAG Local</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Alimente o servidor com apostilas e editais em PDF. O sistema <strong>compacta o texto e descarta arquivos pesados</strong>, gerando questões fiéis sem estressar a memória do servidor.
        </p>

        {/* Formulário de Envio */}
        <form onSubmit={handleUpload} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Disciplina / Matéria</label>
            <input
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
              placeholder="Ex: Direito Administrativo - Lei 8.112"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Arquivo PDF de Estudo</label>
            <input
              type="file"
              accept=".pdf"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30"
              required
            />
          </div>

          {uploadSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-3 text-xs flex items-center justify-center gap-2 ${
              uploading || !file ? 'btn-duo-slate opacity-50 cursor-not-allowed' : 'btn-duo-green'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>{uploading ? 'Compactando e Vetorizando...' : 'COMPACTAR E ALIMENTAR RAG'}</span>
          </button>
        </form>

        {/* Lista de Documentos Ingeridos */}
        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
            Documentos Otimizados no Servidor ({documents.length})
          </h4>
          <div className="space-y-2">
            {documents.length === 0 ? (
              <div className="text-center py-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500">
                Nenhum PDF carregado ainda.
              </div>
            ) : (
              documents.map(doc => (
                <div key={doc.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-200 truncate">{doc.filename}</p>
                      <p className="text-[10px] text-slate-500">{doc.subject} • {doc.totalChunks} chunks</p>
                    </div>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                    -{doc.compressionRatioPercent}% tam
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
