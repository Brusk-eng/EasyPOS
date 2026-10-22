import { useTranslation } from "react-i18next";

const Pagination = ({ page, totalPages, onPrev, onNext }) => {
  const { t } = useTranslation();
  return (
    <div className="d-flex justify-content-between align-items-center">
      <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
        {t("Page {{page}} of {{total}}", { page: page + 1, total: totalPages })}
      </span>
      <div className="d-flex gap-2">
        <button
          type="button"
          className="pos-btn pos-btn-secondary"
          style={{ height: 30, fontSize: 12, padding: "0 12px" }}
          disabled={page === 0}
          onClick={onPrev}
        >
          {t("Previous")}
        </button>
        <button
          type="button"
          className="pos-btn pos-btn-secondary"
          style={{ height: 30, fontSize: 12, padding: "0 12px" }}
          disabled={page + 1 >= totalPages}
          onClick={onNext}
        >
          {t("Next")}
        </button>
      </div>
    </div>
  );
};

export default Pagination;
