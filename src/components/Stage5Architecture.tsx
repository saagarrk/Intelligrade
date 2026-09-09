import React, { useState } from 'react';
import { 
  Database, 
  Server, 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Send, 
  Layers, 
  FileCode, 
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { SPRING_BOOT_ARCHITECTURE_CODE } from '../data/sampleExams';

export const Stage5Architecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'controller' | 'mysql_schema' | 'rest_api_tester' | 'rest_principles'>('controller');
  const [copiedJava, setCopiedJava] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Live REST API Tester State
  const [endpoint, setEndpoint] = useState<string>('/api/v1/health');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [requestBody, setRequestBody] = useState<string>('{\n  "examContext": "OS and AI Finals"\n}');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);

  const handleCopyJava = () => {
    navigator.clipboard.writeText(SPRING_BOOT_ARCHITECTURE_CODE.controllerJava);
    setCopiedJava(true);
    setTimeout(() => setCopiedJava(false), 2500);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SPRING_BOOT_ARCHITECTURE_CODE.mysqlSchemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSendRequest = async () => {
    setApiLoading(true);
    setApiResponse(null);
    setResponseStatus(null);
    try {
      const authToken = localStorage.getItem('intelligrade_auth_token') || 'ig_token_teacher_session_token';
      const options: RequestInit = {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
      };
      if (method === 'POST') {
        options.body = requestBody;
      }
      const res = await fetch(endpoint, options);
      setResponseStatus(res.status);
      const data = await res.json();
      setApiResponse(data);
    } catch (e: any) {
      setResponseStatus(500);
      setApiResponse({ error: e.message || 'Request failed' });
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold border border-indigo-500/30">
                5
              </span>
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Stage 5: Spring Boot & MySQL Enterprise RESTful Architecture
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Production-ready backend architecture specification adhering to RESTful standards, 3NF MySQL relational database schemas, Spring Web MVC controllers, and microservice pipelines.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-300 rounded-full border border-emerald-500/20 font-mono">
              ✓ Spring Boot 3.x + MySQL 8.x
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-[#27272a] overflow-x-auto">
          {[
            { id: 'controller', label: '1. Spring Boot Controller (Java)', icon: Server },
            { id: 'mysql_schema', label: '2. MySQL Relational Schema (SQL)', icon: Database },
            { id: 'rest_api_tester', label: '3. Live REST API Console', icon: Terminal },
            { id: 'rest_principles', label: '4. RESTful API Principles', icon: Layers },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-arch-${tab.id}`}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 shadow-sm'
                    : 'bg-[#09090b] text-slate-400 hover:text-slate-200 border border-[#27272a]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Spring Boot Controller Code */}
      {activeTab === 'controller' && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                GradingController.java (Spring Boot REST Controller)
              </h3>
            </div>

            <button
              id="copy-java-btn"
              onClick={handleCopyJava}
              className="flex items-center space-x-1.5 px-3 py-1 bg-[#09090b] hover:bg-[#27272a] text-slate-200 text-xs font-medium rounded-lg border border-[#27272a] transition-colors"
            >
              {copiedJava ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{copiedJava ? 'Copied to Clipboard' : 'Copy Java Code'}</span>
            </button>
          </div>

          <div className="relative">
            <pre className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[550px] scrollbar-thin">
              {SPRING_BOOT_ARCHITECTURE_CODE.controllerJava}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: MySQL Database Schema */}
      {activeTab === 'mysql_schema' && (
        <div className="space-y-6">
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  MySQL 3NF Relational Database Schema DDL
                </h3>
              </div>

              <button
                id="copy-sql-btn"
                onClick={handleCopySql}
                className="flex items-center space-x-1.5 px-3 py-1 bg-[#09090b] hover:bg-[#27272a] text-slate-200 text-xs font-medium rounded-lg border border-[#27272a] transition-colors"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-indigo-400" />}
                <span>{copiedSql ? 'Copied SQL' : 'Copy MySQL DDL'}</span>
              </button>
            </div>

            <pre className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] text-[11px] font-mono text-indigo-200/90 overflow-x-auto leading-relaxed max-h-[480px] scrollbar-thin">
              {SPRING_BOOT_ARCHITECTURE_CODE.mysqlSchemaSql}
            </pre>
          </div>

          {/* Visual Relational Entity Relationship Diagram */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200 border-b border-[#27272a] pb-3">
              Entity-Relationship (ER) Architecture
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
                <span className="font-semibold text-indigo-400 block font-mono">1. exams</span>
                <p className="text-[11px] text-slate-400">Primary entity for exam sessions. HasMany ➔ questions, HasMany ➔ submissions.</p>
              </div>
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
                <span className="font-semibold text-emerald-400 block font-mono">2. submissions</span>
                <p className="text-[11px] text-slate-400">Stores student identity, scan URLs, and aggregated marks. HasMany ➔ question_evaluations.</p>
              </div>
              <div className="p-3 bg-[#09090b] rounded-lg border border-[#27272a] space-y-1">
                <span className="font-semibold text-indigo-300 block font-mono">3. predictive_insights</span>
                <p className="text-[11px] text-slate-400">OneToOne link per submission storing JSON recommendations and forecasting vectors.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live REST API Tester / Swagger Console */}
      {activeTab === 'rest_api_tester' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Request Config (6 Cols) */}
          <div className="lg:col-span-6 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                  Live REST API Request Builder
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                RESTful Client
              </span>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-semibold">Preset Endpoints:</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Health Check', m: 'GET', url: '/api/v1/health', body: '' },
                  { label: 'OCR Extract', m: 'POST', url: '/api/v1/ocr/extract', body: '{\n  "imageBase64": "SAMPLE_DATA_SCAN",\n  "examContext": "CS Concurrency"\n}' },
                  { label: 'Generate Model Answer', m: 'POST', url: '/api/v1/model-answers/generate', body: '{\n  "questionText": "Explain Semaphore wait() and signal()",\n  "topic": "OS",\n  "maxMarks": 10\n}' },
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMethod(p.m as any);
                      setEndpoint(p.url);
                      if (p.body) setRequestBody(p.body);
                    }}
                    className="text-[10px] bg-[#09090b] hover:bg-[#27272a] text-slate-300 px-2 py-1 rounded border border-[#27272a] transition-colors"
                  >
                    {p.m} {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Input */}
            <div className="flex space-x-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="bg-[#09090b] text-xs font-semibold text-indigo-400 px-2.5 py-2 rounded-lg border border-[#27272a]"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 bg-[#09090b] text-xs font-mono text-slate-200 px-3 py-2 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                id="send-api-req-btn"
                onClick={handleSendRequest}
                disabled={apiLoading}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {apiLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Send</span>
              </button>
            </div>

            {/* Request Body Editor */}
            {method === 'POST' && (
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-mono">Request JSON Payload:</label>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full bg-[#09090b] font-mono text-xs text-slate-300 p-3 rounded-lg border border-[#27272a] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Response Inspector (6 Cols) */}
          <div className="lg:col-span-6 bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                HTTP Response Payload
              </h3>
              {responseStatus && (
                <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                  responseStatus >= 200 && responseStatus < 300
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  HTTP {responseStatus}
                </span>
              )}
            </div>

            <div className="relative min-h-[260px]">
              {apiLoading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Executing RESTful endpoint...</span>
                </div>
              ) : apiResponse ? (
                <pre className="bg-[#09090b] p-4 rounded-lg border border-[#27272a] text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[380px] scrollbar-thin">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-xs">
                  Click "Send" to invoke live endpoint and view JSON response.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: RESTful API Principles & Architectural Summary */}
      {activeTab === 'rest_principles' && (
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-[#27272a] pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              RESTful Integration Architectural Standards
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2">
              <span className="font-semibold text-xs text-indigo-400 block font-mono">1. Resource-Oriented URI Design</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                URIs model nouns representing entities: <code className="text-indigo-300">/api/v1/exams</code>, <code className="text-indigo-300">/api/v1/submissions</code>, <code className="text-indigo-300">/api/v1/ocr</code>, ensuring intuitive client integration.
              </p>
            </div>

            <div className="p-4 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2">
              <span className="font-semibold text-xs text-emerald-400 block font-mono">2. Standard HTTP Verbs & Status Codes</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Utilizes GET for idempotent reads, POST for creation & pipeline evaluation, and PUT for teacher grade audit overrides with proper 200 OK / 201 Created codes.
              </p>
            </div>

            <div className="p-4 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2">
              <span className="font-semibold text-xs text-indigo-300 block font-mono">3. Stateless Microservice Architecture</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Every request contains all context needed for grading (image payload, rubric, weights), allowing horizontal scalability across Cloud Run or Kubernetes containers.
              </p>
            </div>

            <div className="p-4 bg-[#09090b] rounded-lg border border-[#27272a] space-y-2">
              <span className="font-semibold text-xs text-indigo-400 block font-mono">4. Clean JSON Schema Serialization</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Responses are strictly typed DTOs ensuring seamless consumption by React, mobile apps, or third-party Learning Management Systems (Canvas, Moodle, Blackboard).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
