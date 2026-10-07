import { useEffect } from "react";

/**
 * Har `.admin-table` ke <td> par uske column header ka naam `data-label` me
 * daal deta hai. Mobile CSS isi label se har row ko card (label : value) ki
 * tarah dikhata hai, isliye kisi page ke JSX ko badalna nahi padta.
 */
const labelTables = (root) => {
  root.querySelectorAll("table.admin-table").forEach((table) => {
    const heads = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent.trim(),
    );
    table.querySelectorAll("tbody tr").forEach((tr) => {
      let col = 0;
      Array.from(tr.children).forEach((td) => {
        const span = Number(td.getAttribute("colspan")) || 1;
        if (span > 1) {
          td.setAttribute("data-full", "1");
        } else {
          const label = heads[col] || "";
          if (td.getAttribute("data-label") !== label) {
            td.setAttribute("data-label", label);
          }
        }
        col += span;
      });
    });
  });
};

export default function useResponsiveTables() {
  useEffect(() => {
    let frame = 0;
    const run = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => labelTables(document));
    };
    run();
    const observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
}
