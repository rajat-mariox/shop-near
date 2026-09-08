import "./PublicPage.css";

// Common shell for public pages (Play Store listing): logo + title, no admin sidebar/header
const PublicLayout = ({ title, subtitle, children, footer }) => (
  <div className="pub-body">
    <div className="pub-wrap">
      <div className="pub-header">
        <div className="pub-logo">A</div>
        <div>
          <h1>{title}</h1>
          <p className="pub-sub">{subtitle}</p>
        </div>
      </div>
      {children}
      {footer ? <div className="pub-footer">{footer}</div> : null}
    </div>
  </div>
);

export default PublicLayout;
