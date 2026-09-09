import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, BookOpen, Check } from 'lucide-react';
import { ExamPaper, QuestionItem } from '../types';
import { showSuccessAlert, showSweetToast } from '../utils/sweetAlert';

interface CustomExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExam: (newExam: ExamPaper) => void;
}

export const CustomExamModal: React.FC<CustomExamModalProps> = ({
  isOpen,
  onClose,
  onSaveExam
}) => {
  const [title, setTitle] = useState('Data Structures & Algorithms Midterm');
  const [courseCode, setCourseCode] = useState('CS-302');
  const [academicYear, setAcademicYear] = useState('2026-Spring');
  const [questions, setQuestions] = useState<Partial<QuestionItem>[]>([
    {
      questionNumber: 1,
      topic: 'Binary Search Trees',
      questionText: 'Explain the average and worst-case time complexity of search operations in an AVL Tree versus an unbalanced BST.',
      maxMarks: 10,
      difficulty: 'Medium',
      modelAnswer: 'In an AVL Tree, heights are strictly balanced ensuring O(log n) time complexity for search in both average and worst cases. In an unbalanced BST, worst case degrades to O(n) when nodes are inserted in sorted order.',
      keyConcepts: [
        { concept: 'AVL Tree O(log n) Guarantee', weightMarks: 5, synonyms: ['balanced height', 'self-balancing'], description: 'Must mention guaranteed O(log n) complexity' },
        { concept: 'Unbalanced BST Worst-case O(n)', weightMarks: 5, synonyms: ['skewed tree', 'linear degradation'], description: 'Must explain how degenerate BST degrades to linked list' }
      ]
    }
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        questionNumber: prev.length + 1,
        topic: 'Graph Algorithms',
        questionText: 'Differentiate between Dijkstra algorithm and Bellman-Ford algorithm in terms of negative weight edge handling.',
        maxMarks: 10,
        difficulty: 'Hard',
        modelAnswer: 'Dijkstra assumes non-negative weights and may fail on negative cycles, running in O((V+E)log V). Bellman-Ford handles negative weights and detects negative cycles running in O(V*E).',
        keyConcepts: [
          { concept: 'Dijkstra Non-negative Constraint', weightMarks: 5, synonyms: ['greedy choice', 'non-negative'], description: 'Cannot handle negative weights' },
          { concept: 'Bellman-Ford Negative Cycle Detection', weightMarks: 5, synonyms: ['dynamic programming', 'negative cycle'], description: 'Handles negative edges and detects cycles' }
        ]
      }
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const totalMarks = questions.reduce((sum, q) => sum + (q.maxMarks || 10), 0);
    const newExam: ExamPaper = {
      id: `exam-${Date.now()}`,
      title,
      subject: courseCode,
      gradeLevel: academicYear,
      totalMarks,
      instructions: [
        'Answer all questions concisely in standard technical English.',
        'Legible diagrams and mathematical notation receive full partial credit.'
      ],
      questions: questions.map((q, idx) => ({
        id: `q-${idx + 1}-${Date.now()}`,
        questionNumber: idx + 1,
        questionText: q.questionText || '',
        maxMarks: q.maxMarks || 10,
        topic: q.topic || 'General',
        difficulty: (q.difficulty as any) || 'Medium',
        modelAnswer: q.modelAnswer || 'Model answer specification.',
        keyConcepts: q.keyConcepts || [
          { concept: 'Core Principle', weightMarks: q.maxMarks || 10, synonyms: ['principle', 'concept'], description: 'Fundamental definition' }
        ]
      }))
    };

    onSaveExam(newExam);
    showSuccessAlert(
      'Exam Rubric Created!',
      `<p class="text-xs text-zinc-300">Successfully configured <strong>"${title}"</strong> (${totalMarks} Total Marks, ${questions.length} questions).</p>`,
      2000
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#18181b] border border-[#27272a] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#27272a] flex items-center justify-between bg-[#09090b]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Create / Configure Custom Exam Rubric
              </h2>
              <p className="text-xs text-slate-400">
                Define exam parameters, questions, and automated grading criteria
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#27272a]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Exam Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#09090b] text-xs text-slate-200 p-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Course Code</label>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full bg-[#09090b] text-xs text-slate-200 p-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Academic Term</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-[#09090b] text-xs text-slate-200 p-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Exam Questions ({questions.length})
              </span>
              <button
                onClick={handleAddQuestion}
                className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>

            {questions.map((q, idx) => (
              <div
                key={idx}
                className="p-4 bg-[#09090b] rounded-xl border border-[#27272a] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-indigo-400">Question {idx + 1}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-400 font-mono">Max Marks:</span>
                    <input
                      type="number"
                      value={q.maxMarks || 10}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 5;
                        setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, maxMarks: val } : item));
                      }}
                      className="w-14 bg-[#18181b] text-xs font-mono text-center py-1 rounded border border-[#27272a] text-slate-200"
                    />
                    {questions.length > 1 && (
                      <button
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  value={q.questionText || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, questionText: val } : item));
                  }}
                  placeholder="Enter question text..."
                  rows={2}
                  className="w-full bg-[#18181b] text-xs text-slate-200 p-2.5 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#27272a] bg-[#09090b] flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save & Apply Exam</span>
          </button>
        </div>

      </div>
    </div>
  );
};
