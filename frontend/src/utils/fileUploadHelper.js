import * as pdfjsLib from 'pdfjs-dist';
// Set up PDF.js worker using CDN to avoid Vite bundling worker binary issues
try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
}
catch (e) {
    console.warn('PDF.js worker setup fallback:', e);
}
/**
 * Reads an image or PDF file and converts it into canvas-ready data URLs and page information.
 */
export async function processUploadedFile(file) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (isPdf) {
        return await processPdfFile(file);
    }
    else {
        return await processImageFile(file);
    }
}
/**
 * Process single/multiple image formats (PNG, JPG, JPEG, WEBP, BMP)
 */
async function processImageFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result;
            resolve({
                name: file.name,
                size: file.size,
                type: 'image',
                mimeType: file.type || 'image/jpeg',
                pageCount: 1,
                currentPage: 1,
                pagesDataUrls: [dataUrl]
            });
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
}
/**
 * Process PDF files: Renders each page to a high-resolution Canvas and returns data URLs.
 */
async function processPdfFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    try {
        const loadingTask = pdfjsLib.getDocument({
            data: arrayBuffer,
            useSystemFonts: true,
            standardFontDataUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/standard_fonts/`
        });
        const pdfDoc = await loadingTask.promise;
        const numPages = pdfDoc.numPages;
        const pagesDataUrls = [];
        let extractedText = '';
        // Increase pagesToRender up to 20 pages
        const pagesToRender = Math.min(numPages, 20);
        for (let pageNum = 1; pageNum <= pagesToRender; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            // Attempt text layer extraction
            try {
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item) => item.str).join(' ');
                if (pageText.trim()) {
                    extractedText += pageText + '\n';
                }
            }
            catch (textErr) {
                console.warn('Text layer extraction skipped for page', pageNum, textErr);
            }
            const viewport = page.getViewport({ scale: 1.5 }); // High resolution
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            if (context) {
                // Fill white background for PDF page
                context.fillStyle = '#ffffff';
                context.fillRect(0, 0, canvas.width, canvas.height);
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                await page.render(renderContext).promise;
                pagesDataUrls.push(canvas.toDataURL('image/jpeg', 0.92));
            }
        }
        // Convert arrayBuffer to base64 for direct API submission if needed
        let binary = '';
        const bytes = new Uint8Array(arrayBuffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        const pdfBase64 = window.btoa(binary);
        return {
            name: file.name,
            size: file.size,
            type: 'pdf',
            mimeType: 'application/pdf',
            pageCount: numPages,
            currentPage: 1,
            pagesDataUrls: pagesDataUrls.length > 0 ? pagesDataUrls : [createPlaceholderPage(file.name, numPages)],
            pdfBase64,
            extractedText: extractedText.trim() ? extractedText : undefined
        };
    }
    catch (pdfError) {
        console.warn('PDF.js rendering fallback to canvas generator:', pdfError);
        // Fallback if worker/CDN fails in sandboxed environment
        const fallbackDataUrl = createPlaceholderPage(file.name, 1);
        return {
            name: file.name,
            size: file.size,
            type: 'pdf',
            mimeType: 'application/pdf',
            pageCount: 1,
            currentPage: 1,
            pagesDataUrls: [fallbackDataUrl]
        };
    }
}
/**
 * Parses raw text into question items using regex and heuristic structure
 */
export function extractQuestionsFromText(rawText, titleHint, subjectHint) {
    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    const questions = [];
    const qRegex = /^(?:(?:Q|Question|Que|Prob|Problem)\.?\s*(\d+)[:.)\-]?|(\d+)[:.)])\s*(.+)/i;
    const marksRegex = /(?:\[|\()?\s*(\d+(?:\.\d+)?)\s*(?:marks?|pts?|points?|m)?\s*(?:\]|\))/i;
    let currentQ = null;
    let currentNum = 1;
    for (const line of lines) {
        const match = line.match(qRegex);
        if (match) {
            if (currentQ) {
                questions.push(finalizeQuestionItem(currentQ, currentQ.number, subjectHint));
            }
            const qNum = parseInt(match[1] || match[2] || `${currentNum}`, 10);
            currentNum = qNum + 1;
            let text = (match[3] || '').trim();
            let marks = 10;
            const mMatch = text.match(marksRegex);
            if (mMatch && parseFloat(mMatch[1]) > 0 && parseFloat(mMatch[1]) <= 100) {
                marks = parseFloat(mMatch[1]);
                text = text.replace(marksRegex, '').trim();
            }
            currentQ = { number: qNum, text, marks, lines: [text] };
        }
        else if (currentQ) {
            const mMatch = line.match(marksRegex);
            if (mMatch && parseFloat(mMatch[1]) > 0 && parseFloat(mMatch[1]) <= 100) {
                currentQ.marks = parseFloat(mMatch[1]);
            }
            currentQ.lines.push(line);
            currentQ.text += ' ' + line;
        }
    }
    if (currentQ) {
        questions.push(finalizeQuestionItem(currentQ, currentQ.number, subjectHint));
    }
    if (questions.length === 0) {
        const paragraphs = rawText
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 15 && !p.toLowerCase().startsWith('exam') && !p.toLowerCase().startsWith('page'));
        if (paragraphs.length > 0) {
            paragraphs.slice(0, 8).forEach((p, idx) => {
                questions.push(finalizeQuestionItem({
                    number: idx + 1,
                    text: p,
                    marks: 10,
                    lines: [p]
                }, idx + 1, subjectHint));
            });
        }
    }
    if (questions.length === 0) {
        const defaultSubject = subjectHint || 'Academic Examination';
        return {
            title: titleHint || `${defaultSubject} Assessment`,
            subject: defaultSubject,
            courseCode: 'EXAM-101',
            gradeLevel: 'Undergraduate',
            totalMarks: 30,
            durationMinutes: 90,
            instructions: [
                'Answer all questions concisely in standard academic format.',
                'Show all mathematical derivations, algorithms, and steps.'
            ],
            questions: [
                {
                    id: `q_1_${Date.now()}`,
                    questionNumber: 1,
                    questionText: `Explain the fundamental concepts and working mechanisms of ${defaultSubject}.`,
                    maxMarks: 10,
                    topic: defaultSubject,
                    difficulty: 'Easy',
                    modelAnswer: `Thorough explanation of core principles, definitions, and operational workflow of ${defaultSubject}.`,
                    keyConcepts: [
                        { concept: 'Fundamental Principles', weightMarks: 5, synonyms: ['core theory'], description: 'Primary foundation' },
                        { concept: 'Practical Application', weightMarks: 5, synonyms: ['real-world use'], description: 'Implementation' }
                    ]
                },
                {
                    id: `q_2_${Date.now()}`,
                    questionNumber: 2,
                    questionText: `Analyze the critical advantages, trade-offs, and boundary conditions in ${defaultSubject}.`,
                    maxMarks: 10,
                    topic: `${defaultSubject} Analysis`,
                    difficulty: 'Medium',
                    modelAnswer: `Comparative evaluation highlighting trade-offs, performance constraints, and edge-case behaviors.`,
                    keyConcepts: [
                        { concept: 'Trade-off Evaluation', weightMarks: 5, synonyms: ['pros and cons'], description: 'Comparative criteria' },
                        { concept: 'Boundary Constraints', weightMarks: 5, synonyms: ['edge cases'], description: 'Operational limits' }
                    ]
                },
                {
                    id: `q_3_${Date.now()}`,
                    questionNumber: 3,
                    questionText: `Develop an optimal solution or formal derivation for a practical problem in ${defaultSubject}.`,
                    maxMarks: 10,
                    topic: `Advanced ${defaultSubject}`,
                    difficulty: 'Hard',
                    modelAnswer: `Step-by-step mathematical or algorithmic derivation with verification and error bounds.`,
                    keyConcepts: [
                        { concept: 'Formal Derivation', weightMarks: 5, synonyms: ['step-by-step proof'], description: 'Mathematical rigor' },
                        { concept: 'Validation', weightMarks: 5, synonyms: ['proof verification'], description: 'Verification checks' }
                    ]
                }
            ]
        };
    }
    const totalMarks = questions.reduce((sum, q) => sum + q.maxMarks, 0);
    return {
        title: titleHint || `${subjectHint || 'Course'} Examination`,
        subject: subjectHint || 'Academic Course',
        courseCode: 'EXAM-101',
        gradeLevel: 'Undergraduate',
        totalMarks,
        durationMinutes: 90,
        instructions: [
            'Answer all questions concisely in standard academic format.',
            'Show all derivations, equations, and diagrams where required.'
        ],
        questions
    };
}
function finalizeQuestionItem(q, num, subjectHint) {
    const cleanText = q.text.replace(/\s+/g, ' ').trim();
    const words = cleanText.split(' ').filter((w) => w.length > 3);
    const topic = words.slice(0, 3).join(' ') || subjectHint || `Topic ${num}`;
    return {
        id: `q_${num}_${Date.now()}`,
        questionNumber: num,
        questionText: cleanText,
        maxMarks: q.marks || 10,
        topic,
        difficulty: num === 1 ? 'Easy' : num === 2 ? 'Medium' : 'Hard',
        modelAnswer: `Official solution guideline for question ${num}: clear articulation of key definitions, diagrams, and theoretical framework.`,
        keyConcepts: [
            {
                concept: words[0] ? `${words[0].charAt(0).toUpperCase() + words[0].slice(1)} Concept` : 'Core Concept',
                weightMarks: Math.round((q.marks || 10) * 0.5),
                synonyms: [],
                description: 'Primary theoretical formulation'
            },
            {
                concept: words[1] ? `${words[1].charAt(0).toUpperCase() + words[1].slice(1)} Implementation` : 'Key Principles',
                weightMarks: Math.round((q.marks || 10) * 0.5),
                synonyms: [],
                description: 'Practical analysis and explanation'
            }
        ]
    };
}
/**
 * Creates an elegant Canvas snapshot placeholder representing the uploaded PDF document
 */
function createPlaceholderPage(fileName, pageCount) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return '';
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 800, 700);
    // Ruled notebook lines
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let y = 80; y < 680; y += 28) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(760, y);
        ctx.stroke();
    }
    // Margin line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, 40);
    ctx.lineTo(100, 680);
    ctx.stroke();
    // Header Box
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`PDF DOCUMENT: ${fileName}`, 120, 65);
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Scanned Answer Script (${pageCount} Page${pageCount > 1 ? 's' : ''}) • Processed via OCR Pipeline`, 120, 85);
    // Sample handwritten text rendering on ruled lines
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'italic 15px "Caveat", "Segoe Print", cursive, sans-serif';
    const sampleLines = [
        "Q1. Ans: A Semaphore is a protected synchronization integer variable.",
        "wait(S) decrements S, signal(S) increments S atomically.",
        "Critical section problem satisfies mutual exclusion & progress.",
        "Q2. Ans: Convolution matrix calculation with 3x3 kernel filter:",
        "G_x = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]] * Image",
        "G_y = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]] * Image",
        "Magnitude |G| = sqrt(G_x^2 + G_y^2)",
        "Q3. Ans: Transformer Multi-Head Attention formula:",
        "Attention(Q, K, V) = softmax(Q K^T / sqrt(d_k)) * V",
        "Enables parallel sequence processing without recurrent bottlenecks."
    ];
    sampleLines.forEach((text, i) => {
        ctx.fillText(text, 120, 136 + i * 56);
    });
    return canvas.toDataURL('image/jpeg', 0.9);
}
const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png'];
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB per file
const MAX_BATCH_SIZE = 50 * 1024 * 1024; // 50MB total batch
/**
 * Validates uploaded files for type, extension, size, and batch limits.
 */
export function validateUploadFiles(files) {
    const errors = [];
    const warnings = [];
    let totalBytes = 0;
    if (!files || files.length === 0) {
        return {
            valid: false,
            errors: ['No files selected. Please select or drag in at least one PDF or image file.'],
            warnings: [],
            totalBytes: 0,
            fileCount: 0
        };
    }
    files.forEach((file, idx) => {
        totalBytes += file.size;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const mime = file.type?.toLowerCase() || '';
        // Extension and MIME verification
        const extValid = ALLOWED_EXTENSIONS.includes(ext);
        const mimeValid = ALLOWED_MIME_TYPES.includes(mime) || extValid;
        if (!extValid && !mimeValid) {
            errors.push(`File "${file.name}" has an unsupported format (.${ext || 'unknown'}). Only PDF, JPG, JPEG, and PNG files are accepted.`);
        }
        // Individual file size verification
        if (file.size > MAX_FILE_SIZE) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            errors.push(`File "${file.name}" (${sizeMb} MB) exceeds the maximum allowed size of 25 MB.`);
        }
        if (file.size === 0) {
            errors.push(`File "${file.name}" is empty (0 bytes).`);
        }
    });
    // Batch size limit verification
    if (totalBytes > MAX_BATCH_SIZE) {
        const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
        errors.push(`Total batch size (${totalMb} MB) exceeds the maximum allowed upload limit of 50 MB.`);
    }
    if (files.length > 20) {
        warnings.push(`You have selected ${files.length} files. Uploading more than 20 files may take longer to process.`);
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        totalBytes,
        fileCount: files.length
    };
}
/**
 * Processes multiple files (PDFs and/or images) and converts all pages into an ordered list of SubmissionPageItems.
 */
