import "./onboarding.css";
import logoSprite from "../../assets/onboarding/logo-sprite.png";
import heroBg from "../../assets/onboarding/hero-bg.png";
import rocket from "../../assets/onboarding/rocket.png";
import statCustomer from "../../assets/onboarding/stat-customer.png";
import statStore from "../../assets/onboarding/stat-store.png";
import statCategory from "../../assets/onboarding/stat-category.png";
import statDelivery from "../../assets/onboarding/stat-delivery.png";
import brandChanel from "../../assets/onboarding/brand-chanel.svg";
import brandPuma from "../../assets/onboarding/brand-puma.png";
import brandSprite from "../../assets/onboarding/brand-sprite.png";

export function ShopNearLogo() {
  return (
    <div className="sn-logo">
      <div className="sn-logo-pin">
        <img src={logoSprite} alt="" />
      </div>
      <div className="sn-logo-text">
        <img src={logoSprite} alt="ShopNear" />
      </div>
    </div>
  );
}

const STATS = [
  {
    icon: statCustomer,
    title: "1 Million+",
    desc: "Customer Reach PAN India",
  },
  {
    icon: statStore,
    title: "1100+ Store",
    desc: "Serviceable Stores PAN india",
  },
  {
    icon: statCategory,
    title: "320+ Categories",
    desc: "Category agnostic, customer obsessed",
  },
  {
    icon: statDelivery,
    title: "60Cr+ Deliveries",
    desc: "till now across multiple pincodes",
  },
];

function BrandStrip() {
  const tiles = (
    <>
      <div className="ob-brand-tile chanel">
        <img src={brandChanel} alt="Chanel" />
      </div>
      <div className="ob-brand-tile full">
        <img src={brandPuma} alt="Puma" />
      </div>
      <div className="ob-brand-tile puma">
        <img src={brandSprite} alt="Reebok" />
      </div>
      <div className="ob-brand-tile fila">
        <img src={brandSprite} alt="Fila" />
      </div>
    </>
  );
  return (
    <div className="ob-hero-brands">
      {tiles}
      {tiles}
    </div>
  );
}

/**
 * Split-screen auth/onboarding layout: pink left panel (children) +
 * marketing hero on the right (Figma 536-5644).
 */
export default function AuthLayout({ children, actions }) {
  return (
    <div className="ob-page">
      <div className="ob-left">
        <div className="ob-left-logo">
          <ShopNearLogo />
        </div>
        <div className="ob-left-center">{children}</div>
      </div>

      <div className="ob-right">
        <img className="ob-right-bg" src={heroBg} alt="" />
        <div className="ob-hero-actions">{actions}</div>
        <div className="ob-hero">
          <div className="ob-hero-rocket">
            <img src={rocket} alt="" />
          </div>
          <div className="ob-hero-heading">
            <div className="line1">Grow your Business Faster By</div>
            <div className="line2">Selling through SHOPNEAR</div>
          </div>
          <div className="ob-hero-stats">
            {STATS.map((s) => (
              <div className="ob-stat" key={s.title}>
                <div className="ob-stat-icon">
                  <img src={s.icon} alt="" />
                </div>
                <div>
                  <p className="ob-stat-title">{s.title}</p>
                  <p className="ob-stat-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="ob-hero-trust">
            Over 10K+ Brands trust ShopNear to help grow their business from 2X
            to 10X across 1500+ Pincodes.
          </div>
          <BrandStrip />
        </div>
      </div>
    </div>
  );
}
