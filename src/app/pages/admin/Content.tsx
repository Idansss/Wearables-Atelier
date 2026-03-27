import { useEffect, useState } from "react";
import { ExternalLink, Info, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import { saveSiteSettings } from "../../lib/db";
import {
  SIMPLE_PAGE_ORDER,
  type SimplePagePath,
  type SimplePagesSettings,
} from "../../lib/siteSettings";

export default function Content() {
  const { settings, loading, refresh } = useSiteSettings();
  const [messages, setMessages] = useState<string[]>([]);
  const [pages, setPages] = useState<SimplePagesSettings>(settings.simplePages);
  const [selectedPath, setSelectedPath] = useState<SimplePagePath>(SIMPLE_PAGE_ORDER[0].path);

  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementSaved, setAnnouncementSaved] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");

  const [pagesSaving, setPagesSaving] = useState(false);
  const [pagesSaved, setPagesSaved] = useState(false);
  const [pagesError, setPagesError] = useState("");

  useEffect(() => {
    setMessages(settings.announcementMessages);
    setPages(settings.simplePages);
  }, [settings]);

  const activePage = pages[selectedPath];

  function handleMessageChange(index: number, value: string) {
    setMessages((current) => current.map((message, i) => (i === index ? value : message)));
    setAnnouncementSaved(false);
  }

  function handleAddMessage() {
    setMessages((current) => [...current, ""]);
    setAnnouncementSaved(false);
  }

  function handleDeleteMessage(index: number) {
    setMessages((current) => current.filter((_, i) => i !== index));
    setAnnouncementSaved(false);
  }

  async function handleSaveAnnouncements() {
    setAnnouncementError("");
    setAnnouncementSaving(true);

    try {
      const trimmed = messages.map((message) => message.trim()).filter(Boolean);
      await saveSiteSettings({ announcementMessages: trimmed });
      await refresh();
      setMessages(trimmed);
      setAnnouncementSaved(true);
      setTimeout(() => setAnnouncementSaved(false), 2500);
    } catch (err) {
      setAnnouncementError(err instanceof Error ? err.message : "Failed to save announcements");
    } finally {
      setAnnouncementSaving(false);
    }
  }

  function updatePageField<K extends "title" | "subtitle">(
    key: K,
    value: string
  ) {
    setPages((current) => ({
      ...current,
      [selectedPath]: {
        ...current[selectedPath],
        [key]: value,
      },
    }));
    setPagesSaved(false);
  }

  function updateSection(index: number, key: "heading" | "text", value: string) {
    setPages((current) => ({
      ...current,
      [selectedPath]: {
        ...current[selectedPath],
        content: current[selectedPath].content.map((section, i) =>
          i === index ? { ...section, [key]: value } : section
        ),
      },
    }));
    setPagesSaved(false);
  }

  function addSection() {
    setPages((current) => ({
      ...current,
      [selectedPath]: {
        ...current[selectedPath],
        content: [...current[selectedPath].content, { heading: "", text: "" }],
      },
    }));
    setPagesSaved(false);
  }

  function deleteSection(index: number) {
    setPages((current) => ({
      ...current,
      [selectedPath]: {
        ...current[selectedPath],
        content: current[selectedPath].content.filter((_, i) => i !== index),
      },
    }));
    setPagesSaved(false);
  }

  async function handleSavePages() {
    setPagesError("");
    setPagesSaving(true);

    try {
      const nextPages = { ...pages };

      for (const { path } of SIMPLE_PAGE_ORDER) {
        const page = nextPages[path];
        const title = page.title.trim();
        const subtitle = page.subtitle.trim();
        const sections = page.content
          .map((section) => ({
            heading: section.heading.trim(),
            text: section.text.trim(),
          }))
          .filter((section) => section.heading && section.text);

        if (!title || !subtitle || sections.length === 0) {
          throw new Error("Each simple page needs a title, subtitle, and at least one section.");
        }

        nextPages[path] = {
          title,
          subtitle,
          content: sections,
        };
      }

      await saveSiteSettings({ simplePages: nextPages });
      await refresh();
      setPages(nextPages);
      setPagesSaved(true);
      setTimeout(() => setPagesSaved(false), 2500);
    } catch (err) {
      setPagesError(err instanceof Error ? err.message : "Failed to save simple pages");
    } finally {
      setPagesSaving(false);
    }
  }

  const inputCls =
    "w-full px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white";
  const inputStyle = {
    borderColor: "rgba(13,13,13,0.2)",
    color: "#0D0D0D",
    fontFamily: "'DM Sans', sans-serif",
  };
  const labelCls = "text-xs tracking-[0.12em] uppercase block mb-1.5 font-semibold";
  const labelStyle = { color: "#0D0D0D", fontFamily: "'DM Sans', sans-serif" };

  if (loading || !activePage) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={28} className="animate-spin" style={{ color: "#C9A84C" }} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
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
          Site Content
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
          Manage announcement messages and the public support/legal pages linked in the storefront.
        </p>
      </div>

      <div className="grid gap-8">
        <section
          className="border p-6"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <div className="flex items-start justify-between gap-4 mb-1">
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "22px",
                  color: "#0D0D0D",
                }}
              >
                Announcement Bar Messages
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                These rotate at the top of the public site.
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-2 text-xs px-3 py-2.5 mb-5 mt-3"
            style={{
              backgroundColor: "rgba(201,168,76,0.08)",
              borderLeft: "2px solid #C9A84C",
              color: "#6B6560",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Info size={12} className="mt-0.5 shrink-0" style={{ color: "#C9A84C" }} />
            <span>Changes go live immediately for new visitors.</span>
          </div>

          <div className="flex flex-col gap-3">
            {messages.length === 0 && (
              <p
                className="text-sm py-4 text-center"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  color: "#6B6560",
                }}
              >
                No messages yet. Add one below.
              </p>
            )}

            {messages.map((message, index) => (
              <div key={index} className="flex items-start gap-2">
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => handleMessageChange(index, e.target.value)}
                  placeholder={`Message ${index + 1} - e.g. Free shipping on orders over N50,000`}
                  className="flex-1 px-3 py-2.5 text-sm border outline-none focus:border-[#C9A84C] bg-white resize-none"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => handleDeleteMessage(index)}
                  title="Remove message"
                  className="mt-1 w-8 h-8 flex items-center justify-center border hover:opacity-70 shrink-0"
                  style={{ borderColor: "rgba(13,13,13,0.15)" }}
                >
                  <Trash2 size={13} style={{ color: "#e53935" }} />
                </button>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddMessage}
                className="flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold border hover:opacity-70"
                style={{
                  borderColor: "rgba(13,13,13,0.2)",
                  color: "#0D0D0D",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Plus size={13} />
                Add Message
              </button>

              <button
                type="button"
                onClick={handleSaveAnnouncements}
                disabled={announcementSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold disabled:opacity-50"
                style={{
                  backgroundColor: announcementSaved ? "#16a34a" : "#C9A84C",
                  color: announcementSaved ? "#fff" : "#0D0D0D",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {announcementSaving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                {announcementSaving ? "Saving..." : announcementSaved ? "Saved" : "Save Announcements"}
              </button>

              {announcementError && (
                <p className="text-xs" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>
                  {announcementError}
                </p>
              )}
            </div>
          </div>
        </section>

        <section
          className="border p-6"
          style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#fff" }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h2
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "22px",
                  color: "#0D0D0D",
                }}
              >
                Support & Legal Pages
              </h2>
              <p className="mt-1 text-sm" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                Edit the public FAQ, shipping, size guide, returns, terms, and privacy pages.
              </p>
            </div>

            <a
              href={selectedPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold border"
              style={{
                borderColor: "rgba(13,13,13,0.18)",
                color: "#0D0D0D",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <ExternalLink size={13} />
              Preview Page
            </a>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {SIMPLE_PAGE_ORDER.map((page) => {
              const isActive = selectedPath === page.path;
              return (
                <button
                  key={page.path}
                  type="button"
                  onClick={() => setSelectedPath(page.path)}
                  className="px-4 py-2 text-xs tracking-[0.12em] uppercase font-semibold"
                  style={{
                    backgroundColor: isActive ? "#0D0D0D" : "rgba(13,13,13,0.05)",
                    color: isActive ? "#C9A84C" : "#0D0D0D",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {page.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-5">
            <div>
              <label className={labelCls} style={labelStyle}>
                Page Title
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={activePage.title}
                onChange={(e) => updatePageField("title", e.target.value)}
              />
            </div>

            <div>
              <label className={labelCls} style={labelStyle}>
                Page Subtitle
              </label>
              <textarea
                rows={2}
                className={inputCls + " resize-none"}
                style={inputStyle}
                value={activePage.subtitle}
                onChange={(e) => updatePageField("subtitle", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-4">
              {activePage.content.map((section, index) => (
                <div
                  key={index}
                  className="border p-4"
                  style={{ borderColor: "rgba(13,13,13,0.1)", backgroundColor: "#F8F5F0" }}
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <p className="text-xs tracking-[0.12em] uppercase font-semibold" style={{ color: "#6B6560", fontFamily: "'DM Sans', sans-serif" }}>
                      Section {index + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => deleteSection(index)}
                      title="Remove section"
                      className="w-8 h-8 flex items-center justify-center border"
                      style={{ borderColor: "rgba(13,13,13,0.15)" }}
                    >
                      <Trash2 size={13} style={{ color: "#e53935" }} />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        Heading
                      </label>
                      <input
                        className={inputCls}
                        style={inputStyle}
                        value={section.heading}
                        onChange={(e) => updateSection(index, "heading", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={labelCls} style={labelStyle}>
                        Body Text
                      </label>
                      <textarea
                        rows={4}
                        className={inputCls + " resize-none"}
                        style={inputStyle}
                        value={section.text}
                        onChange={(e) => updateSection(index, "text", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={addSection}
                className="flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold border hover:opacity-70"
                style={{
                  borderColor: "rgba(13,13,13,0.2)",
                  color: "#0D0D0D",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <Plus size={13} />
                Add Section
              </button>

              <button
                type="button"
                onClick={handleSavePages}
                disabled={pagesSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-xs tracking-[0.12em] uppercase font-semibold disabled:opacity-50"
                style={{
                  backgroundColor: pagesSaved ? "#16a34a" : "#C9A84C",
                  color: pagesSaved ? "#fff" : "#0D0D0D",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {pagesSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {pagesSaving ? "Saving..." : pagesSaved ? "Saved" : "Save Pages"}
              </button>

              {pagesError && (
                <p className="text-xs" style={{ color: "#e53935", fontFamily: "'DM Sans', sans-serif" }}>
                  {pagesError}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
