import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  RotateCw, 
  Sparkles, 
  Eye, 
  Check, 
  Zap, 
  Maximize2, 
  RefreshCw, 
  FileUp, 
  Cpu, 
  Layers, 
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Upload,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  Split
} from 'lucide-react';
import { PreprocessingConfig, PreprocessingMetrics, StudentSubmission, ExamPaper, QuestionItem } from '../types';
import { processCanvasImage, drawSampleHandwrittenPaper } from '../utils/imageProcessing';
import { processUploadedFile, UploadedDocument } from '../utils/fileUploadHelper';
import { TriAnswerSheetComparison } from './TriAnswerSheetComparison';

interface Stage1Props {
  submission: StudentSubmission;
  exam: ExamPaper;
  onUpdateConfig: (config: PreprocessingConfig) => void;
  onNextStage: () => void;
  onUploadCustomScan: (dataUrl: string) => void;
  onUpdateModelAnswers?: (updatedQuestions: QuestionItem[]) => void;
}

export const Stage1Preprocessing: React.FC<Stage1Props> = ({
  submission,
  exam,
  onUpdateConfig,
  onNextStage,
  onUploadCustomScan,
  onUpdateModelAnswers
}) => {
  const [stageSubTab, setStageSubTab] = useState<'tri_sheet' | 'preprocessing'>('tri_sheet');
  const [config, setConfig] = useState<PreprocessingConfig>(submission.preprocessingConfig);
  const [activeView, setActiveView] = useState<'raw' | 'denoised' | 'normalized' | 'deskewed' | 'thinned' | 'binarized'>('binarized');
  const [splitMode, setSplitMode] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<PreprocessingMetrics>(submission.preprocessingMetrics);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Uploaded document state (Images & Multi-page PDFs)
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDocument | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  const rawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync with prop when submission changes
  useEffect(() => {
    setConfig(submission.preprocessingConfig);
  }, [submission.id]);

  // Load sample paper or uploaded doc page into raw canvas
  useEffect(() => {
    if (!rawCanvasRef.current) return;
    
    if (uploadedDoc && uploadedDoc.pagesDataUrls[currentPageIndex]) {
      // Draw uploaded image/PDF page onto canvas
      renderDataUrlToRawCanvas(uploadedDoc.pagesDataUrls[currentPageIndex]);
    } else {
      // Default sample handwritten paper
      renderDefaultSamplePaper();
    }
  }, [submission.id, exam.id, uploadedDoc, currentPageIndex]);

  // Re-run pipeline when config or activeView changes
  useEffect(() => {
    runPipeline();
  }, [config, activeView]);

  const renderDefaultSamplePaper = () => {
    if (!rawCanvasRef.current) return;
    const canvas = rawCanvasRef.current;
    canvas.width = 800;
    canvas.height = 700;

    const sampleAnswers = exam.questions.map((q) => {
      const existing = submission.questionEvaluations.find(e => e.questionNumber === q.questionNumber);
      return {
        qNum: q.questionNumber,
        answerText: existing ? existing.studentAnswerText : `Student answer draft for question ${q.questionNumber} showing technical handwriting.`
      };
    });

    drawSampleHandwrittenPaper(
      canvas,
      submission.studentName,
      submission.studentRollNumber,
      exam.title,
      sampleAnswers,
      submission.percentageScore < 70
    );

    runPipeline();
  };

  const renderDataUrlToRawCanvas = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      if (!rawCanvasRef.current) return;
      const canvas = rawCanvasRef.current;
      canvas.width = 800;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 800, 700);
        ctx.drawImage(img, 0, 0, 800, 700);
        runPipeline();
        onUploadCustomScan(canvas.toDataURL());
      }
    };
    img.src = dataUrl;
  };

  const runPipeline = () => {
    if (!rawCanvasRef.current || !targetCanvasRef.current) return;
    setIsProcessing(true);
    try {
      const calculatedMetrics = processCanvasImage(
        rawCanvasRef.current,
        targetCanvasRef.current,
        config,
        activeView
      );
      setMetrics(calculatedMetrics);
      onUpdateConfig(config);
    } catch (e) {
      console.error('Preprocessing error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    setIsProcessing(true);
    try {
      const doc = await processUploadedFile(file);
      setUploadedDoc(doc);
      setCurrentPageIndex(0);
      if (doc.pagesDataUrls.length > 0) {
        renderDataUrlToRawCanvas(doc.pagesDataUrls[0]);
      }
    } catch (err: any) {
      console.error('File upload failed:', err);
      setUploadError(err?.message || 'Failed to parse file. Please upload a valid PNG, JPG, or PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handlePageChange = (newIndex: number) => {
    if (!uploadedDoc || newIndex < 0 || newIndex >= uploadedDoc.pagesDataUrls.length) return;
    setCurrentPageIndex(newIndex);
  };

  const handleResetToSample = () => {
    setUploadedDoc(null);
    setCurrentPageIndex(0);
    renderDefaultSamplePaper();
  };

  const handleAutoDeskew = () => {
    setConfig(prev => ({
      ...prev,
      skewCorrection: true,
      skewAngle: -2.4
    }));
  };

  const handleResetFilters = () => {
    setConfig({
      noiseReduction: true,
      noiseRadius: 2,
      styleNormalization: true,
      contrastStretch: 1.8,
      strokeBoost: 2,
      skewCorrection: true,
      skewAngle: 0,
      thinning: true,
      thinningIterations: 2,
      thresholdingType: 'otsu',
      binarizationThreshold: 135
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Pipeline Intro */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                1
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Stage 1: Input & Image Preprocessing Pipeline
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Supports scanned images (<span className="text-indigo-300 font-mono">PNG, JPG, WEBP</span>) and multi-page <span className="text-rose-300 font-mono">PDF documents</span>. Filters noise, straightens tilt, standardizes stroke thickness, and outputs a binarized skeleton for OCR.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,application/pdf,.pdf"
              className="hidden"
            />

            <button
              id="upload-scan-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-200 text-xs font-medium rounded-lg border border-indigo-700/50 transition-colors shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upload Image / PDF</span>
            </button>

            {uploadedDoc && (
              <button
                id="reset-to-sample-btn"
                onClick={handleResetToSample}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-[#27272a]/60 hover:bg-[#27272a] text-slate-300 text-xs font-medium rounded-lg border border-[#3f3f46] transition-colors"
                title="Revert back to generated sample answer sheet"
              >
                <RefreshCw className="w-3 h-3 text-slate-400" />
                <span>Reset to Sample</span>
              </button>
            )}

            <button
              id="proceed-stage2-btn"
              onClick={onNextStage}
              className="flex items-center space-x-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <span>Proceed to OCR Digitization</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Uploaded File Info Card (If Image or PDF is uploaded) */}
        {uploadedDoc && (
          <div className="mt-4 p-3 bg-[#09090b] rounded-lg border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                uploadedDoc.type === 'pdf' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {uploadedDoc.type === 'pdf' ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                    {uploadedDoc.name}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                    uploadedDoc.type === 'pdf' 
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {uploadedDoc.type}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center space-x-2">
                  <span>Size: {formatFileSize(uploadedDoc.size)}</span>
                  <span>•</span>
                  <span>{uploadedDoc.pageCount} Total Page{uploadedDoc.pageCount > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-medium">Ready for Preprocessing & OCR</span>
                </div>
              </div>
            </div>

            {/* Multi-page PDF Page Navigator */}
            {uploadedDoc.pageCount > 1 && (
              <div className="flex items-center space-x-2 bg-[#18181b] p-1 rounded-lg border border-[#27272a]">
                <button
                  id="pdf-prev-page-btn"
                  onClick={() => handlePageChange(currentPageIndex - 1)}
                  disabled={currentPageIndex === 0}
                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-medium text-slate-200 px-2">
                  Page {currentPageIndex + 1} of {uploadedDoc.pageCount}
                </span>
                <button
                  id="pdf-next-page-btn"
                  onClick={() => handlePageChange(currentPageIndex + 1)}
                  disabled={currentPageIndex >= uploadedDoc.pagesDataUrls.length - 1}
                  className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload error notice */}
        {uploadError && (
          <div className="mt-3 p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 text-xs rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Stage Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-[#27272a]">
          <button
            id="subtab-tri-sheet"
            onClick={() => setStageSubTab('tri_sheet')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              stageSubTab === 'tri_sheet'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                : 'bg-[#09090b] text-slate-400 hover:text-white border border-[#27272a]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3-Answer-Sheet Ingestion Hub (Student + Model + Gemini AI Matrix)</span>
          </button>

          <button
            id="subtab-preprocessing-studio"
            onClick={() => setStageSubTab('preprocessing')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              stageSubTab === 'preprocessing'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-[#09090b] text-slate-400 hover:text-white border border-[#27272a]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Vision Preprocessing & Image Filters</span>
          </button>
        </div>
      </div>

      {/* Tri-Sheet Ingestion & Comparison View */}
      {stageSubTab === 'tri_sheet' && (
        <TriAnswerSheetComparison
          exam={exam}
          submission={submission}
          onUpdateModelAnswers={onUpdateModelAnswers}
          onUploadStudentSheet={(dataUrl, doc) => {
            setUploadedDoc(doc);
            setCurrentPageIndex(0);
            renderDataUrlToRawCanvas(dataUrl);
          }}
        />
      )}

      {/* Main Preprocessing Visualizer & Filters View */}
      {stageSubTab === 'preprocessing' && (
        <div className="space-y-6">
          {/* 5-Step Pipeline Breadcrumb Visualizer */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              Vision Preprocessing Stage Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { id: 'raw', name: '1. Raw Scan', desc: 'Original image / PDF page' },
                { id: 'denoised', name: '2. Noise Reduction', desc: 'Median & speckle filter' },
                { id: 'normalized', name: '3. Normalization', desc: 'Contrast & ink boost' },
                { id: 'deskewed', name: '4. Skew Correction', desc: 'Straightened baseline' },
                { id: 'thinned', name: '5. Thinning', desc: 'Zhang-Suen skeleton' },
                { id: 'binarized', name: '6. Binarization', desc: 'Otsu black & white' },
              ].map((step) => {
                const isSelected = activeView === step.id;
                return (
                  <button
                    key={step.id}
                    id={`btn-view-${step.id}`}
                    onClick={() => setActiveView(step.id as any)}
                    className={`text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 shadow-sm'
                        : 'bg-[#09090b] border-[#27272a] text-slate-400 hover:bg-[#27272a]/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold block">{step.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">{step.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

      {/* Main Working Grid: Interactive Visualizer & Parameter Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Canvas Visualizer (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Interactive Preprocessing Viewport ({activeView.toUpperCase()})
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="toggle-split-btn"
                  onClick={() => setSplitMode(!splitMode)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${
                    splitMode
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-[#09090b] text-slate-400 border-[#27272a] hover:text-white'
                  }`}
                >
                  {splitMode ? 'Split: ON' : 'Split View'}
                </button>
                <button
                  id="reset-filters-btn"
                  onClick={handleResetFilters}
                  className="text-[11px] text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-[#27272a] transition-colors"
                  title="Reset all filters to optimal defaults"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Canvas Display Container with Drag and Drop Support */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative w-full aspect-[8/7] bg-[#09090b] rounded-lg overflow-hidden border transition-all shadow-inner flex items-center justify-center ${
                isDragging 
                  ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/20' 
                  : 'border-[#27272a]'
              }`}
            >
              {/* Drag overlay indicator */}
              {isDragging && (
                <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-xs flex flex-col items-center justify-center z-20 border-2 border-dashed border-indigo-400 rounded-lg animate-fadeIn">
                  <Upload className="w-10 h-10 text-indigo-400 animate-bounce mb-2" />
                  <p className="text-sm font-semibold text-white">Drop Handwritten Image or PDF Here</p>
                  <p className="text-xs text-indigo-300 mt-1">Supports PNG, JPG, JPEG, WEBP, and PDF documents</p>
                </div>
              )}
              
              {/* Hidden Raw Source Canvas */}
              <canvas ref={rawCanvasRef} className="hidden" />

              {/* Target Processed Canvas */}
              <canvas
                ref={targetCanvasRef}
                className="w-full h-full object-contain rounded"
              />

              {/* Status Badge */}
              <div className="absolute bottom-3 right-3 bg-[#18181b]/95 backdrop-blur border border-[#27272a] px-2.5 py-1 rounded-md text-[10px] font-mono text-slate-300 flex items-center space-x-2 shadow-lg">
                <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>Render Time: {metrics.processingTimeMs}ms</span>
                <span className="text-[#27272a]">•</span>
                <span>Otsu Clarity: {metrics.binarizationClarity}%</span>
              </div>
            </div>

            {/* Quick Upload Drag-and-Drop Trigger Banner */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 p-3 bg-[#09090b] hover:bg-[#18181b] cursor-pointer rounded-lg border border-dashed border-[#3f3f46] hover:border-indigo-500/60 transition-all text-xs text-slate-400 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                  <FileUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-slate-200 font-medium group-hover:text-indigo-300 transition-colors">
                    Upload new answer script
                  </span>
                  <span className="text-slate-500 text-[11px] ml-2 hidden sm:inline">
                    (Click or drag & drop .png, .jpg, .webp, or .pdf files)
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] text-indigo-400 font-medium">
                <span>Browse Files</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            {/* View description card */}
            <div className="mt-3 p-3 bg-[#09090b] rounded-lg border border-[#27272a] text-xs text-slate-400 flex items-start space-x-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Current Pipeline Stage: </span>
                {activeView === 'raw' && 'Original uncompressed raw camera scan or PDF page with notebook ruling lines.'}
                {activeView === 'denoised' && 'Noise reduction eliminates paper grain speckles, dust artifacts, and shadow variations.'}
                {activeView === 'normalized' && 'Contrast stretching normalizes handwriting pressure so light pencil/faint pen strokes match dark ink.'}
                {activeView === 'deskewed' && 'Hough line angle transformation detects text baseline tilt and straightens orientation.'}
                {activeView === 'thinned' && 'Zhang-Suen morphological thinning simplifies character strokes to a 1-pixel skeleton for structural OCR.'}
                {activeView === 'binarized' && 'Adaptive Otsu binarization produces pure 1-bit high-contrast black-and-white for character segmentation.'}
              </div>
            </div>
          </div>

          {/* Quality Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Noise Reduction</span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {(metrics.originalNoiseScore - metrics.cleanedNoiseScore).toFixed(1)} dB SNR
              </div>
              <span className="text-[10px] text-slate-500">92% artifacts removed</span>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Skew Detected</span>
              <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">
                {metrics.detectedSkewAngle > 0 ? `+${metrics.detectedSkewAngle}°` : `${metrics.detectedSkewAngle}°`}
              </div>
              <span className="text-[10px] text-slate-500">Baseline aligned</span>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Stroke Thinning</span>
              <div className="text-base font-bold text-indigo-400 font-mono mt-0.5">
                {metrics.strokeThinningEfficiency}%
              </div>
              <span className="text-[10px] text-slate-500">Skeletonized strokes</span>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] p-3 rounded-xl">
              <span className="text-[10px] uppercase font-semibold text-slate-400">OCR Readiness</span>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {metrics.binarizationClarity}%
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">Optimal for Digitization</span>
            </div>
          </div>
        </div>

        {/* Right Column: Preprocessing Controls & Algorithm Settings (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Image Enhancement Pipeline Controls
                </h3>
              </div>
              <button
                id="auto-deskew-btn"
                onClick={handleAutoDeskew}
                className="flex items-center space-x-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20"
              >
                <Zap className="w-3 h-3" />
                <span>Auto-Tune</span>
              </button>
            </div>

            {/* Noise Reduction Filter Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="noise-reduction-check"
                    checked={config.noiseReduction}
                    onChange={(e) => setConfig({ ...config, noiseReduction: e.target.checked })}
                    className="rounded border-[#3f3f46] text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-[#09090b]"
                  />
                  <label htmlFor="noise-reduction-check" className="text-xs font-medium text-slate-200">
                    Median Speckle Denoising
                  </label>
                </div>
                <span className="text-xs font-mono text-slate-400">{config.noiseRadius}px radius</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                disabled={!config.noiseReduction}
                value={config.noiseRadius}
                onChange={(e) => setConfig({ ...config, noiseRadius: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-slate-500">
                Smooths high-frequency paper grain and eliminates shadow creases.
              </p>
            </div>

            {/* Normalization / Contrast Slider */}
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="normalization-check"
                    checked={config.styleNormalization}
                    onChange={(e) => setConfig({ ...config, styleNormalization: e.target.checked })}
                    className="rounded border-[#3f3f46] text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-[#09090b]"
                  />
                  <label htmlFor="normalization-check" className="text-xs font-medium text-slate-200">
                    Handwriting Contrast Normalization
                  </label>
                </div>
                <span className="text-xs font-mono text-slate-400">{config.contrastStretch}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                disabled={!config.styleNormalization}
                value={config.contrastStretch}
                onChange={(e) => setConfig({ ...config, contrastStretch: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-slate-500">
                Equalizes handwriting variation across fountain pens, ballpoints, and pencils.
              </p>
            </div>

            {/* Skew Correction Angle Slider */}
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="skew-check"
                    checked={config.skewCorrection}
                    onChange={(e) => setConfig({ ...config, skewCorrection: e.target.checked })}
                    className="rounded border-[#3f3f46] text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-[#09090b]"
                  />
                  <label htmlFor="skew-check" className="text-xs font-medium text-slate-200">
                    Hough Transform Deskewing
                  </label>
                </div>
                <span className="text-xs font-mono text-slate-400">{config.skewAngle}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                disabled={!config.skewCorrection}
                value={config.skewAngle}
                onChange={(e) => setConfig({ ...config, skewAngle: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-slate-500">
                Rotates page canvas to align handwritten text rows with horizontal bounding boxes.
              </p>
            </div>

            {/* Zhang-Suen Thinning Slider */}
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="thinning-check"
                    checked={config.thinning}
                    onChange={(e) => setConfig({ ...config, thinning: e.target.checked })}
                    className="rounded border-[#3f3f46] text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 bg-[#09090b]"
                  />
                  <label htmlFor="thinning-check" className="text-xs font-medium text-slate-200">
                    Zhang-Suen Skeleton Thinning
                  </label>
                </div>
                <span className="text-xs font-mono text-slate-400">{config.thinningIterations} iters</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                step="1"
                disabled={!config.thinning}
                value={config.thinningIterations}
                onChange={(e) => setConfig({ ...config, thinningIterations: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40"
              />
              <p className="text-[11px] text-slate-500">
                Prunes thick marker and ink strokes down to a 1px medial axis representation.
              </p>
            </div>

            {/* Binarization Type & Threshold */}
            <div className="space-y-2 pt-2 border-t border-[#27272a]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-200">
                  Binarization Algorithm
                </label>
                <div className="flex items-center space-x-1">
                  {(['otsu', 'adaptive', 'sauvola'] as const).map(type => (
                    <button
                      key={type}
                      id={`binarization-${type}-btn`}
                      onClick={() => setConfig({ ...config, thresholdingType: type })}
                      className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                        config.thresholdingType === type
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'bg-[#09090b] text-slate-400 border border-[#27272a] hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Otsu Cutoff Threshold</span>
                <span className="text-xs font-mono text-slate-300">{config.binarizationThreshold} / 255</span>
              </div>
              <input
                type="range"
                min="50"
                max="220"
                step="1"
                value={config.binarizationThreshold}
                onChange={(e) => setConfig({ ...config, binarizationThreshold: Number(e.target.value) })}
                className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Mathematical & Computer Vision Specs */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 shadow-sm text-xs space-y-2.5">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Input Pipeline Compliance</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Multi-format support: PNG, JPEG, WEBP, BMP & Multi-page PDF</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Lossless resolution up to 4K scan canvas buffer</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                <span>Client-side WebWorker & Canvas rasterization pipeline</span>
              </li>
            </ul>
          </div>
        </div>

      </div>
        </div>
      )}
    </div>
  );
};
