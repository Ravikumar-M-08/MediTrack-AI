import React, { useEffect, useState } from "react";
import { FileText, Search, Calendar, User, ExternalLink, FileCheck2, Clock } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const DoctorReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await api.get("/reports/doctor-reports");
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReports(sorted);
      } catch (err) {
        toast.error("Failed to load reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (report) =>
      report.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <FileText className="text-primary" size={36} /> Patient Reports
          </h1>
          <p className="opacity-60 font-medium mt-1">
            Reports and diagnostics you've uploaded for your patients
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
          <input
            type="text"
            placeholder="Search by name or patient..."
            className="input input-bordered w-full pl-12 rounded-[1.5rem] bg-base-100 shadow-sm focus:ring-2 focus:ring-primary/20 border-base-300 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <div
            key={report._id}
            className="group bg-base-100 border border-base-300 rounded-[2.5rem] p-7 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 blur-2xl ${
                report.status === "Analyzed" ? "bg-success" : "bg-warning"
              }`}
            />

            <div className="space-y-5">
              <div className="flex justify-between items-center">
                <span
                  className={`badge badge-md gap-2 font-black uppercase py-4 px-4 rounded-2xl border-none ${
                    report.status === "Analyzed"
                      ? "bg-success/10 text-success"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  {report.status === "Analyzed" ? <FileCheck2 size={14} /> : <Clock size={14} />}
                  {report.status}
                </span>
                <span className="text-[10px] font-bold opacity-20 uppercase tracking-tighter">
                  Ref: {report._id.slice(-6)}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black leading-tight group-hover:text-primary transition-colors duration-300">
                  {report.reportName}
                </h3>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                    <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
                      <User size={14} />
                    </div>
                    {report.patient?.name}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                    <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center">
                      <Calendar size={14} />
                    </div>
                    {new Date(report.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-base-200">
                
                <a  href={report.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full rounded-2xl gap-2 font-black shadow-lg shadow-primary/20"
                >
                  <ExternalLink size={18} /> View Report
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-base-200/30 rounded-[3rem] border-2 border-dashed border-base-300">
          <FileText size={80} className="opacity-10 mb-4" />
          <h2 className="text-2xl font-black opacity-30 tracking-tight">No Reports Found</h2>
          <p className="opacity-20 font-medium">
            Reports you upload during consultations will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoctorReports;