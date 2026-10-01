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

  // Admin CMS tab -> Settings field + title (app aur public pages dono yahi use karte hain)
  const CMS_PAGES = {
    terms: { field: "termsAndConditions", title: "Terms of Service" },
    privacy: { field: "privacyPolicy", title: "Privacy Policy" },
    about: { field: "aboutUs", title: "About Us" },
    shipping: { field: "shippingPolicy", title: "Shipping Policy" },
    cancellation: { field: "cancellationPolicy", title: "Cancellation Policy" },
    refund: { field: "refundPolicy", title: "Refund Policy" },
    contact: { field: "contactUs", title: "Contact Us" },
  };

  // Public JSON (bina login): GET /v1/api/cms/:type
  // Mobile app ka CmsScreen aur admin.aaspass.net/privacy-policy isse content lete hain.
  // Content khali ho to content "" aata hai - client apna empty state dikhata hai.
  const cmsJson = async (req, res) => {
    const type = String(req.params.type || "").toLowerCase();
    const page = CMS_PAGES[type];
    if (!page) {
      return res
        .status(404)
        .send({ code: 0, message: "cms page not found", data: {} });
    }

    const data = { type, title: page.title, content: "", updatedAt: null };
    try {
      const settings = await SettingsService().fetchByQuery({});
      if (settings) {
        if (type === "contact") {
          const c = settings.contactUs || {};
          data.contact = {
            email: c.email || "",
            phone: c.phone || "",
            address: c.address || "",
          };
          if (c.email || c.phone || c.address) data.updatedAt = settings.updatedAt;
        } else if (String(settings[page.field] || "").trim()) {
          data.content = settings[page.field];
          data.updatedAt = settings.updatedAt;
        }
      }
    } catch (err) {
      console.error("PublicPagesController => cmsJson failed", err.message);
    }
    if (type === "contact" && !data.contact) {
      data.contact = { email: "", phone: "", address: "" };
    }
    res.send({ code: 1, message: "success", data });
  };

  const deleteAccount = (req, res) => {
    res.sendFile(path.join(PUBLIC_DIR, "delete-account.html"));
  };

  return { privacyPolicy, cmsJson, deleteAccount };
};
