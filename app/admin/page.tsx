"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { NBCard } from "@/components/nb/NBCard";
import { NBButton } from "@/components/nb/NBButton";
import { NBTable } from "@/components/nb/NBTable";
import { NBAlert } from "@/components/nb/NBAlert";
import { NBSticker } from "@/components/nb/NBSticker";
import { NBTabs } from "@/components/nb/NBTabs";
import { ShieldAlert, Save, FileJson, Calendar, Activity, Check } from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("timetables");

  const [timetables, setTimetables] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("2-ece-a.json");
  const [jsonText, setJsonText] = useState("");

  const [holidaysText, setHolidaysText] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Load Timetables
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/timetables");
        if (res.ok) {
          const data = await res.json();
          setTimetables(data.timetables || []);
          const first = data.timetables?.[0];
          if (first) {
            setSelectedFile(first.filename);
            setJsonText(JSON.stringify(first.content, null, 2));
          }
        }

        const holRes = await fetch("/api/admin/holidays");
        if (holRes.ok) {
          const holData = await holRes.json();
          setHolidaysText(JSON.stringify(holData.holidays || [], null, 2));
        }

        const auditRes = await fetch("/api/admin/audit");
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setAuditLogs(auditData.logs || []);
        }
      } catch (err) {
        console.error("Admin data loading failed:", err);
      }
    }
    loadData();
  }, []);

  const handleSelectFile = (filename: string) => {
    setSelectedFile(filename);
    const item = timetables.find((t) => t.filename === filename);
    if (item) {
      setJsonText(JSON.stringify(item.content, null, 2));
    }
  };

  const handleSaveTimetable = async () => {
    setStatusMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (e: any) {
        setErrorMsg(`JSON Parse Error: ${e.message}`);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/timetables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: selectedFile, content: parsed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update timetable");
      } else {
        setStatusMsg("✓ Timetable updated and validated successfully!");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch {
      setErrorMsg("Failed to send timetable update.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHolidays = async () => {
    setStatusMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      let parsed;
      try {
        parsed = JSON.parse(holidaysText);
      } catch (e: any) {
        setErrorMsg(`JSON Parse Error: ${e.message}`);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ holidays: parsed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update holidays");
      } else {
        setStatusMsg("✓ Holidays list updated successfully!");
        setTimeout(() => setStatusMsg(""), 4000);
      }
    } catch {
      setErrorMsg("Failed to update holidays.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Admin Header */}
      <div className="bg-nb-purple border-[3px] border-nb-ink p-6 shadow-[6px_6px_0px_#0A0A0A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <NBSticker text="ADMINISTRATIVE CONSOLE" color="yellow" rotation="-2deg" />
          </div>
          <h1 className="font-heading uppercase font-black text-2xl sm:text-3xl text-nb-ink">
            TIMETABLE &amp; CURRICULUM MANAGEMENT
          </h1>
          <p className="font-mono text-xs text-zinc-900 font-bold">
            Logged in as Faculty Admin: {session?.user?.name} ({session?.user?.email})
          </p>
        </div>

        <div className="bg-white px-3 py-1.5 border-2 border-nb-ink font-mono text-xs font-black">
          AUTUMN SEMESTER 2026
        </div>
      </div>

      {statusMsg && (
        <NBAlert variant="safe" title="Operation Successful">
          {statusMsg}
        </NBAlert>
      )}

      {errorMsg && (
        <NBAlert variant="danger" title="Validation / Submission Error">
          {errorMsg}
        </NBAlert>
      )}

      {/* Tabs */}
      <NBTabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "timetables", label: "Timetable Editor (JSON)" },
          { id: "holidays", label: "Holiday Master (2026)" },
          { id: "audit", label: "Audit & Access Log", badge: auditLogs.length },
        ]}
      />

      {/* Tab 1: Timetable Editor */}
      {activeTab === "timetables" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* File Selector */}
          <div className="lg:col-span-1 bg-white border-[3px] border-nb-ink p-4 shadow-[4px_4px_0px_#0A0A0A] space-y-2">
            <h3 className="font-heading uppercase font-black text-xs text-zinc-600 mb-2">
              Select Section Timetable:
            </h3>
            <div className="space-y-1.5 font-mono text-xs">
              {timetables.map((t) => (
                <button
                  key={t.filename}
                  onClick={() => handleSelectFile(t.filename)}
                  className={`w-full text-left p-2 border-2 border-nb-ink font-bold transition-all ${
                    selectedFile === t.filename
                      ? "bg-nb-yellow shadow-[2px_2px_0px_#0A0A0A] -translate-y-0.5"
                      : "bg-white hover:bg-zinc-100"
                  }`}
                >
                  <div className="truncate">{t.filename}</div>
                  <div className="text-[10px] text-zinc-500 font-normal">
                    {t.content?.section?.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* JSON Textarea */}
          <div className="lg:col-span-3 bg-white border-[3px] border-nb-ink p-5 shadow-[4px_4px_0px_#0A0A0A] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-[2px] border-nb-ink">
              <div>
                <h3 className="font-heading uppercase font-black text-sm text-nb-ink">
                  Editing: {selectedFile}
                </h3>
                <p className="font-mono text-xs text-zinc-500">
                  Modifications undergo strict Zod schema validation before persistence.
                </p>
              </div>

              <NBButton size="sm" variant="primary" onClick={handleSaveTimetable} disabled={loading}>
                <Save className="w-4 h-4 mr-1.5" />
                {loading ? "Validating..." : "Save & Synchronize"}
              </NBButton>
            </div>

            <textarea
              rows={22}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full p-4 font-mono text-xs bg-zinc-900 text-yellow-300 border-[3px] border-nb-ink shadow-[3px_3px_0px_#0A0A0A] focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Holidays Editor */}
      {activeTab === "holidays" && (
        <div className="bg-white border-[3px] border-nb-ink p-6 shadow-[6px_6px_0px_#0A0A0A] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-[2px] border-nb-ink">
            <div>
              <h3 className="font-heading uppercase font-black text-base text-nb-ink">
                Semester Holidays List (holidays-2026.json)
              </h3>
              <p className="font-mono text-xs text-zinc-600">
                Dates must be YYYY-MM-DD between 2026-08-29 and 2026-11-29.
              </p>
            </div>
            <NBButton size="sm" variant="primary" onClick={handleSaveHolidays} disabled={loading}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Holiday Schedule
            </NBButton>
          </div>

          <textarea
            rows={16}
            value={holidaysText}
            onChange={(e) => setHolidaysText(e.target.value)}
            className="w-full p-4 font-mono text-xs bg-zinc-900 text-green-300 border-[3px] border-nb-ink shadow-[3px_3px_0px_#0A0A0A] focus:outline-none leading-relaxed"
            spellCheck={false}
          />
        </div>
      )}

      {/* Tab 3: Audit Log */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <div className="bg-white border-[3px] border-nb-ink p-4 shadow-[4px_4px_0px_#0A0A0A] flex items-center justify-between">
            <h3 className="font-heading uppercase font-black text-sm text-nb-ink flex items-center gap-2">
              <Activity className="w-4 h-4" />
              System Audit Trail (Latest 50 Events)
            </h3>
            <span className="font-mono text-xs font-bold text-zinc-500">
              Auto-logged on auth &amp; modifications
            </span>
          </div>

          <NBTable headers={["Timestamp", "Action", "Details", "Initiated By"]}>
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-zinc-50 font-mono text-xs">
                <td className="px-3 py-2.5 border-r-[2px] border-nb-ink text-zinc-600 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </td>
                <td className="px-3 py-2.5 border-r-[2px] border-nb-ink font-bold text-nb-ink">
                  {log.action}
                </td>
                <td className="px-3 py-2.5 border-r-[2px] border-nb-ink text-zinc-800">
                  {log.details}
                </td>
                <td className="px-3 py-2.5 font-bold text-zinc-600">
                  {log.user ? `${log.user.name} (${log.user.regNo})` : "System / Anonymous"}
                </td>
              </tr>
            ))}
          </NBTable>
        </div>
      )}
    </div>
  );
}
