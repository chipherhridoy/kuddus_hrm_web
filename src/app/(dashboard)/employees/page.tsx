"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { UserDto } from "@/lib/types";

export default function EmployeesPage() {
  const { isAdmin } = useAuth();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Employee");
  const [department, setDepartment] = useState("Engineering");
  const [designation, setDesignation] = useState("Software Engineer");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    fetchApi("/users")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: UserDto[]) => {
        if (isMounted) {
          setUsers(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  const handleRefresh = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setBannerMessage("⚠️ Name and Password are required.");
      return;
    }

    setSubmitting(true);
    setBannerMessage(null);
    try {
      const res = await fetchApi("/users", {
        method: "POST",
        body: JSON.stringify({
          name,
          email: email.trim() || undefined,
          password,
          role,
          department,
          designation,
        }),
      });

      if (res.ok) {
        setBannerMessage(`✅ Employee "${name}" added to organization!`);
        setShowModal(false);
        setName("");
        setEmail("");
        setPassword("");
        setRefreshKey((k) => k + 1);
      } else {
        const err = await res.json().catch(() => ({ message: "Failed to create user" }));
        setBannerMessage(`⚠️ ${err.message || "Failed to create user."}`);
      }
    } catch {
      setBannerMessage("❌ Error communicating with backend server.");
    } finally {
      setSubmitting(false);
    }
  };

  const departments = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.designation.toLowerCase().includes(search.toLowerCase());

    const matchesDept =
      departmentFilter === "All" ? true : u.department === departmentFilter;

    const matchesRole =
      roleFilter === "All" ? true : u.role === roleFilter;

    return matchesSearch && matchesDept && matchesRole;
  });

  const enrolledCount = users.filter((u) => u.faceEnrolled).length;
  const adminCount = users.filter((u) => u.role === "Admin").length;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage organization members, credentials, and biometric registration
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Add New Staff</span>
            </button>
          )}

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {bannerMessage && (
        <div className="p-4 rounded-xl bg-slate-900 text-white text-xs font-medium flex items-center justify-between shadow-sm">
          <span>{bannerMessage}</span>
          <button
            onClick={() => setBannerMessage(null)}
            className="text-xs text-slate-400 hover:text-white px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="corp-card p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="corp-input w-full pl-10 text-xs py-2"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="corp-input text-xs py-2 w-full sm:w-auto"
          >
            <option value="All">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="corp-input text-xs py-2 w-full sm:w-auto"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Employee">Employee</option>
          </select>
        </div>

        {/* Directory Metrics */}
        <div className="flex items-center gap-3 text-xs self-start md:self-auto">
          <span className="text-slate-500">
            Total: <strong className="text-slate-900">{users.length}</strong>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-700 font-semibold">{adminCount} Admins</span>
          <span className="text-slate-300">|</span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {enrolledCount} Face ID Enrolled
          </span>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading employee directory...</span>
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full corp-card p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
            No employees match your filter.
          </div>
        ) : (
          filteredUsers.map((emp) => (
            <div
              key={emp.id}
              className="corp-card p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between corp-card-hover"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-sm shadow-xs">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">{emp.name}</h3>
                      <p className="text-xs text-slate-500">{emp.designation}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${
                      emp.role === "Admin"
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <p className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-medium text-slate-800">{emp.department}</span>
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-mono text-slate-700 truncate">{emp.email}</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Biometric:</span>
                {emp.faceEnrolled ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Face Enrolled
                  </span>
                ) : (
                  <span className="text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 font-medium">
                    Not Enrolled
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Employee Modal (Admin Only) */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Organization Staff</h3>
                <p className="text-xs text-slate-500">Create employee credentials in Cloud PostgreSQL</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Nusrat Jahan"
                  className="corp-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nusrat@kuddus.com"
                    className="corp-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Account Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="corp-input w-full font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="corp-input w-full"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="QA"
                    className="corp-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="QA Engineer"
                    className="corp-input w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2 text-xs font-semibold rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
