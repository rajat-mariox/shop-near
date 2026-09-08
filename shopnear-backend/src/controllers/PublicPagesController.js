const fs = require("fs");
const path = require("path");
const SettingsService = require("../services/SettingsService");

/**
 * Public HTML pages (bina login) - Play Store listing ke liye:
 *   GET /privacy-policy  -> admin CMS (Settings.privacyPolicy) ka content,
 *                           khali ho to public/privacy-policy.html ka default text
 *   GET /delete-account  -> public/delete-account.html (static)
 */
module.exports = () => {
  const PUBLIC_DIR = path.join(__dirname, "..", "..", "public");

  const escapeHtml = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  // CMS textarea plain text hai: blank line = naya paragraph, single newline = <br>
  const textToHtml = (text) =>
    String(text)
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
      .join("\n");

  const formatDate = (d) =>
    new Date(d || Date.now()).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const privacyPolicy = async (req, res) => {
    let template = fs.readFileSync(
      path.join(PUBLIC_DIR, "privacy-policy.html"),
      "utf8"
    );

    let content = "";
    let updatedAt = null;
    try {
      const settings = await SettingsService().fetchByQuery({});
      if (settings && settings.privacyPolicy && settings.privacyPolicy.trim()) {
        content = textToHtml(settings.privacyPolicy);
        updatedAt = settings.updatedAt;
      }
    } catch (err) {
      console.error(
        "PublicPagesController => privacyPolicy settings fetch failed",
        err.message
      );
    }

    // CMS khali ho to template apna default section dikhata hai
    template = template
      .replace("{{CMS_CONTENT}}", content)
      .replace("{{CMS_CLASS}}", content ? "" : "hidden")
      .replace("{{DEFAULT_CLASS}}", content ? "hidden" : "")
      .replace("{{UPDATED}}", formatDate(updatedAt));

    res.type("html").send(template);
  };

  // JSON version - admin panel (admin.aaspass.net/privacy-policy) isse content leta hai
  const privacyPolicyJson = async (req, res) => {
    let content = "";
    let updatedAt = null;
    try {
      const settings = await SettingsService().fetchByQuery({});
      if (settings && settings.privacyPolicy && settings.privacyPolicy.trim()) {
        content = settings.privacyPolicy;
        updatedAt = settings.updatedAt;
      }
    } catch (err) {
      console.error("PublicPagesController => privacyPolicyJson failed", err.message);
    }
    res.send({ code: 1, message: "success", data: { content, updatedAt } });
  };

  const deleteAccount = (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "delete-account.html"));
  };

  return { privacyPolicy, privacyPolicyJson, deleteAccount };
};
