import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Plus,
  Trash2,
  RefreshCw,
  Key,
  Shield,
  GraduationCap,
  BookOpen,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  X
} from "lucide-react";
import { showSweetToast, showConfirmAlert } from "../../utils/sweetAlert";

export const AdminUsersTab = ({ token, targetRoleFilter = "all" }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(targetRoleFilter);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState("");

  // Create form state
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: targetRoleFilter !== "all" ? targetRoleFilter : "student",
    department: "Computer Science & Engineering",
    rollNumber: "",
    title: ""
  });

  // Sync roleFilter if targetRoleFilter prop changes
  useEffect(() => {
    if (targetRoleFilter !== "all") {
      setRoleFilter(targetRoleFilter);
    }
  }, [targetRoleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        role: roleFilter,
        status: statusFilter,
        department: departmentFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        const err = await res.json();
        showSweetToast(err.error || "Failed to fetch users", "error");
      }
    } catch (e) {
      console.error("Error fetching users:", e);
      showSweetToast("Network error fetching users directory", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, pagination.limit, roleFilter, statusFilter, departmentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    fetchUsers();
  };

  // Toggle Account Active / Inactive
  const handleToggleStatus = async (user) => {
    const nextStatus = !user.isActive;
    const confirmText = nextStatus
      ? `Activate account for ${user.name}? They will be able to log in.`
      : `Deactivate account for ${user.name}? Their active sessions will be terminated immediately.`;

    const confirmed = await showConfirmAlert(
      nextStatus ? "Activate Account?" : "Deactivate Account?",
      confirmText,
      nextStatus ? "Activate" : "Deactivate",
      "Cancel",
      nextStatus ? "info" : "warning"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: nextStatus })
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "Account status updated", "success");
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: nextStatus } : u));
      } else {
        showSweetToast(data.error || "Action rejected by server", "error");
      }
    } catch (err) {
      showSweetToast("Network error modifying account status", "error");
    }
  };

  // Change Role
  const handleChangeRole = async (user, newRole) => {
    if (user.role === newRole) return;
    const confirmed = await showConfirmAlert(
      "Update Role Assignment?",
      `Change role of ${user.name} from '${user.role}' to '${newRole}'? Their access permissions will be adjusted immediately.`,
      "Update Role",
      "Cancel",
      "warning"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "User role updated successfully", "success");
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      } else {
        showSweetToast(data.error || "Failed to update role", "error");
      }
    } catch (err) {
      showSweetToast("Network error updating user role", "error");
    }
  };

  // Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUserForReset.id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPasswordInput || undefined })
      });

      const data = await res.json();
      if (res.ok) {
        setIsResetModalOpen(false);
        showSweetToast(`Password reset. Temporary password: ${data.temporaryPassword}`, "success", 5000);
      } else {
        showSweetToast(data.error || "Password reset failed", "error");
      }
    } catch (err) {
      showSweetToast("Network error resetting password", "error");
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    const confirmed = await showConfirmAlert(
      "Permanently Delete User?",
      `Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone.`,
      "Delete Permanently",
      "Cancel",
      "warning"
    );

    if (!confirmed.isConfirmed) return;

    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(data.message || "User deleted", "success");
        setUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        showSweetToast(data.error || "Failed to delete user", "error");
      }
    } catch (err) {
      showSweetToast("Network error deleting user", "error");
    }
  };

  // Create User
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(createForm)
      });

      const data = await res.json();
      if (res.ok) {
        showSweetToast(`User '${data.user?.name}' created successfully`, "success");
        setIsCreateModalOpen(false);
        setCreateForm({
          name: "",
          email: "",
          password: "",
          role: targetRoleFilter !== "all" ? targetRoleFilter : "student",
          department: "Computer Science & Engineering",
          rollNumber: "",
          title: ""
        });
        fetchUsers();
      } else {
        showSweetToast(data.error || "Could not create user", "error");
      }
    } catch (err) {
      showSweetToast("Network error creating user", "error");
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">Admin</span>;
      case "teacher":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">Faculty</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">Student</span>;
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Controls: Search, Filters & Action Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, roll number, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Role Filter */}
          {targetRoleFilter === "all" && (
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(p => ({ ...p, page: 1 }));
              }}
              className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students Only</option>
              <option value="teacher">Faculty / Teachers</option>
              <option value="admin">Administrators</option>
            </select>
          )}

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title="Refresh Users Directory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          {/* Add User Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-3 px-4 font-semibold">User</th>
                <th className="py-3 px-4 font-semibold">Role</th>
                <th className="py-3 px-4 font-semibold">Department / Info</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    {loading ? "Loading users directory..." : "No users found matching current filters."}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{user.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user, e.target.value)}
                          className="bg-slate-950 border border-slate-700 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-indigo-500"
                          title="Assign new role"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Faculty</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{user.department || "General Academic"}</div>
                      {user.rollNumber && (
                        <div className="text-[11px] text-indigo-400 font-mono">Roll: {user.rollNumber}</div>
                      )}
                      {user.title && (
                        <div className="text-[11px] text-slate-400">{user.title}</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                        }`}
                        title="Click to toggle account activation"
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            <span>Deactivated</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUserForReset(user);
                            setNewPasswordInput("");
                            setIsResetModalOpen(true);
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          disabled={user.id === "usr_admin_01"}
                          className={`p-1.5 rounded border transition-colors ${
                            user.id === "usr_admin_01"
                              ? "opacity-30 cursor-not-allowed border-transparent text-slate-600"
                              : "bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border-slate-700 hover:border-rose-800"
                          }`}
                          title={user.id === "usr_admin_01" ? "Root Admin protected" : "Delete Account"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-slate-200">{users.length}</strong> of{" "}
            <strong className="text-slate-200">{pagination.total}</strong> users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create Institutional Account</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Dr. Priya Patel or Rohan Verma"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="e.g. user@intelligrade.edu"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Assigned Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Faculty / Teacher</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Roll No / ID</label>
                  <input
                    type="text"
                    value={createForm.rollNumber}
                    onChange={(e) => setCreateForm({ ...createForm, rollNumber: e.target.value })}
                    placeholder="e.g. CS-2026-105"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Department</label>
                <input
                  type="text"
                  value={createForm.department}
                  onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  placeholder="Department Name"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>Reset User Password</span>
              </h3>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Resetting password for <strong className="text-white">{selectedUserForReset.name}</strong> ({selectedUserForReset.email}). Any existing active sessions will be terminated.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Password (Leave empty for auto-generated temp password)</label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="e.g. CustomPass@2026"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold shadow-xs"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
