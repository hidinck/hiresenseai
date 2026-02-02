import { useState, useEffect } from "react";
import "./App.css";
import Auth from "./Auth";

const API_BASE = "https://hiresenseai.onrender.com";

export default function App() {

  // ================= AUTH =================

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggedIn(!!token);
  }, []);

  // ================= DATA =================

  const [resumeFiles, setResumeFiles] = useState([]);
  const [jdFile, setJdFile] = useState(null);

  const [resumeResult, setResumeResult] = useState([]);
  const [jdResult, setJdResult] = useState(null);

  const [matchResults, setMatchResults] = useState([]);
  const [ranking, setRanking] = useState([]);

  const [error, setError] = useState("");

  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingJD, setUploadingJD] = useState(false);

  // ================= AI UX STATES =================

  const [resumeProgress, setResumeProgress] = useState(0);
  const [jdProgress, setJdProgress] = useState(0);

  const [resumeStatus, setResumeStatus] = useState("");
  const [jdStatus, setJdStatus] = useState("");

  const [resumeDone, setResumeDone] = useState(false);
  const [jdDone, setJdDone] = useState(false);

  const token = localStorage.getItem("token");

  // ================= LOGIN VIEW =================

  if (!loggedIn) {
    return <Auth onLogin={() => setLoggedIn(true)} />;
  }

  // ================= LOGOUT =================

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
  };

  // ================= HELPERS =================

  const extractSkillsFromText = (text = "") => {
    const lower = text.toLowerCase();

    const words = [
      "python","aws","docker","sql","fastapi","deep learning",
      "machine learning","react","node","kubernetes"
    ];

    const present = [];
    const missing = [];

    words.forEach((w) => {
      lower.includes(w) ? present.push(w) : missing.push(w);
    });

    return { present, missing };
  };

  // ================= UPLOAD RESUME =================

  const uploadResume = async () => {
    if (!resumeFiles.length) return alert("Select resumes first!");

    setUploadingResume(true);
    setResumeProgress(0);
    setResumeDone(false);
    setError("");

    const stages = [
      "Uploading resumes…",
      "Parsing documents…",
      "Extracting skills…",
      "Embedding vectors…",
      "Saving to AI index…",
    ];

    let i = 0;
    const timer = setInterval(() => {
      setResumeStatus(stages[i]);
      setResumeProgress((p) => Math.min(p + 20, 95));
      i++;
      if (i === stages.length) clearInterval(timer);
    }, 700);

    try {
      const formData = new FormData();
      resumeFiles.forEach((f) => formData.append("files", f));

      const res = await fetch(`${API_BASE}/ingest/resume`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      clearInterval(timer);

      setResumeResult(data.resumes || []);
      setResumeDone(true);
      setResumeProgress(100);
      setResumeStatus("Resume analysis complete ✅");

      setMatchResults([]);
      setRanking([]);

    } catch {
      setError("Resume upload failed.");
    } finally {
      setUploadingResume(false);
    }
  };

  // ================= UPLOAD JD =================

  const uploadJD = async () => {
    if (!jdFile) return alert("Select JD first!");

    setUploadingJD(true);
    setJdProgress(0);
    setJdDone(false);
    setError("");

    const stages = [
      "Uploading JD…",
      "Reading document…",
      "Extracting skills…",
      "Normalizing keywords…",
    ];

    let i = 0;
    const timer = setInterval(() => {
      setJdStatus(stages[i]);
      setJdProgress((p) => Math.min(p + 25, 95));
      i++;
      if (i === stages.length) clearInterval(timer);
    }, 800);

    try {
      const formData = new FormData();
      formData.append("file", jdFile);

      const res = await fetch(`${API_BASE}/ingest/jd`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      clearInterval(timer);

      setJdResult(data);
      setJdDone(true);
      setJdProgress(100);
      setJdStatus("JD analysis complete ✅");

      setMatchResults([]);
      setRanking([]);

    } catch {
      setError("JD upload failed.");
    } finally {
      setUploadingJD(false);
    }
  };

  // ================= MATCH =================

  const runMatch = async () => {
    if (!resumeResult.length || !jdResult?.skills)
      return alert("Upload BOTH resume & JD first!");

    const results = [];

    for (const resume of resumeResult) {
      const res = await fetch(`${API_BASE}/ingest/match`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          resume_skills: resume.skills,
          jd_skills: jdResult.skills,
        }),
      });

      const data = await res.json();

      const fallback = extractSkillsFromText(data.explanation);

      results.push({
        filename: resume.filename,
        strengths: data.strengths || fallback.present,
        missing: data.missing || fallback.missing,
        ...data,
      });
    }

    setMatchResults(results);
    setRanking([]);
  };

  // ================= RANK =================

  const runRanking = async () => {
    if (!resumeResult.length || !jdResult?.skills)
      return alert("Upload BOTH resume & JD first!");

    const res = await fetch(`${API_BASE}/ingest/rank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        resumes: resumeResult,
        jd_skills: jdResult.skills,
      }),
    });

    const data = await res.json();

    const sorted = [...data].sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0)
    );

    setRanking(sorted);
    setMatchResults([]);
  };

  // ================= UI =================

  return (
    <div className="god-dashboard">

      <header className="god-header">
        <h1>HireSense AI — Resume Screening</h1>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      {/* ================= UPLOAD RESUME ================= */}

      <section className="ultra-panel">
        <h2>📄 Upload Resume</h2>

        <div className="panel-row">
          <input
            type="file"
            multiple
            onChange={(e) => setResumeFiles([...e.target.files])}
          />

          <button
            className="neon-btn"
            disabled={uploadingResume || resumeDone}
            onClick={uploadResume}
          >
            {uploadingResume
              ? "🧠 AI Scanning…"
              : resumeDone
              ? "✅ Resume Ready"
              : "Analyze Resume"}
          </button>
        </div>

        {uploadingResume && (
          <div className="ai-progress">
            <div
              className="ai-progress-bar"
              style={{ width: `${resumeProgress}%` }}
            />
            <p>{resumeStatus}</p>
          </div>
        )}

        {resumeDone && <div className="ai-check">✔ Resume processed</div>}
      </section>

      {/* ================= UPLOAD JD ================= */}

      <section className="ultra-panel">
        <h2>📋 Upload Job Description</h2>

        <div className="panel-row">
          <input
            type="file"
            onChange={(e) => setJdFile(e.target.files[0])}
          />

          <button
            className="neon-btn"
            disabled={uploadingJD || jdDone}
            onClick={uploadJD}
          >
            {uploadingJD
              ? "🧠 AI Reading…"
              : jdDone
              ? "✅ JD Ready"
              : "Analyze JD"}
          </button>
        </div>

        {uploadingJD && (
          <div className="ai-progress">
            <div
              className="ai-progress-bar"
              style={{ width: `${jdProgress}%` }}
            />
            <p>{jdStatus}</p>
          </div>
        )}

        {jdDone && <div className="ai-check">✔ JD processed</div>}
      </section>

      {/* ================= ACTIONS ================= */}

      {resumeDone && jdDone && (
        <section className="ultra-panel center">
          <button className="neon-btn" onClick={runMatch}>
            🔍 Run Matching
          </button>

          <button className="neon-btn alt" onClick={runRanking}>
            🏆 Rank Candidates
          </button>
        </section>
      )}

      {/* ================= MATCH RESULTS ================= */}

      {matchResults.length > 0 && (
        <section className="ultra-panel">
          <h2>🧠 Match Results</h2>

          {matchResults.map((m, i) => (
            <div className="glass-row neon-border" key={i}>
              <h3>
                #{i + 1} — {m.filename}
              </h3>

              <p>Score: {(m.match_score ?? 0).toFixed(2)}%</p>

              <div className="ai-box">

                <div className="ai-title">🧠 AI Evaluation</div>

                {m.strengths?.length > 0 && (
                  <div className="ai-section">
                    <span className="ai-good">🟢 Strengths:</span>
                    <div className="ai-tags">
                      {m.strengths.map((s, idx) => (
                        <span key={idx} className="ai-tag good">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {m.missing?.length > 0 && (
                  <div className="ai-section">
                    <span className="ai-bad">🔴 Missing Skills:</span>
                    <div className="ai-tags">
                      {m.missing.map((s, idx) => (
                        <span key={idx} className="ai-tag bad">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="ai-verdict">
                  📊 {m.explanation}
                </div>

              </div>

            </div>
          ))}
        </section>
      )}

      {/* ================= PRO RANKING ================= */}

      {ranking.length > 0 && (
        <section className="ultra-panel leaderboard-panel">

          <h2 className="leaderboard-title">
            🏆 AI Candidate Ranking
          </h2>

          {ranking.map((r, i) => {

            const score = (r.score ?? 0).toFixed(2);

            const fit =
              score >= 70 ? "Strong Fit" :
              score >= 40 ? "Moderate Fit" :
              "Low Fit";

            return (
              <div
                key={i}
                className={`rank-card rank-${i + 1}`}
              >

                <div className="rank-left">

                  <div className="rank-badge">
                    {i === 0 ? "👑" : `#${i + 1}`}
                  </div>

                  <div>
                    <h3 className="rank-name">
                      {r.filename}
                    </h3>

                    <span
                      className={`fit-tag fit-${fit.replace(" ", "").toLowerCase()}`}
                    >
                      {fit}
                    </span>
                  </div>

                </div>

                <div className="rank-right">

                  <div className="score-bar-wrap">
                    <div
                      className="score-bar"
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <div className="rank-score">
                    {score}%
                  </div>

                </div>

              </div>
            );
          })}
        </section>
      )}

    </div>
  );
}
