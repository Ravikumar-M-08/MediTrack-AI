import React, { useState, useEffect } from "react";
import {
  Users,
  UserCog,
  Plus,
  Search,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial tab from URL (?tab=patients / ?tab=doctors), default to DOCTORS
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam === "patients" ? "PATIENTS" : "DOCTORS";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Keep activeTab in sync whenever the URL's ?tab= changes (sidebar nav)
  useEffect(() => {
    const t = searchParams.get("tab");
    setActiveTab(t === "patients" ? "PATIENTS" : "DOCTORS");
  }, [searchParams]);

  // Update the URL when a tab button inside the page is clicked
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === "PATIENTS" ? { tab: "patients" } : { tab: "doctors" });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, patientsRes] = await Promise.all([
        api.get("/users/doctors"),
        api.get("/users/patients"),
      ]);
      setDoctors(docsRes.data);
      setPatients(patientsRes.data);
    } catch (err) {
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (e, id, name) => {
    e.stopPropagation();
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Deleted successfully");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-8 rounded-[2rem] shadow-sm border border-base-300">
          <div>
            <div className="flex items-center gap-2 text-primary mb-1">
              <ShieldCheck size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Administrative Portal
              </span>
            </div>
            <h1 className="text-3xl font-black">System Control</h1>
          </div>
          <button
              onClick={() =>
                navigate(activeTab === "DOCTORS" ? "/admin/add-doctor" : "/add-patient")
              }
              className="btn btn-primary rounded-2xl gap-2 font-black"
            >
              <Plus size={20} />
              {activeTab === "DOCTORS" ? "Add New Doctor" : "Add New Patient"}
            </button>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 p-2 rounded-2xl border border-base-300 w-fit mx-auto md:mx-0">
          <button
            className={`tab gap-2 font-bold px-8 ${
              activeTab === "DOCTORS"
                ? "tab-active !bg-primary !text-white"
                : ""
            }`}
            onClick={() => handleTabChange("DOCTORS")}
          >
            <UserCog size={18} /> Staff (Doctors)
          </button>
          <button
            className={`tab gap-2 font-bold px-8 ${
              activeTab === "PATIENTS"
                ? "tab-active !bg-primary !text-white"
                : ""
            }`}
            onClick={() => handleTabChange("PATIENTS")}
          >
            <Users size={18} /> Patients
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-base-100 rounded-[2rem] shadow-sm border border-base-300 overflow-hidden">
          <div className="p-6 border-b border-base-200 flex justify-between items-center">
            <h2 className="font-black text-lg">
              {activeTab === "DOCTORS"
                ? "Medical Staff List"
                : "Patient Directory"}
            </h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                size={16}
              />
              <input
                type="text"
                placeholder="Search records..."
                className="input input-sm bg-base-200 rounded-lg pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-base-200/50">
                <tr className="text-[10px] font-black uppercase opacity-50 border-none">
                  <th>
                    {activeTab === "DOCTORS" ? "Name / Dept" : "Name / MRN"}
                  </th>
                  <th>Contact/Visit</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16">
                      <span className="loading loading-spinner loading-lg text-primary"></span>
                    </td>
                  </tr>
                ) : activeTab === "DOCTORS" ? (
                  filteredDoctors.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-16 opacity-40 italic">
                        No doctors found.
                      </td>
                    </tr>
                  ) : (
                    filteredDoctors.map((doc) => (
                      <tr key={doc._id} className="hover:bg-base-200/30">
                        <td>
                          <div className="font-bold">{doc.name}</div>
                          <div className="text-[10px] opacity-50 font-black">
                            {doc.specialization}
                          </div>
                        </td>
                        <td className="text-sm">{doc.email}</td>
                        <td className="text-right">
                          <button
                            onClick={(e) => handleDelete(e, doc._id, doc.name)}
                            className="btn btn-ghost btn-xs text-error"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-16 opacity-40 italic">
                      No patients found.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((pat) => (
                    <tr key={pat._id} className="hover:bg-base-200/30">
                      <td>
                        <div className="font-bold">{pat.name}</div>
                        <div className="text-[10px] opacity-50 font-black">
                          {pat.mrn}
                        </div>
                      </td>
                      <td className="text-sm">
                        Last Seen:{" "}
                        {pat.lastVisit
                          ? new Date(pat.lastVisit).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={(e) => handleDelete(e, pat._id, pat.name)}
                          className="btn btn-ghost btn-xs text-error"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;