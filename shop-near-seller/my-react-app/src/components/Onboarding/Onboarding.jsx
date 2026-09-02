import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getSellerProfile,
  getSellerCategories,
  updateSellerProfile,
  updateSellerKyc,
} from "../../api/sellerApi";
import useAuthStore from "../../store/authStore";
import AuthLayout from "./AuthLayout";
import checkCircle from "../../assets/onboarding/check-circle.svg";
import uploadCloud from "../../assets/onboarding/upload-cloud-1.svg";
import mapPreview from "../../assets/onboarding/map-preview.png";

function UploadBox({ label, file, onFile, accept }) {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="ob-upload-box" onClick={() => inputRef.current?.click()}>
      {previewUrl ? (
        <img className="preview" src={previewUrl} alt={label} />
      ) : (
        <>
          <img className="cloud" src={uploadCloud} alt="" />
          {file ? (
            <span className="filename">{file.name}</span>
          ) : (
            <span>{label}</span>
          )}
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </div>
  );
}

/**
 * Seller onboarding (Figma 547-5696 / 547-5785) + approval-wait modal
 * (Figma 547-5880). Rendered on /onboarding and /verification.
 */
export default function Onboarding({ verification = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const loginToStore = useAuthStore((s) => s.login);

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(verification);
  const [modalNote, setModalNote] = useState("");
  const [rejected, setRejected] = useState(false);

  // Step 1 — Basic information
  const [ownerName, setOwnerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(location.state?.email || "");
  const [brandName, setBrandName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // Step 2 — Shop information
  const [gstNumber, setGstNumber] = useState("");
  const [shopImage, setShopImage] = useState(null);
  const [businessProof, setBusinessProof] = useState(null);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const sugTimer = useRef(null);

  const token = localStorage.getItem("sellerToken");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    getSellerProfile()
      .then((res) => {
        const data = res.data?.data || {};
        setSeller(data);
        setOwnerName(data.fullName || "");
        setMobile(data.mobile || "");
        setEmail((prev) => prev || data.email || "");
        setBrandName(data.shopName || "");
        setCategoryId(data.categories?.[0]?._id || data.categories?.[0] || "");
        setGstNumber(data.gstNumber || "");
        setAddress(data.address || "");
        if (data.lat && data.lng) setCoords({ lat: data.lat, lng: data.lng });

        if (data.status === "approved") {
          loginToStore(token, data);
          navigate("/", { replace: true });
        } else if (data.status === "rejected") {
          setRejected(true);
          setShowModal(true);
        } else if (data.status === "pending_approval" && !verification) {
          navigate("/verification", { replace: true });
        } else if (data.status === "pending_profile" && verification) {
          navigate("/onboarding", { replace: true });
        }
      })
      .catch((err) => {
        // Session invalid (token expire / seller delete) → wapas login par
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem("sellerToken");
          navigate("/login", { replace: true });
        }
        // Network/server error par form dikhna chahiye — silently ignore
      });

    getSellerCategories()
      .then((res) => {
        const data = res.data?.data || {};
        setCategories(data.categories || data || []);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll while waiting for admin approval; auto-login once approved
  useEffect(() => {
    if (!showModal || rejected) return;
    const timer = setInterval(async () => {
      try {
        const res = await getSellerProfile();
        const data = res.data?.data || {};
        if (data.status === "approved") {
          clearInterval(timer);
          loginToStore(localStorage.getItem("sellerToken"), data);
          navigate("/", { replace: true });
        } else if (data.status === "rejected") {
          setSeller(data);
          setRejected(true);
        }
      } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          clearInterval(timer);
          localStorage.removeItem("sellerToken");
          navigate("/login", { replace: true });
        }
        // network error → keep polling
      }
    }, 10000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, rejected]);

  const handleStep1Continue = async () => {
    if (!ownerName.trim()) return setError("Please enter owner name");
    if (!brandName.trim()) return setError("Please enter brand name");
    setError("");
    setSaving(true);
    try {
      const payload = {
        fullName: ownerName.trim(),
        email: email.trim(),
        shopName: brandName.trim(),
      };
      const selected = categories.find((c) => c._id === categoryId);
      if (categoryId) {
        payload.categories = [categoryId];
        if (selected) payload.businessType = selected.categoryName || selected.name || "";
      }
      await updateSellerProfile(payload);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
  };

  // Address autocomplete — Photon (OpenStreetMap), free/no API key.
  // Debounce ke saath, India bounding box tak limited. Plain fetch use
  // karo — axios client Authorization token inject karta hai jo bahar
  // ke API par nahi jana chahiye.
  const handleAddressChange = (val) => {
    setAddress(val);
    setCoords(null); // address haath se badla to purana pin invalid
    if (sugTimer.current) clearTimeout(sugTimer.current);
    if (!val || val.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    sugTimer.current = setTimeout(async () => {
      try {
        const url =
          "https://photon.komoot.io/api/?limit=5&lang=en" +
          "&bbox=68.1,6.5,97.4,35.7" +
          "&q=" +
          encodeURIComponent(val.trim());
        const res = await fetch(url);
        const json = await res.json();
        const items = (json.features || [])
          .map((f) => {
            const p = f.properties || {};
            const label = [
              p.name,
              p.street,
              p.district,
              p.city,
              p.state,
              p.postcode,
            ]
              .filter(Boolean)
              .filter((v, i, arr) => arr.indexOf(v) === i)
              .join(", ");
            return {
              label,
              lat: f.geometry?.coordinates?.[1],
              lng: f.geometry?.coordinates?.[0],
            };
          })
          .filter((s) => s.label);
        setSuggestions(items);
      } catch {
        setSuggestions([]);
      }
    }, 350);
  };

  const pickSuggestion = (s) => {
    setAddress(s.label);
    if (s.lat && s.lng) setCoords({ lat: s.lat, lng: s.lng });
    setSuggestions([]);
  };

  const handleFindOnMap = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setError("");
      },
      () => setError("Could not fetch your location"),
    );
  };

  const handleStep2Continue = async () => {
    if (!gstNumber.trim()) return setError("Please enter GST number");
    if (!address.trim()) return setError("Please enter shop location");
    setError("");
    setSaving(true);
    try {
      const kycData = new FormData();
      kycData.append("gstNumber", gstNumber.trim());
      if (businessProof) kycData.append("gstCertificate", businessProof);
      await updateSellerKyc(kycData);

      const profileData = new FormData();
      profileData.append("address", address.trim());
      if (coords) {
        profileData.append("lat", coords.lat);
        profileData.append("lng", coords.lng);
      }
      if (shopImage) profileData.append("shopImages", shopImage);
      profileData.append("status", "pending_approval");
      await updateSellerProfile(profileData);

      navigate("/verification");
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit details");
    } finally {
      setSaving(false);
    }
  };

  const handleModalLogin = async () => {
    try {
      const res = await getSellerProfile();
      const data = res.data?.data || {};
      if (data.status === "approved") {
        loginToStore(localStorage.getItem("sellerToken"), data);
        navigate("/", { replace: true });
      } else {
        setModalNote("Your profile is still under review. Please check back soon.");
      }
    } catch {
      setModalNote("Could not check status. Please try again.");
    }
  };

  const handleResubmit = () => {
    setRejected(false);
    setShowModal(false);
    setStep(1);
    navigate("/onboarding", { replace: true });
  };

  const activeStep = verification ? 2 : step;

  const actions = (
    <>
      <button
        className="ob-btn-outline"
        onClick={() => {
          localStorage.removeItem("sellerToken");
          navigate("/login");
        }}
      >
        Not a User?
      </button>
      <button className="ob-btn-fill">Create Account</button>
    </>
  );

  return (
    <AuthLayout actions={actions}>
      <div className="ob-card">
        <div className="ob-tabs">
          <button
            type="button"
            className={`ob-tab tab1 ${activeStep === 1 ? "active" : ""}`}
            onClick={() => !verification && setStep(1)}
          >
            <span className="ob-tab-num">1</span>
            <span className="ob-tab-label">Basic information</span>
          </button>
          <button
            type="button"
            className={`ob-tab tab2 ${activeStep === 2 ? "active" : ""}`}
            onClick={() => !verification && setStep(2)}
          >
            <span className="ob-tab-num">2</span>
            <span className="ob-tab-label">Shop information</span>
          </button>
        </div>

        {activeStep === 1 ? (
          <div className="ob-form">
            <p className="ob-form-heading">Contact Person Details</p>
            {error && <div className="ob-error">{error}</div>}

            <div className="ob-field">
              <label>Owner Name</label>
              <input
                className="ob-input"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Enter Owner Name"
              />
            </div>

            <div className="ob-row2">
              <div className="ob-field">
                <label>Phone Number</label>
                <input
                  className="ob-input"
                  value={mobile ? `+91 ${mobile}` : ""}
                  readOnly
                  placeholder="+91"
                />
              </div>
              <div className="ob-field">
                <label>Email ID</label>
                <input
                  className="ob-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mithu@gmail.com"
                />
              </div>
            </div>

            <div className="ob-field">
              <label>Brand Name</label>
              <input
                className="ob-input"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Enter Brand Name"
              />
            </div>

            <div className="ob-field">
              <label>Category</label>
              <select
                className="ob-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.categoryName || c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="ob-continue-btn"
              disabled={saving}
              onClick={handleStep1Continue}
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </div>
        ) : (
          <div className="ob-form">
            <p className="ob-form-heading">Shop Details</p>
            {error && <div className="ob-error">{error}</div>}

            <div className="ob-field">
              <label>GST Number</label>
              <input
                className="ob-input"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                placeholder="Enter GST Number"
              />
            </div>

            <div className="ob-field">
              <label>Upload Documents</label>
              <div className="ob-row2">
                <UploadBox
                  label="Upload Shop Image"
                  file={shopImage}
                  onFile={setShopImage}
                  accept="image/*"
                />
                <UploadBox
                  label="Upload Business Proof"
                  file={businessProof}
                  onFile={setBusinessProof}
                  accept="image/*,.pdf"
                />
              </div>
            </div>

            <div className="ob-field ob-sug-wrap">
              <label>Shop Location</label>
              <input
                className="ob-input"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                placeholder="Enter Shop Location"
                autoComplete="off"
              />
              {suggestions.length > 0 && (
                <div className="ob-sug-list">
                  {suggestions.map((s, i) => (
                    <button
                      type="button"
                      key={`${s.label}-${i}`}
                      className="ob-sug-item"
                      onMouseDown={() => pickSuggestion(s)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="ob-findmap-row">
              <button
                type="button"
                className="ob-findmap-btn"
                onClick={handleFindOnMap}
              >
                {coords ? "LOCATION SAVED ✓" : "FIND ON MAP"}
              </button>
            </div>

            <img className="ob-map-img" src={mapPreview} alt="Map" />

            <button
              className="ob-continue-btn"
              disabled={saving}
              onClick={handleStep2Continue}
            >
              {saving ? "Submitting..." : "Continue"}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="ob-overlay">
          <div className="ob-modal">
            <div className="ob-modal-inner">
              <div className="ob-modal-icon">
                <img src={checkCircle} alt="" />
                <span className="check" />
              </div>
              <div>
                <h2 className="ob-modal-title">Profile Verification</h2>
                <p className="ob-modal-sub">
                  {rejected
                    ? seller?.rejectedReason
                      ? `Your profile was rejected: ${seller.rejectedReason}`
                      : "Your profile was rejected. Please update your details and resubmit."
                    : "Your shop profile is under review. You’ll be notified once approved."}
                </p>
              </div>
              {modalNote && !rejected && (
                <p className="ob-modal-note">{modalNote}</p>
              )}
              {rejected ? (
                <button className="ob-modal-btn" onClick={handleResubmit}>
                  Edit & Resubmit
                </button>
              ) : (
                <button className="ob-modal-btn" onClick={handleModalLogin}>
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
