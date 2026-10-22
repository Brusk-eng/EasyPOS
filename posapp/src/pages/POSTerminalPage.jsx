import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ItemGroup from "../components/ItemGroup";
import Items from "../components/Items";
import Cart from "../components/Cart";
import OpeningEntryModal from "../components/Opening/OpeningEntryModal";
import useBarcodeScanner from "../hooks/useBarcodeScanner";
import { BarcodeScannerModal } from "../components/common";
import useConnectivityStore from "../engine/connectivity";
import useEngineSettingsStore from "../engine/settingsStore";

const POSTerminalPage = () => {
  const { setTopbar } = useOutletContext();
  const [activeItemGroup, setActiveItemGroup] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const offlineModeEnabled = useEngineSettingsStore((s) => s.offlineModeEnabled);
  const isOnline = useConnectivityStore((s) => s.isOnline);
  const showOfflineBanner = offlineModeEnabled && !isOnline;

  const handleCameraDetected = useCallback((code) => {
    setShowCameraScanner(false);
    setSearchText(code);
  }, []);

  useEffect(() => {
    setTopbar({
      title: "POS Terminal",
      searchValue: searchText,
      onSearchChange: setSearchText,
      searchPlaceholder: "Scan barcode/serial/batch or search items",
      onScanClick: () => setShowCameraScanner(true),
    });
  }, [searchText, setTopbar]);

  // Lets a cashier scan straight into the item grid without clicking the
  // search box first — feeds the scanned code through the same searchText
  // state the box uses, so it goes through Items' existing debounce/auto-add
  // flow (see AUTO_ADD_MATCH_TYPES in components/Items) with no duplicated logic.
  useBarcodeScanner({ onScan: setSearchText, enabled: !showCameraScanner });

  return (
    <>
      {showOfflineBanner && (
        <div
          className="d-flex align-items-center"
          style={{
            margin: "12px 16px 0",
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
            background: "var(--color-danger-bg)",
            color: "var(--color-danger-text)",
            fontSize: 12.5,
            gap: 8,
            flexShrink: 0,
          }}
        >
          <i className="bi bi-cloud-slash" />
          Offline — showing cached catalog and pricing. Sales ring up and sync automatically once reconnected.
        </div>
      )}

      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <ItemGroup selectedGroup={activeItemGroup} onChangeGroup={setActiveItemGroup} />
      </div>

      <div style={{ flex: 1, display: "flex", padding: "12px 16px 16px", gap: 16, minHeight: 0 }}>
        <Items
          selectedGroup={activeItemGroup}
          searchText={searchText}
          onSearchResolved={() => setSearchText("")}
        />
        <Cart />
      </div>

      <OpeningEntryModal />

      <BarcodeScannerModal
        open={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        onDetected={handleCameraDetected}
        subtitle="Populates the item search field, same as a hardware scanner"
      />
    </>
  );
};

export default POSTerminalPage;
