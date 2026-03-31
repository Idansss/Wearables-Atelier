import { useEffect, useState, useCallback, useRef } from "react";
import { Upload, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getFlyers,
  saveFlyer,
  setFlyerActive,
  deleteFlyer,
  type Flyer,
} from "../../lib/db";
import { uploadImageFile } from "../../lib/uploads";

export default function Flyers() {
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [delaySeconds, setDelaySeconds] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      setFlyers(await getFlyers());
    } catch {
      toast.error("Failed to load flyers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    if (picked) {
      setPreview(URL.createObjectURL(picked));
    } else {
      setPreview(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Please select an image"); return; }
    setUploading(true);
    try {
      const imageUrl = await uploadImageFile(file, "flyers");
      await saveFlyer({ imageUrl, title, delaySeconds });
      toast.success("Flyer uploaded");
      setFile(null);
      setPreview(null);
      setTitle("");
      setDelaySeconds(5);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleToggleActive(flyer: Flyer) {
    setActionId(flyer.id);
    try {
      await setFlyerActive(flyer.id, !flyer.isActive);
      toast.success(flyer.isActive ? "Flyer deactivated" : "Flyer activated — it will now show as a popup");
      await load();
    } catch {
      toast.error("Failed to update flyer");
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this flyer?")) return;
    setActionId(id);
    try {
      await deleteFlyer(id);
      toast.success("Flyer deleted");
      await load();
    } catch {
      toast.error("Failed to delete flyer");
    } finally {
      setActionId(null);
    }
  }

  const activeCount = flyers.filter((f) => f.isActive).length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Upload form */}
      <div
        className="rounded border p-6 space-y-5"
        style={{ backgroundColor: "#fff", borderColor: "rgba(13,13,13,0.1)" }}
      >
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "22px",
            color: "#0D0D0D",
          }}
        >
          Upload New Flyer
        </h2>
        <p className="text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
          Upload a Canva-designed flyer image. Only one flyer can be active at a time — the active
          flyer will appear as a popup on the storefront.
        </p>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File picker */}
          <div>
            <label
              className="block text-xs tracking-[0.15em] uppercase mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
            >
              Flyer Image *
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}
            />
          </div>

          {/* Preview */}
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="max-h-60 rounded border object-contain"
              style={{ borderColor: "rgba(13,13,13,0.1)" }}
            />
          )}

          {/* Title */}
          <div>
            <label
              className="block text-xs tracking-[0.15em] uppercase mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
            >
              Caption (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New Collection — Spring 2025"
              className="w-full px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "rgba(13,13,13,0.2)",
                color: "#0D0D0D",
              }}
            />
          </div>

          {/* Delay */}
          <div>
            <label
              className="block text-xs tracking-[0.15em] uppercase mb-1.5"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6560" }}
            >
              Show after (seconds)
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={delaySeconds}
              onChange={(e) => setDelaySeconds(Number(e.target.value))}
              className="w-32 px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "rgba(13,13,13,0.2)",
                color: "#0D0D0D",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.2em] uppercase transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              backgroundColor: "#0D0D0D",
              color: "#C9A84C",
            }}
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {uploading ? "Uploading…" : "Upload Flyer"}
          </button>
        </form>
      </div>

      {/* Flyers list */}
      <div>
        <h2
          className="mb-4"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "22px",
            color: "#0D0D0D",
          }}
        >
          All Flyers
          {activeCount > 0 && (
            <span
              className="ml-3 text-xs tracking-[0.15em] uppercase px-2 py-0.5 rounded-full"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontStyle: "normal",
                backgroundColor: "rgba(201,168,76,0.15)",
                color: "#C9A84C",
              }}
            >
              1 active
            </span>
          )}
        </h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: "#C9A84C" }} />
          </div>
        ) : flyers.length === 0 ? (
          <p className="text-sm py-8 text-center" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
            No flyers uploaded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {flyers.map((flyer) => (
              <div
                key={flyer.id}
                className="flex items-center gap-4 rounded border p-4"
                style={{
                  backgroundColor: flyer.isActive ? "rgba(201,168,76,0.06)" : "#fff",
                  borderColor: flyer.isActive ? "#C9A84C" : "rgba(13,13,13,0.1)",
                }}
              >
                {/* Thumbnail */}
                <img
                  src={flyer.imageUrl}
                  alt={flyer.title || "Flyer"}
                  className="w-20 h-16 object-cover rounded flex-shrink-0 border"
                  style={{ borderColor: "rgba(13,13,13,0.1)" }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium truncate"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "#0D0D0D" }}
                  >
                    {flyer.title || <span style={{ color: "#6B6560" }}>No caption</span>}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                    Shows after {flyer.delaySeconds}s ·{" "}
                    {flyer.createdAt.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  {flyer.isActive && (
                    <span
                      className="inline-block mt-1 text-[10px] tracking-[0.15em] uppercase px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        backgroundColor: "#C9A84C",
                        color: "#0D0D0D",
                      }}
                    >
                      Active
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleToggleActive(flyer)}
                    disabled={actionId === flyer.id}
                    title={flyer.isActive ? "Deactivate" : "Activate"}
                    className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:opacity-70 disabled:opacity-40"
                    style={{
                      backgroundColor: flyer.isActive
                        ? "rgba(201,168,76,0.15)"
                        : "rgba(13,13,13,0.06)",
                      color: flyer.isActive ? "#C9A84C" : "#6B6560",
                    }}
                  >
                    {actionId === flyer.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : flyer.isActive ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(flyer.id)}
                    disabled={actionId === flyer.id}
                    title="Delete"
                    className="w-8 h-8 flex items-center justify-center rounded transition-colors hover:opacity-70 disabled:opacity-40"
                    style={{ backgroundColor: "rgba(229,57,53,0.08)", color: "#e53935" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
