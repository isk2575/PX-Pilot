import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.NODE_ENV === "production" 
  ? "" 
  : "http://localhost:8000";

const NAV = [
  { id: "dashboard", label: "Dashboard" },
  { id: "hub", label: "Ask AI" },
  { id: "documents", label: "Documents" },
  { id: "workflow", label: "Workflow Insights" },
  { id: "harmonizer", label: "Compare" },
];

// ── Icons ──
function GridIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
}
function ChatIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
function DocIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function BoltIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function CompareIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
}
function SearchIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function UploadIcon() {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
}
function TrendIcon() {
  return <svg width="60" height="28" viewBox="0 0 60 28" fill="none"><polyline points="0,22 12,16 24,18 36,8 48,12 60,4" stroke="#22c55e" strokeWidth="1.5" fill="none"/></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function NavIcon({ id }) {
  if (id === "dashboard") return <GridIcon />;
  if (id === "hub") return <ChatIcon />;
  if (id === "documents") return <DocIcon />;
  if (id === "workflow") return <BoltIcon />;
  if (id === "harmonizer") return <CompareIcon />;
  return null;
}

export default function App() {
  const [active, setActive] = useState("dashboard");
  const [sidebarDocs, setSidebarDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  //const [searchResult, setSearchResult] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [fileSuggestions, setFileSuggestions] = useState([]);

  const refreshDocs = () => {
    axios.get(`${API}/documents`)
      .then((res) => setSidebarDocs(res.data.documents))
      .catch(() => {});
  };

  useEffect(() => {
    refreshDocs();
  }, []);

 const handleSearchChange = (e) => {
  const val = e.target.value;
  setSearchQuery(val);
  if (val.trim()) {
    const matches = sidebarDocs.filter(d => 
      d.name.toLowerCase().includes(val.toLowerCase())
    );
    setFileSuggestions(matches);
    setSearchOpen(true);
  } else {
    setFileSuggestions([]);
    setSearchOpen(false);
  }
};

  return (
    <div style={s.root}>
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoMark}>PX</div>
          <div>
            <div style={s.logoTitle}>PX Pilot</div>
            <div style={s.logoSub}>AI assistant for people operations</div>
          </div>
        </div>
        <nav style={s.nav}>
          {NAV.map((item) => (
            <button key={item.id} onClick={() => setActive(item.id)}
              style={{ ...s.navBtn, ...(active === item.id ? s.navBtnActive : {}) }}>
              <span style={{ ...s.navIcon, ...(active === item.id ? s.navIconActive : {}) }}>
                <NavIcon id={item.id} />
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div style={s.recentDocs}>
          <div style={s.recentTitle}>Recent Documents</div>
          {sidebarDocs.map((doc) => (
            <div key={doc.name} style={s.recentDoc} onClick={() => setActive("documents")}>
              <span style={s.recentDocIcon}><DocIcon /></span>
              <div>
                <div style={s.recentDocName}>{doc.name}</div>
                <div style={s.recentDocDate}>{doc.size} · {doc.updated}</div>
              </div>
            </div>
          ))}
          <div style={s.viewAll} onClick={() => setActive("documents")}>View all documents →</div>
        </div>
        <div style={s.upgradeBanner}>
          <div style={s.upgradeTitle}>Upgrade your plan</div>
          <div style={s.upgradeSub}>Unlock advanced analytics, custom AI models, and more.</div>
          <button style={s.upgradeBtn}>View Plans</button>
        </div>
      </aside>

      <main style={s.main}>
        <div style={s.topbar}>
          <div style={s.searchBarWrapper}>
            <div style={s.searchBar}>
              <SearchIcon />
              <input
                style={s.searchInput}
                placeholder="Search policies, documents, workflows..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e)}
                onKeyDown={handleSearchChange}
                onFocus={() => setSearchOpen(false)}
              />
              <span style={s.searchKbd}>⌘ K</span>
            </div>
  {searchOpen && fileSuggestions.length > 0 && (
  <div style={s.searchDropdown}>
    <div style={s.searchDropdownHeader}>
      <span style={s.searchDropdownTitle}>Documents</span>
      <button style={s.searchDropdownClose} onClick={() => setSearchOpen(false)}>✕</button>
    </div>
    {fileSuggestions.map((doc) => (
      <div key={doc.name} style={s.searchSuggRow} onClick={() => {
        setActive("documents");
        setSearchOpen(false);
        setSearchQuery("");
      }}>
        <DocIcon />
        <span style={s.searchSuggName}>{doc.name}</span>
        <span style={s.searchSuggSize}>{doc.size}</span>
      </div>
    ))}
  </div>
)}
</div>
          <button style={s.uploadBtn} onClick={() => setActive("documents")}>
            <UploadIcon /> Upload Document
          </button>
        </div>
        <div style={s.content}>
          {active === "dashboard" && <Dashboard setActive={setActive} />}
          {active === "hub" && <AskAI setActive={setActive} active={active} />}
          {active === "documents" && <Documents onUpload={refreshDocs} />}
          {active === "workflow" && <WorkflowIntelligence />}
          {active === "harmonizer" && <PolicyHarmonizer />}
        </div>
      </main>
    </div>
  );
}

/* ── DASHBOARD ── */
function Dashboard({ setActive }) {
  return (
    <div style={s.dashLayout}>
      <div style={s.dashLeft}>
        <div style={s.askHeader}>
          <div style={s.askTitle}>PX Pilot</div>
          <div style={s.askSubtitle}>AI assistant for people operations</div>
          <div style={s.askDesc}>Get instant answers, compare policies, and uncover insights to drive better people experiences.</div>
        </div>
        <div style={s.metricRow}>
          {[
            { label: "Time Saved", value: "128", unit: "hrs", trend: "+34% vs last 30 days" },
            { label: "Documents Analyzed", value: "256", unit: "", trend: "+28% vs last 30 days" },
            { label: "Workflow Opportunities", value: "18", unit: "", trend: "+42% vs last 30 days" },
          ].map((m) => (
            <div key={m.label} style={s.metricCard}>
              <div style={s.metricLabel}>{m.label}</div>
              <div style={s.metricValue}>{m.value}<span style={s.metricUnit}>{m.unit}</span></div>
              <div style={s.metricTrend}>↑ {m.trend}</div>
              <TrendIcon />
            </div>
          ))}
        </div>
        <div style={s.quickCards}>
          {[
            { icon: <ChatIcon />, title: "Policy Q&A", desc: "Ask questions and get answers cited from your policies.", cta: "Ask a question →", tab: "hub" },
            { icon: <CompareIcon />, title: "Document Comparison", desc: "Compare documents and highlight differences side by side.", cta: "Compare now →", tab: "harmonizer" },
            { icon: <BoltIcon />, title: "Workflow Insights", desc: "Analyze workflows and discover opportunities to improve.", cta: "Explore insights →", tab: "workflow" },
          ].map((c) => (
            <div key={c.title} style={s.quickCard} onClick={() => setActive(c.tab)}>
              <div style={s.quickCardIcon}>{c.icon}</div>
              <div style={s.quickCardTitle}>{c.title}</div>
              <div style={s.quickCardDesc}>{c.desc}</div>
              <div style={s.quickCardCta}>{c.cta}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={s.dashRight}>
        <div style={s.insightsHeader}>
          <div style={s.insightsTitle}><span style={s.insightsStar}>✦</span> Document Insights</div>
          <button style={s.viewFullBtn}>View full analysis →</button>
        </div>
        <div style={s.insightsSection}>
          <div style={s.insightsSectionTitle}>AI Summary</div>
          <div style={s.insightsSummary}>Ask a question to get AI-generated insights from your policy documents. Answers will include citations and extracted highlights.</div>
        </div>
        <div style={s.insightsSection}>
          <div style={s.insightsSectionTitle}>Top Workflow Opportunities <span style={s.viewAllLink}>View all →</span></div>
          {[
            { name: "Onboarding Process", level: "High impact", pct: 78 },
            { name: "Offboarding Checklist", level: "Medium impact", pct: 62 },
            { name: "Performance Review Flow", level: "Medium impact", pct: 48 },
          ].map((o) => (
            <div key={o.name} style={s.oppRow}>
              <div style={s.oppInfo}>
                <div style={s.oppName}>{o.name}</div>
                <div style={s.oppLevel}>{o.level}</div>
              </div>
              <div style={s.oppBarBg}><div style={{ ...s.oppBar, width: `${o.pct}%` }} /></div>
              <div style={s.oppPct}>{o.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── ASK AI ── */
function AskAI({ setActive, active }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasDocs, setHasDocs] = useState(true);

  useEffect(() => {
    axios.get(`${API}/documents`)
      .then((res) => setHasDocs(res.data.documents.length > 0))
      .catch(() => {});
  }, [active]);

  const ask = async (q) => {
    const query = q || question;
    if (!query.trim()) return;
    setQuestion("");
    setLoading(true);
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    try {
      const form = new FormData();
      form.append("question", query);
      const res = await axios.post(`${API}/ask`, form);
      setMessages((prev) => [...prev, { type: "ai", text: res.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { type: "ai", text: "Error connecting to backend. Make sure the server is running." }]);
    }
    setLoading(false);
  };

  const suggestions = ["Ask about PTO policy", "What is the parental leave policy?", "Review onboarding workflow"];

  return (
    <div style={s.askLayout}>
      <div style={s.askLeft}>
        <div style={s.chatBox}>
          <div style={s.chatHeader}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#e63946" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={s.chatHeaderText}>Ask AI about your people policies and workflows</span>
          </div>

          {!hasDocs ? (
            <div style={s.noDocsMsg}>
              <div style={s.noDocsIcon}>
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="1.2">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/>
                </svg>
              </div>
              <div style={s.noDocsTitle}>No company policy uploaded yet</div>
              <div style={s.noDocsSub}>Upload your company HR policy documents before asking questions. The AI will answer directly from your actual policies.</div>
              <button style={s.noDocsBtn} onClick={() => setActive("documents")}>
                Upload Company Policy →
              </button>
            </div>
          ) : (
            <>
              <div style={s.chatMessages}>
                {messages.length === 0 && (
                  <div style={s.emptyChat}>
                    <div style={s.emptyChatIcon}>
                      <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="#374151" strokeWidth="1.2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div style={s.emptyChatText}>Ask me anything about your HR policies and workflows</div>
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} style={msg.type === "user" ? s.userMsgWrap : s.aiMsgWrap}>
                    {msg.type === "user"
                      ? <div style={s.userMsg}>{msg.text}</div>
                      : <div style={s.aiMsg}>
                          <div style={s.aiMsgIcon}>
                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#e63946" strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          </div>
                          <div style={s.aiMsgText} dangerouslySetInnerHTML={{ __html: msg.text
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/##\s?(.*?)(\n|$)/g, '<br/><strong style="font-size:14px">$1</strong><br/>')
                              .replace(/\n/g, '<br/>')
                            }} />
                        </div>
                    }
                  </div>
                ))}
                {loading && (
                  <div style={s.aiMsgWrap}>
                    <div style={s.aiMsg}>
                      <div style={s.aiMsgIcon}>
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#e63946" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </div>
                      <div style={s.aiMsgText}><span style={s.typingDots}>Thinking...</span></div>
                    </div>
                  </div>
                )}
              </div>
              <div style={s.chatInputArea}>
                {messages.length === 0 && (
                  <div style={s.suggestions}>
                    <span style={s.tryAsking}>Try asking:</span>
                    {suggestions.map((sug) => (
                      <button key={sug} style={s.suggChip} onClick={() => ask(sug)}>{sug}</button>
                    ))}
                  </div>
                )}
                <div style={s.inputRow}>
                  <textarea
                    style={s.chatInput}
                    placeholder="Ask anything about your policies, documents, or workflows..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={1}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
                  />
                  <button style={s.sendBtn} onClick={() => ask()} disabled={loading}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div style={s.askRight}>
        <div style={s.insightsHeader}>
          <div style={s.insightsTitle}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#e63946" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Document Insights
          </div>
          <button style={s.viewFullBtn}>View full analysis →</button>
        </div>
        <div style={s.insightsSection}>
          <div style={s.insightsSectionTitle}>AI Summary</div>
          <div style={s.insightsSummary}>
            {messages.filter(m => m.type === "ai").slice(-1)[0]?.text || "Ask a question to get AI-generated insights from your policy documents."}
          </div>
        </div>
        {messages.filter(m => m.type === "ai").length > 0 && (
          <div style={s.insightsSection}>
            <div style={s.insightsSectionTitle}>Cited Sources <span style={s.sourceCount}>3</span></div>
            {["PTO Policy.pdf — Page 4", "Employee Handbook.pdf — Page 12", "CA Leave Policy.pdf — Page 3"].map((src) => (
              <div key={src} style={s.insightSourceRow}>
                <DocIcon />
                <span style={s.insightSourceName}>{src}</span>
                <span style={s.insightSourceLink}>↗</span>
              </div>
            ))}
          </div>
        )}
        <div style={s.insightsSection}>
          <div style={s.insightsSectionTitle}>Top Workflow Opportunities</div>
          {[
            { name: "Onboarding Process", level: "High impact", pct: 78 },
            { name: "Offboarding Checklist", level: "Medium impact", pct: 62 },
            { name: "Performance Review Flow", level: "Medium impact", pct: 48 },
          ].map((o) => (
            <div key={o.name} style={s.oppRow}>
              <div style={s.oppInfo}>
                <div style={s.oppName}>{o.name}</div>
                <div style={s.oppLevel}>{o.level}</div>
              </div>
              <div style={s.oppBarBg}><div style={{ ...s.oppBar, width: `${o.pct}%` }} /></div>
              <div style={s.oppPct}>{o.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── DOCUMENTS ── */
function Documents({ onUpload }) {
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");

  useEffect(() => {
    axios.get(`${API}/documents`)
      .then((res) => setDocs(res.data.documents))
      .catch(() => {});
  }, []);

    const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      setUploadMsg("");
      try {
        const form = new FormData();
        form.append("file", file);
        const res = await axios.post(`${API}/upload`, form);
        setDocs((prev) => [...prev, {
          name: res.data.filename,
          size: (file.size / 1024).toFixed(0) + " KB",
          updated: "Just now"
        }]);
        setUploadMsg(`✓ ${res.data.filename} uploaded and indexed successfully`);
        if (onUpload) onUpload();  // ← add this line
      } catch {
        setUploadMsg("Error uploading file. Make sure the backend is running.");
      }
      setUploading(false);
    };
    const handleDelete = async (filename) => {
        try {
          await axios.delete(`${API}/documents/${encodeURIComponent(filename)}`);
          setDocs((prev) => prev.filter((d) => d.name !== filename));
          if (onUpload) onUpload();
        } catch {
          console.error("Error deleting file");
        }
     };
     return (
    <div style={s.simplePage}>
      <div style={s.simpleHeader}>
        <div style={s.simpleTitle}>Documents</div>
        <div style={s.simpleSub}>Upload HR policy documents to query with AI</div>
      </div>
      <div style={s.docGrid}>
        {docs.map((doc) => (
            <div key={doc.name} style={s.docCard}>
              <span style={s.docCardIcon}><DocIcon /></span>
              <div style={s.docCardInfo}>
                <div style={s.docCardName}>{doc.name}</div>
                <div style={s.docCardMeta}>{doc.size} · Updated {doc.updated}</div>
              </div>
              <div style={s.docCardBadge}>PDF</div>
              {doc.name !== "general_us_hr_policy.pdf" && (
                <button onClick={() => handleDelete(doc.name)} style={s.trashBtn} title="Delete">
                  <TrashIcon />
                </button>
                )}
            </div>
          ))}
      </div>
      <div style={s.uploadZone}>
        <div style={s.uploadZoneIcon}><UploadIcon /></div>
        <div style={s.uploadZoneText}>Drag & drop PDFs or click to browse</div>
        <label style={s.browseBtn}>
          {uploading ? "Uploading..." : "Browse files"}
          <input type="file" accept=".pdf" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
        </label>
        <div style={s.uploadZoneSub}>Max file size 50MB</div>
        {uploadMsg && (
          <div style={{ fontSize: "12px", color: uploadMsg.startsWith("✓") ? "#22c55e" : "#ef4444", marginTop: "8px" }}>
            {uploadMsg}
          </div>
        )}
      </div>
    </div>
  );
};
  

 
/* ── WORKFLOW INTELLIGENCE ── */
function WorkflowIntelligence() {
  const [workflow, setWorkflow] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!workflow.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const form = new FormData();
      form.append("workflow", workflow);
      const res = await axios.post(`${API}/analyze`, form);
      setResult(res.data.result);
    } catch {
      setResult("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div style={s.simplePage}>
      <div style={s.simpleHeader}>
        <div style={s.simpleTitle}>Workflow Intelligence</div>
        <div style={s.simpleSub}>Analyze HR workflows and identify automation opportunities</div>
      </div>
      <div style={s.card}>
        <textarea style={s.bigTextarea}
          placeholder="Describe your HR workflow... e.g. When a new employee joins, HR manually emails the offer letter, then sends benefits forms separately..."
          value={workflow} onChange={(e) => setWorkflow(e.target.value)} rows={6} />
        <button style={{ ...s.primaryBtn, ...(loading ? s.btnDisabled : {}) }} onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Workflow →"}
        </button>
      </div>
      {loading && <div style={s.loadingCard}><div style={s.spinner} /><span style={s.loadingText}>Identifying automation opportunities...</span></div>}
      {result && (
        <div style={s.resultCard}>
          <div style={s.resultHeader}><span style={s.resultDot} /><span style={s.resultLabel}>Analysis Report</span></div>
          <pre style={s.resultPre}>{result}</pre>
        </div>
      )}
    </div>
  );
}

/* ── POLICY HARMONIZER ── */
function PolicyHarmonizer() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const compare = async () => {
    if (!fileA || !fileB) return;
    setLoading(true);
    setResult("");
    try {
      const form = new FormData();
      form.append("file_a", fileA);
      form.append("file_b", fileB);
      const res = await axios.post(`${API}/compare`, form);
      setResult(res.data.result);
    } catch {
      setResult("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div style={s.simplePage}>
      <div style={s.simpleHeader}>
        <div style={s.simpleTitle}>Policy Harmonizer</div>
        <div style={s.simpleSub}>Compare two policy documents and surface conflicts, duplicates, and recommendations</div>
      </div>
      <div style={s.card}>
        <div style={s.uploadRow}>
          {[["Policy Document A", fileA, (e) => setFileA(e.target.files[0])],
            ["Policy Document B", fileB, (e) => setFileB(e.target.files[0])]].map(([label, file, onChange]) => (
            <div key={label} style={s.uploadBox}>
              <div style={s.uploadLabel}>{label}</div>
              <input type="file" accept=".pdf" onChange={onChange} style={s.fileInput} />
              {file && <div style={s.fileName}>✓ {file.name}</div>}
            </div>
          ))}
        </div>
        <button style={{ ...s.primaryBtn, ...(!fileA || !fileB || loading ? s.btnDisabled : {}) }}
          onClick={compare} disabled={!fileA || !fileB || loading}>
          {loading ? "Comparing..." : "Compare Policies →"}
        </button>
      </div>
      {loading && <div style={s.loadingCard}><div style={s.spinner} /><span style={s.loadingText}>Comparing policy documents...</span></div>}
      {result && (
        <div style={s.resultCard}>
          <div style={s.resultHeader}><span style={s.resultDot} /><span style={s.resultLabel}>Comparison Report</span></div>
          <pre style={s.resultPre}>{result}</pre>
        </div>
      )}
    </div>
  );
}

/* ── STYLES ── */
const s = {
  root: { display: "flex", height: "100vh", fontFamily: "'Geist', 'Segoe UI', sans-serif", background: "#0f1117", color: "#e8eaf0", overflow: "hidden" },
  sidebar: { width: "240px", minWidth: "240px", background: "#111827", borderRight: "1px solid #1f2937", display: "flex", flexDirection: "column", padding: "20px 12px", overflowY: "auto" },
  logo: { display: "flex", alignItems: "center", gap: "10px", padding: "4px 8px 20px", borderBottom: "1px solid #1f2937", marginBottom: "16px" },
  logoMark: { width: "32px", height: "32px", background: "#e63946", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800", color: "#fff", flexShrink: 0 },
  logoTitle: { fontSize: "15px", fontWeight: "700", color: "#f9fafb" },
  logoSub: { fontSize: "10px", color: "#6b7280", marginTop: "1px" },
  nav: { display: "flex", flexDirection: "column", gap: "2px", marginBottom: "24px" },
  navBtn: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "6px", border: "none", background: "transparent", color: "#9ca3af", fontSize: "13px", fontWeight: "500", cursor: "pointer", textAlign: "left" },
  navBtnActive: { background: "#1f2937", color: "#f9fafb" },
  navIcon: { color: "#6b7280", display: "flex" },
  navIconActive: { color: "#e63946" },
  recentDocs: { marginBottom: "20px" },
  recentTitle: { fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", padding: "0 8px", marginBottom: "8px" },
  recentDoc: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", borderRadius: "6px", cursor: "pointer" },
  recentDocIcon: { color: "#e63946", display: "flex", flexShrink: 0 },
  recentDocName: { fontSize: "12px", color: "#d1d5db", fontWeight: "500" },
  recentDocDate: { fontSize: "10px", color: "#6b7280" },
  viewAll: { fontSize: "11px", color: "#e63946", padding: "4px 8px", cursor: "pointer" },
  upgradeBanner: { marginTop: "auto", background: "#1f2937", borderRadius: "8px", padding: "14px", border: "1px solid #374151" },
  upgradeTitle: { fontSize: "12px", fontWeight: "600", color: "#f9fafb", marginBottom: "4px" },
  upgradeSub: { fontSize: "11px", color: "#9ca3af", marginBottom: "10px", lineHeight: "1.5" },
  upgradeBtn: { background: "#0f1117", border: "1px solid #374151", color: "#f9fafb", borderRadius: "6px", padding: "6px 12px", fontSize: "11px", fontWeight: "600", cursor: "pointer", width: "100%" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
  topbar: { display: "flex", alignItems: "center", gap: "12px", padding: "12px 24px", borderBottom: "1px solid #1f2937", background: "#111827" },
  searchBar: { display: "flex", alignItems: "center", gap: "8px", background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", padding: "8px 14px", color: "#6b7280", width: "100%" },
  searchText: { flex: 1, fontSize: "13px" },
  searchKbd: { fontSize: "11px", background: "#374151", padding: "2px 6px", borderRadius: "4px", color: "#9ca3af" },
  searchBarWrapper: { flex: 1, position: "relative" },
  searchInput: { flex: 1, background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: "13px", fontFamily: "inherit", width: "100%" },
  searchDropdown: { position: "absolute", top: "48px", left: 0, right: 0, background: "#1f2937", border: "1px solid #374151", borderRadius: "10px", padding: "16px", zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" },
  searchDropdownHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" },
  searchDropdownTitle: { fontSize: "11px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" },
  searchDropdownClose: { background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "14px" },
  searchDropdownResult: { fontSize: "13px", color: "#d1d5db", lineHeight: "1.7" },
  uploadBtn: { display: "flex", alignItems: "center", gap: "8px", background: "#e63946", color: "#fff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  content: { flex: 1, overflowY: "auto" },
  // Dashboard
  dashLayout: { display: "flex", height: "100%" },
  dashLeft: { flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px" },
  dashRight: { width: "300px", minWidth: "300px", borderLeft: "1px solid #1f2937", padding: "20px", overflowY: "auto", background: "#111827" },
  askHeader: {},
  askTitle: { fontSize: "28px", fontWeight: "700", color: "#f9fafb", letterSpacing: "-0.5px" },
  askSubtitle: { fontSize: "14px", color: "#9ca3af", marginBottom: "6px" },
  askDesc: { fontSize: "12.5px", color: "#6b7280", lineHeight: "1.6", maxWidth: "480px" },
  metricRow: { display: "flex", gap: "12px" },
  metricCard: { flex: 1, background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", padding: "14px 16px" },
  metricLabel: { fontSize: "11px", color: "#6b7280", fontWeight: "500", marginBottom: "6px" },
  metricValue: { fontSize: "28px", fontWeight: "700", color: "#f9fafb", letterSpacing: "-1px", lineHeight: "1" },
  metricUnit: { fontSize: "14px", fontWeight: "500", color: "#9ca3af", marginLeft: "3px" },
  metricTrend: { fontSize: "11px", color: "#22c55e", marginTop: "4px", marginBottom: "8px" },
  quickCards: { display: "flex", gap: "12px" },
  quickCard: { flex: 1, background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", padding: "16px", cursor: "pointer" },
  quickCardIcon: { color: "#e63946", marginBottom: "8px", display: "flex" },
  quickCardTitle: { fontSize: "13px", fontWeight: "600", color: "#f9fafb", marginBottom: "4px" },
  quickCardDesc: { fontSize: "11.5px", color: "#6b7280", lineHeight: "1.5", marginBottom: "10px" },
  quickCardCta: { fontSize: "11.5px", color: "#e63946", fontWeight: "500" },
  // Ask AI
  askLayout: { display: "flex", height: "100%" },
  askLeft: { flex: 1, padding: "0", display: "flex", flexDirection: "column" },
  askRight: { width: "300px", minWidth: "300px", borderLeft: "1px solid #1f2937", padding: "20px", overflowY: "auto", background: "#111827" },
  chatBox: { flex: 1, display: "flex", flexDirection: "column", background: "#111827", border: "none" },
  chatHeader: { display: "flex", alignItems: "center", gap: "8px", padding: "14px 20px", borderBottom: "1px solid #1f2937" },
  chatStarIcon: { color: "#e63946", fontSize: "14px" },
  chatHeaderText: { fontSize: "13px", fontWeight: "500", color: "#d1d5db" },
  chatMessages: { flex: 1, padding: "20px", display: "flex", flexDirection: "column", gap: "16px", overflowY: "auto", minHeight: "300px" },
  emptyChat: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "12px", padding: "60px 0" },
  emptyChatIcon: { fontSize: "32px", color: "#e63946" },
  emptyChatText: { fontSize: "14px", color: "#6b7280", textAlign: "center" },
  userMsgWrap: { display: "flex", justifyContent: "flex-end" },
  aiMsgWrap: { display: "flex", justifyContent: "flex-start" },
  userMsg: { background: "#e63946", color: "#fff", padding: "10px 14px", borderRadius: "18px 18px 4px 18px", fontSize: "13px", maxWidth: "70%" },
  aiMsg: { display: "flex", gap: "10px", alignItems: "flex-start", maxWidth: "80%" },
  aiMsgIcon: { width: "28px", height: "28px", background: "#1f2937", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#e63946", flexShrink: 0 },
  aiMsgText: { fontSize: "13px", color: "#d1d5db", lineHeight: "1.7", background: "#1f2937", padding: "12px 14px", borderRadius: "4px 18px 18px 18px" },
  typingDots: { color: "#6b7280", fontStyle: "italic" },
  chatInputArea: { padding: "12px 20px", borderTop: "1px solid #1f2937" },
  suggestions: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px", flexWrap: "wrap" },
  tryAsking: { fontSize: "11px", color: "#6b7280", whiteSpace: "nowrap" },
  suggChip: { background: "#1f2937", border: "1px solid #374151", color: "#d1d5db", borderRadius: "20px", padding: "4px 10px", fontSize: "11px", cursor: "pointer" },
  inputRow: { display: "flex", gap: "8px", alignItems: "flex-end" },
  chatInput: { flex: 1, background: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#e8eaf0", fontSize: "13px", padding: "10px 12px", outline: "none", fontFamily: "inherit", resize: "none", lineHeight: "1.5" },
  sendBtn: { background: "#e63946", color: "#fff", border: "none", borderRadius: "8px", width: "36px", height: "36px", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  // Documents
  docGrid: { display: "flex", flexDirection: "column", gap: "8px" },
  docCard: { display: "flex", alignItems: "center", gap: "14px", background: "#111827", border: "1px solid #1f2937", borderRadius: "10px", padding: "14px 16px" },
  docCardIcon: { color: "#e63946", display: "flex", flexShrink: 0 },
  docCardInfo: { flex: 1 },
  docCardName: { fontSize: "13px", fontWeight: "600", color: "#f9fafb", marginBottom: "2px" },
  docCardMeta: { fontSize: "11px", color: "#6b7280" },
  docCardBadge: { background: "#1f2937", color: "#9ca3af", fontSize: "10px", fontWeight: "600", padding: "2px 8px", borderRadius: "4px" },
  trashBtn: { background: "none", border: "none", color: "#6b7280", cursor: "pointer", display: "flex", padding: "4px", borderRadius: "4px" },
  uploadZone: { background: "#111827", border: "1px dashed #374151", borderRadius: "10px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" },
  uploadZoneIcon: { color: "#6b7280", marginBottom: "4px" },
  uploadZoneText: { fontSize: "13px", color: "#9ca3af" },
  browseBtn: { background: "#1f2937", border: "1px solid #374151", color: "#f9fafb", borderRadius: "6px", padding: "7px 16px", fontSize: "12px", fontWeight: "600", cursor: "pointer", marginTop: "4px" },
  uploadZoneSub: { fontSize: "11px", color: "#6b7280" },
  // Insights panel
  insightsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" },
  insightsTitle: { fontSize: "14px", fontWeight: "600", color: "#f9fafb", display: "flex", alignItems: "center", gap: "6px" },
  insightsStar: { color: "#e63946" },
  viewFullBtn: { fontSize: "11px", color: "#e63946", background: "none", border: "none", cursor: "pointer" },
  insightsSection: { marginBottom: "20px" },
  insightsSectionTitle: { fontSize: "12px", fontWeight: "600", color: "#9ca3af", marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  insightsSummary: { fontSize: "12px", color: "#d1d5db", lineHeight: "1.7" },
  sourceCount: { background: "#1f2937", color: "#9ca3af", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" },
  insightSourceRow: { display: "flex", alignItems: "center", gap: "8px", padding: "5px 0", borderBottom: "1px solid #1f2937" },
  insightSourceName: { flex: 1, fontSize: "11.5px", color: "#d1d5db" },
  insightSourceLink: { color: "#e63946", fontSize: "12px" },
  viewAllLink: { color: "#e63946", fontSize: "11px", cursor: "pointer" },
  oppRow: { display: "flex", alignItems: "center", gap: "8px", padding: "6px 0" },
  noDocsMsg: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: "10px", padding: "60px 20px", textAlign: "center" },
  noDocsIcon: { marginBottom: "4px" },
  noDocsTitle: { fontSize: "16px", fontWeight: "600", color: "#f9fafb" },
  noDocsSub: { fontSize: "13px", color: "#6b7280", maxWidth: "300px", lineHeight: "1.6" },
  noDocsBtn: { background: "#e63946", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginTop: "8px" },
  oppInfo: { width: "120px" },
  oppName: { fontSize: "11.5px", color: "#d1d5db", fontWeight: "500" },
  oppLevel: { fontSize: "10px", color: "#6b7280" },
  oppBarBg: { flex: 1, height: "4px", background: "#1f2937", borderRadius: "2px" },
  oppBar: { height: "4px", background: "#e63946", borderRadius: "2px" },
  oppPct: { fontSize: "11px", color: "#9ca3af", width: "30px", textAlign: "right" },
  // Simple pages
  simplePage: { padding: "28px 32px", maxWidth: "800px", display: "flex", flexDirection: "column", gap: "20px" },
  simpleHeader: { marginBottom: "4px" },
  simpleTitle: { fontSize: "22px", fontWeight: "700", color: "#f9fafb", letterSpacing: "-0.3px" },
  simpleSub: { fontSize: "13px", color: "#6b7280", marginTop: "4px" },
  card: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px" },
  bigTextarea: { width: "100%", background: "#0f1117", border: "1px solid #374151", borderRadius: "8px", color: "#e8eaf0", fontSize: "13.5px", padding: "12px 14px", resize: "vertical", outline: "none", fontFamily: "inherit", lineHeight: "1.6", boxSizing: "border-box", marginBottom: "16px" },
  primaryBtn: { background: "#e63946", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer" },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  loadingCard: { display: "flex", alignItems: "center", gap: "12px", background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "16px 20px" },
  spinner: { width: "16px", height: "16px", border: "2px solid #1f2937", borderTop: "2px solid #e63946", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadingText: { fontSize: "13px", color: "#6b7280" },
  resultCard: { background: "#111827", border: "1px solid #1f2937", borderRadius: "12px", padding: "20px" },
  resultHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  resultDot: { width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", display: "inline-block" },
  resultLabel: { fontSize: "11px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.5px", textTransform: "uppercase" },
  resultPre: { fontSize: "13px", color: "#d1d5db", lineHeight: "1.8", whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" },
  uploadRow: { display: "flex", gap: "16px", marginBottom: "16px" },
  uploadBox: { flex: 1, background: "#0f1117", border: "1px dashed #374151", borderRadius: "8px", padding: "16px" },
  uploadLabel: { fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.5px" },
  fileInput: { fontSize: "12px", color: "#9ca3af", width: "100%" },
  fileName: { marginTop: "8px", fontSize: "12px", color: "#22c55e", fontWeight: "500" },
  searchSuggRow: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 4px", borderRadius: "6px", cursor: "pointer", color: "#d1d5db" },
  searchSuggName: { flex: 1, fontSize: "13px" },
  searchSuggSize: { fontSize: "11px", color: "#6b7280" },
};