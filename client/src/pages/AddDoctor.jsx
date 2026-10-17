import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, Save, Mail, Lock, User, Stethoscope, Info } from "lucide-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const AddDoctor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "DOCTOR",
        code: import.meta.env.VITE_DOCTOR_AUTH_CODE,
      });
      toast.success("Doctor account created");
      navigate("/admin-dashboard?tab=doctors");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create doctor");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      key: "name",
      label: "Full Name",
      icon: <User size={14} />,
      type: "text",
      placeholder: "Dr. John Doe",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      icon: <Mail size={14} />,
      type: "email",
      placeholder: "john.doe@hospital.com",
      required: true,
    },
    {
      key: "password",
      label: "Password",
      icon: <Lock size={14} />,
      type: "password",
      placeholder: "••••••••",
      required: true,
    },
    {
      key: "specialization",
      label: "Specialization",
      icon: <Stethoscope size={14} />,
      type: "text",
      placeholder: "e.g. Cardiology",
      required: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-circle">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="text-primary" /> Register New Doctor
          </h1>
        </div>
        <p className="text-sm opacity-60 flex items-center gap-1 ml-14">
          <Info size={14} /> Admin Panel: Create a new doctor account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-sm border border-base-300 rounded-[2rem]">
        <div className="card-body gap-5 p-8">
          {fields.map((field) => (
            <div key={field.key} className="form-control w-full">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-primary mb-1.5">
                {field.icon}
                <span>{field.label}</span>
                {field.required && <span className="text-error">*</span>}
              </label>
              <input
                type={field.type}
                className="input input-bordered w-full"
                placeholder={field.placeholder}
                required={field.required}
                value={formData[field.key]}
                onChange={(e) =>
                  setFormData({ ...formData, [field.key]: e.target.value })
                }
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-5 border-t border-base-200 mt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary px-10 shadow-lg shadow-primary/30"
            >
              {loading ? <span className="loading loading-spinner"></span> : <Save size={18} />}
              Create Doctor
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;