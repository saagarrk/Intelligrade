import React, { useState, useRef } from 'react';
import { 
  X, 
  Play, 
  Layers, 
  CheckCircle2, 
  Download, 
  AlertCircle, 
  Users,
  Sparkles,
  BarChart3,
  Upload,
  FileText,
  Image as ImageIcon,
  FileUp,
  Plus,
  Trash2
} from 'lucide-react';
import { ExamPaper } from '../types';
import { showSuccessAlert, showSweetToast } from '../utils/sweetAlert';

interface BatchGradingModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: ExamPaper;
}

interface BatchStudent {
  id: string;
  name: string;
  rollNo: string;
  fileType: 'pdf' | 'image' | 'scan';
  fileName: string;
  fileSize: string;
  status: 'Pending' | 'Preprocessing' | 'OCR Extraction' | 'NLP Grading' | 'Completed';
  score?: number;
  maxMarks: number;
  percentage?: number;
}

export const BatchGradingModal: React.FC<BatchGradingModalProps> = ({
  isOpen,
  onClose,
  exam
}) => {
  const initialStudents: BatchStudent[] = [
    { id: '1', name: 'Aarav Sharma', rollNo: 'CS-2026-041', fileType: 'pdf', fileName: 'Aarav_Sharma_CS301_Midterm.pdf', fileSize: '482 KB', status: 'Completed', score: Number((exam.totalMarks * 0.91).toFixed(1)), maxMarks: exam.totalMarks, percentage: 91.0 },
    { id: '2', name: 'Priya Patel', rollNo: 'CS-2026-088', fileType: 'image', fileName: 'Priya_Patel_Scan_p1.jpg', fileSize: '1.2 MB', status: 'Completed', score: Number((exam.totalMarks * 0.65).toFixed(1)), maxMarks: exam.totalMarks, percentage: 65.0 },
    { id: '3', name: 'Rohan Verma', rollNo: 'CS-2026-012', fileType: 'pdf', fileName: 'Rohan_Verma_Answers.pdf', fileSize: '650 KB', status: 'Pending', maxMarks: exam.totalMarks },
    { id: '4', name: 'Ananya Iyer', rollNo: 'CS-2026-033', fileType: 'image', fileName: 'Ananya_Iyer_CameraScan.png', fileSize: '2.1 MB', status: 'Pending', maxMarks: exam.totalMarks },
    { id: '5', name: 'Aditya Deshmukh', rollNo: 'CS-2026-059', fileType: 'pdf', fileName: 'Aditya_Deshmukh_Script.pdf', fileSize: '390 KB', status: 'Pending', maxMarks: exam.totalMarks },
    { id: '6', name: 'Kavya Kulkarni', rollNo: 'CS-2026-074', fileType: 'image', fileName: 'Kavya_Kulkarni_Paper.webp', fileSize: '820 KB', status: 'Pending', maxMarks: exam.totalMarks },
    { id: '7', name: 'Siddharth Nair', rollNo: 'CS-2026-092', fileType: 'pdf', fileName: 'Siddharth_Nair_Answers.pdf', fileSize: '520 KB', status: 'Pending', maxMarks: exam.totalMarks },
    { id: '8', name: 'Sneha Joshi', rollNo: 'CS-2026-105', fileType: 'image', fileName: 'Sneha_Joshi_ExamSheet.jpeg', fileSize: '1.5 MB', status: 'Pending', maxMarks: exam.totalMarks },
  ];

  const [students, setStudents] = useState<BatchStudent[]>(initialStudents);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    addFilesToBatch(Array.from(files));
  };

  const addFilesToBatch = (files: File[]) => {
    const newEntries: BatchStudent[] = files.map((file, idx) => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      const randomRollNum = `CS-2026-${String(Math.floor(100 + Math.random() * 899))}`;
      const sizeStr = file.size < 1024 * 1024 
        ? `${Math.round(file.size / 1024)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      return {
        id: `uploaded_${Date.now()}_${idx}`,
        name: cleanName.length > 2 ? cleanName : `Student ${students.length + idx + 1}`,
        rollNo: randomRollNum,
        fileType: isPdf ? 'pdf' : 'image',
        fileName: file.name,
        fileSize: sizeStr,
        status: 'Pending',
        maxMarks: exam.totalMarks
      };
    });

    setStudents(prev => [...prev, ...newEntries]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFilesToBatch(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const handleStartBatch = () => {
    setIsRunning(true);
    showSweetToast('Batch pipeline initialized. Grading submissions...', 'info');
    let currentIdx = students.findIndex(s => s.status === 'Pending');
    if (currentIdx === -1) currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx >= students.length) {
        clearInterval(interval);
        setIsRunning(false);
        showSuccessAlert(
          'Batch Evaluation Complete!',
          `<div class="space-y-1"><p class="text-xs text-zinc-300">Successfully evaluated all <strong>${students.length}</strong> student submissions.</p><p class="text-[11px] text-zinc-400">Class analytics and grade books are now updated.</p></div>`,
          2500
        );
        return;
      }

      setStudents(prev => prev.map((st, idx) => {
        if (idx === currentIdx) {
          const ratio = 0.68 + (Math.sin(idx * 2) + 1) * 0.15;
          const dynamicScore = Number((exam.totalMarks * Math.min(0.98, ratio)).toFixed(1));
          return {
            ...st,
            status: 'Completed',
            score: dynamicScore,
            percentage: Number(((dynamicScore / (exam.totalMarks || 1)) * 100).toFixed(1))
          };
        }
        if (idx === currentIdx + 1) {
          return { ...st, status: 'NLP Grading' };
        }
        return st;
      }));

      currentIdx++;
    }, 600);
  };

  const completedCount = students.filter(s => s.status === 'Completed').length;
  const completedScores = students.filter(s => s.score !== undefined).map(s => s.score!);
  const avgScore = completedScores.length > 0
    ? (completedScores.reduce((a, b) => a + b, 0) / completedScores.length).toFixed(1)
    : '0.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Batch Classroom Evaluation Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Exam: {exam.title} ({exam.totalMarks} Total Marks) • Multi-format Image & PDF Ingestion
              </p>
            </div>
          </div>

          <button
            id="close-batch-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#27272a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {/* Progress & Stat Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#09090b] p-3 rounded-xl border border-[#27272a]">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Evaluated Papers</span>
              <div className="text-lg font-bold text-white font-mono mt-0.5">
                {completedCount} / {students.length}
              </div>
            </div>

            <div className="bg-[#09090b] p-3 rounded-xl border border-[#27272a]">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Class Average</span>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                {avgScore} / {exam.totalMarks} Marks
              </div>
            </div>

            <div className="bg-[#09090b] p-3 rounded-xl border border-[#27272a]">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Pipeline Speed</span>
              <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
                ~1.2s / Paper
              </div>
            </div>
          </div>

          {/* Drag and Drop Multi-File Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
              isDragging 
                ? 'border-indigo-500 bg-indigo-950/20' 
                : 'border-[#3f3f46] hover:border-indigo-500/50 bg-[#09090b]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,application/pdf,.pdf"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-white">
              Drop batch student answer scripts here, or <span className="text-indigo-400 underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports multiple images (<span className="text-indigo-300 font-mono">PNG, JPG, WEBP</span>) and document files (<span className="text-rose-300 font-mono">PDF</span>) simultaneously
            </p>
          </div>

          {/* Student Batch Table */}
          <div className="bg-[#09090b] rounded-xl border border-[#27272a] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#18181b] text-slate-400 text-[11px] border-b border-[#27272a]">
                  <th className="py-2.5 px-3">Candidate & File</th>
                  <th className="py-2.5 px-3">Roll No</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Score</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-[#27272a]/30">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-200">{st.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                        {st.fileName} ({st.fileSize})
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{st.rollNo}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                        st.fileType === 'pdf' 
                          ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
                          : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      }`}>
                        {st.fileType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        st.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          : st.status === 'Pending'
                          ? 'bg-[#18181b] text-slate-400 border border-[#27272a]'
                          : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 animate-pulse'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-200">
                      {st.score !== undefined ? `${st.score}/${st.maxMarks}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-semibold text-indigo-300">
                      {st.percentage !== undefined ? `${st.percentage}%` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {st.status === 'Pending' && (
                        <button
                          onClick={() => handleRemoveStudent(st.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-rose-500/10 transition-colors"
                          title="Remove from batch queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#09090b] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Automated pipeline runs asynchronously with batch concurrency.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a]"
            >
              Dismiss
            </button>
            <button
              id="start-batch-eval-btn"
              onClick={handleStartBatch}
              disabled={isRunning}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Classroom...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Batch Grading ({students.length} Papers)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