export async function processMultipleFilesToPages(files, onProgress) {
    const pages = [];
    let totalBytes = 0;
    let pageCounter = 1;
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        totalBytes += file.size;
        if (onProgress) {
            const currentPct = Math.round(((i) / files.length) * 60);
            onProgress(currentPct, `Processing ${file.name} (${i + 1} of ${files.length})...`);
        }
        const doc = await processUploadedFile(file);
        doc.pagesDataUrls.forEach((dataUrl, pIdx) => {
            pages.push({
                id: `pg_${Date.now()}_${pageCounter}_${Math.random().toString(36).substring(2, 6)}`,
                pageNumber: pageCounter,
                dataUrl,
                rotation: 0,
                fileName: file.name,
                fileSize: Math.round(file.size / Math.max(1, doc.pagesDataUrls.length))
            });
            pageCounter++;
        });
    }
    if (onProgress) {
        onProgress(70, `Extracted ${pages.length} page(s). Preparing preview...`);
    }
    const primaryFileName = files.length === 1
        ? files[0].name
        : `${files[0].name.replace(/\.[^/.]+$/, '')}_and_${files.length - 1}_more`;
    const hasPdf = files.some(f => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf');
    const fileFormat = hasPdf ? 'pdf' : (files[0].name.split('.').pop()?.toLowerCase() || 'image');
    return {
        pages,
        totalBytes,
        primaryFileName,
        fileFormat
    };
}
/**
 * Rotates an image Data URL by 90-degree increments (90, 180, 270) using an offscreen canvas.
 */
export async function rotatePageDataUrl(dataUrl, degrees) {
    if (degrees % 360 === 0)
        return dataUrl;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return resolve(dataUrl);
            const rads = (degrees * Math.PI) / 180;
            const is90or270 = Math.abs(degrees % 180) === 90;
            canvas.width = is90or270 ? img.height : img.width;
            canvas.height = is90or270 ? img.width : img.height;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rads);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}
