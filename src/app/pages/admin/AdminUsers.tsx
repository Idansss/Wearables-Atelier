import { useEffect, useState } from "react";
import {
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "../../context/AdminContext";
import {
  deleteAdminUser,
  getAdminUsers,
  logAdminAction,
  saveAdminUser,
  updateAdminUser,
  type AdminUser,
  type AdminUserInput,
} from "../../lib/db";

const emptyForm: AdminUserInput = {
  email: "",
  role: "editor",
  isActive: true,
};

type PanelProps = {
  form: AdminUserInput;
  editingId: string | null;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: <K extends keyof AdminUserInput>(key: K, value: AdminUserInput[K]) => void;
};

function AdminPanel({
  form,
  editingId,
  saving,
  error,
  onClose,
  onSubmit,
  onChange,
}: PanelProps) {
  const isEdit = !!editingId;
  const inputCls =
    "w-full px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white";
  const inputStyle = {
    borderColor: "rgba(13,13,13,0.2)",
    color: "#0D0D0D",
    fontFamily: "'DM Sans', sans-serif",
  };
  const labelCls = "text-xs tracking-[0.12em] uppercase block mb-1.5 font-semibold";
  const labelStyle = { color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg h-full overflow-y-auto"
        style={{ backgroundColor: "#F8F5F0" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: "#F8F5F0", borderColor: "rgba(13,13,13,0.12)" }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "22px",
              fontWeight: 300,
              color: "#0D0D0D",
            }}
          >
            {isEdit ? "Edit Admin Access" : "Add Admin Access"}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:opacity-60"
          >
            <X size={18} style={{ color: "#6B6560" }} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>
              Admin Email
            </label>
            <input
              type="email"
              className={inputCls}
              style={inputStyle}
              value={form.email}
              onChange={(e) => onChange("email", e.target.value.toLowerCase())}
              readOnly={isEdit}
              required
            />
            {isEdit && (
              <p className="mt-1 text-xs" style={{ color: "#6B6560" }}>
                Email is locked on existing records to avoid breaking access mappings.
              </p>
            )}
          </div>

          <div>
            <label className={labelCls} style={labelStyle}>
              Role
            </label>
            <select
              title="Admin role"
              className={inputCls}
              style={inputStyle}
              value={form.role}
              onChange={(e) => onChange("role", e.target.value as AdminUserInput["role"])}
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <label
            className="flex items-center gap-3 border px-4 py-3 cursor-pointer"
            style={{ borderColor: "rgba(13,13,13,0.12)", backgroundColor: "#fff" }}
          >
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => onChange("isActive", e.target.checked)}
              className="accent-[#C9A84C]"
            />
            <span className="text-sm" style={{ color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}>
              Admin access active
            </span>
          </label>

          {error && (
            <p className="text-xs" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs tracking-[0.12em] uppercase font-semibold disabled:opacity-50"
              style={{
                backgroundColor: "#C9A84C",
                color: "#0D0D0D",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Access"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs tracking-[0.12em] uppercase font-semibold border hover:opacity-70"
              style={{
                borderColor: "rgba(13,13,13,0.2)",
                color: "#6B6560",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { user } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminUserInput>(emptyForm);
  const [actionId, setActionId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setAdmins(await getAdminUsers());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  function set<K extends keyof AdminUserInput>(key: K, value: AdminUserInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setPanelOpen(true);
  }

  function openEdit(admin: AdminUser) {
    setEditingId(admin.id);
    setForm({
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
    });
    setError("");
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingId(null);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await updateAdminUser(editingId, {
          role: form.role,
          isActive: form.isActive,
        });
        if (user) {
          void logAdminAction(user.id, user.email ?? "", "admin_user_updated", {
            adminId: editingId,
            email: form.email,
            role: form.role,
            isActive: form.isActive,
          });
        }
        toast.success("Admin access updated");
      } else {
        const newEmail = form.email.trim().toLowerCase();
        await saveAdminUser({
          email: newEmail,
          role: form.role,
          isActive: form.isActive,
        });
        if (user) {
          void logAdminAction(user.id, user.email ?? "", "admin_user_created", {
            email: newEmail,
            role: form.role,
          });
        }
        toast.success("Admin access granted");
      }
      await load();
      closePanel();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save admin access";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(admin: AdminUser) {
    setActionId(admin.id);
    try {
      await updateAdminUser(admin.id, { isActive: !admin.isActive });
      await load();
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(admin: AdminUser) {
    if (!window.confirm(`Delete admin access for ${admin.email}?`)) {
      return;
    }

    setActionId(admin.id);
    try {
      await deleteAdminUser(admin.id);
      if (user) {
        void logAdminAction(user.id, user.email ?? "", "admin_user_deleted", {
          adminId: admin.id,
          email: admin.email,
        });
      }
      toast.success(`Removed admin access for ${admin.email}`);
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete admin access");
    } finally {
      setActionId(null);
    }
  }

  const currentEmail = user?.email?.toLowerCase() ?? "";

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontWeight: 300,
              fontSize: "32px",
              color: "#0D0D0D",
              lineHeight: 1.2,
            }}
          >
            Admin Users
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            Manage which signed-in accounts can open the admin dashboard.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/account"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold border"
            style={{
              borderColor: "rgba(13,13,13,0.18)",
              color: "#0D0D0D",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <ExternalLink size={13} />
            Open Account Page
          </a>
          <button
            type="button"
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold"
            style={{
              backgroundColor: "#C9A84C",
              color: "#0D0D0D",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Plus size={14} />
            Add Admin
          </button>
        </div>
      </div>

      <div
        className="flex items-start gap-2.5 px-4 py-3 mb-6 text-xs border-l-2"
        style={{
          borderColor: "#C9A84C",
          backgroundColor: "rgba(201,168,76,0.08)",
          color: "#6B6560",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Shield size={13} className="mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
        <span>
          Grant access by email, then have that person sign in on the public account page. The
          dashboard checks the signed-in email against this list.
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={28} className="animate-spin" style={{ color: "#C9A84C" }} />
        </div>
      ) : admins.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Shield size={36} style={{ color: "rgba(13,13,13,0.15)" }} />
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: "20px",
              fontWeight: 300,
              color: "#6B6560",
            }}
          >
            No admin access records yet
          </p>
          <p className="text-xs" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            Add your first admin above.
          </p>
        </div>
      ) : (
        <div
          className="border overflow-x-auto"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(13,13,13,0.1)" }}>
                {["Email", "Role", "Status", "Created", ""].map((heading) => (
                  <th
                    key={heading}
                    className="text-left px-4 py-3 text-xs tracking-[0.1em] uppercase font-semibold"
                    style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {admins.map((admin, index) => {
                const isCurrentUser = admin.email === currentEmail;
                return (
                  <tr
                    key={admin.id}
                    style={{
                      borderBottom:
                        index < admins.length - 1 ? "1px solid rgba(13,13,13,0.07)" : "none",
                    }}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span style={{ color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" }}>
                          {admin.email}
                        </span>
                        {isCurrentUser && (
                          <span
                            className="text-[10px] uppercase tracking-[0.1em] px-2 py-1"
                            style={{
                              backgroundColor: "rgba(201,168,76,0.12)",
                              color: "#0D0D0D",
                              fontFamily: "'DM Sans', sans-serif",
                            }}
                          >
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-xs tracking-[0.1em] uppercase px-2.5 py-1"
                        style={{
                          backgroundColor: "rgba(13,13,13,0.06)",
                          color: "#0D0D0D",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => toggleActive(admin)}
                        disabled={actionId === admin.id}
                        className="text-xs tracking-[0.08em] uppercase font-semibold px-2.5 py-1 disabled:opacity-50"
                        style={{
                          backgroundColor: admin.isActive
                            ? "rgba(34,197,94,0.12)"
                            : "rgba(107,101,96,0.1)",
                          color: admin.isActive ? "#16a34a" : "#6B6560",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {actionId === admin.id ? "..." : admin.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-xs" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                      {admin.createdAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(admin)}
                          title="Edit"
                          className="w-8 h-8 flex items-center justify-center border"
                          style={{ borderColor: "rgba(13,13,13,0.16)", color: "#0D0D0D" }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(admin)}
                          title="Delete"
                          disabled={isCurrentUser || actionId === admin.id}
                          className="w-8 h-8 flex items-center justify-center border disabled:opacity-35"
                          style={{ borderColor: "rgba(13,13,13,0.16)", color: "#e53935" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!panelOpen && error && (
        <p className="mt-3 text-xs" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>
          {error}
        </p>
      )}

      {panelOpen && (
        <AdminPanel
          form={form}
          editingId={editingId}
          saving={saving}
          error={error}
          onClose={closePanel}
          onSubmit={handleSubmit}
          onChange={set}
        />
      )}
    </div>
  );
}
