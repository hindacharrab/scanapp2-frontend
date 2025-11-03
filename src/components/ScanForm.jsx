// ScanForm.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { sendScan } from "../services/ScanService";
import { Button, Spinner } from "react-bootstrap";
import Message from "./Message";

const SCAN_TIMEOUT_MS = 100;
const SUCCESS_TOAST_DURATION = 2000;
const ERROR_TOAST_DURATION = 3000;

const ScanForm = () => {
  const [numeroBL, setNumeroBL] = useState("");
  const [message, setMessage] = useState(null);
  const [showMessage, setShowMessage] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const inputRef = useRef(null);
  const scanBuffer = useRef("");
  const scanTimeout = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    document.body.style.margin = "0";
    document.body.style.backgroundColor = "#f5f7fa";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const resetScan = useCallback(() => {
    setShowMessage(false);
    setNumeroBL("");
    setIsProcessing(false);
    inputRef.current?.focus();
  }, []);

  const handleScanComplete = useCallback(async (scannedValue) => {
    if (!scannedValue || isProcessing) return;
    setIsProcessing(true);
    setNumeroBL(scannedValue);

    try {
      const result = await sendScan(scannedValue);
      setMessage({ type: "success", text: result.Message || "Scan enregistré avec succès ✅" });
      setShowMessage(true);
      setTimeout(resetScan, SUCCESS_TOAST_DURATION);
    } catch (err) {
      setMessage({ type: "danger", text: err.Message || err.message || "Erreur lors du scan ❌" });
      setShowMessage(true);
      setTimeout(resetScan, ERROR_TOAST_DURATION);
    }
  }, [isProcessing, resetScan]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (isProcessing) return;
      if (e.key === "Enter" && scanBuffer.current) {
        handleScanComplete(scanBuffer.current);
        scanBuffer.current = "";
        return;
      }
      if (e.key.length > 1) return;
      scanBuffer.current += e.key;
      clearTimeout(scanTimeout.current);
      scanTimeout.current = setTimeout(() => {
        if (scanBuffer.current) {
          handleScanComplete(scanBuffer.current);
          scanBuffer.current = "";
        }
      }, SCAN_TIMEOUT_MS);
    };
    window.addEventListener("keypress", handleKeyPress);
    return () => {
      window.removeEventListener("keypress", handleKeyPress);
      clearTimeout(scanTimeout.current);
    };
  }, [isProcessing, handleScanComplete]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (numeroBL && !isProcessing) handleScanComplete(numeroBL);
    },
    [numeroBL, isProcessing, handleScanComplete]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(180deg, #f8fafc 0%, #eef1f5 100%)",
        padding: "20px",
      }}
    >
      {message && (
        <Message
          type={message.type}
          text={message.text}
          show={showMessage}
          onClose={resetScan}
          duration={message.type === "success" ? SUCCESS_TOAST_DURATION : ERROR_TOAST_DURATION}
        />
      )}

      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "40px 30px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "25px", color: "#0d6efd", fontWeight: 600 }}>
          📦 Scanner un Code-Barres
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            ref={inputRef}
            value={numeroBL}
            readOnly
            placeholder="Scannez le code-barres..."
            style={{
              width: "100%",
              height: "60px",
              fontSize: "1.2rem",
              fontWeight: "500",
              borderRadius: "10px",
              border: numeroBL
                ? "2px solid #198754"
                : isProcessing
                ? "2px solid #ffc107"
                : "2px solid #ced4da",
              backgroundColor: "#f9fafb",
              color: "#212529",
              textAlign: "center",
              marginBottom: "20px",
              transition: "all 0.3s ease",
              outline: "none",
              boxShadow: numeroBL
                ? "0 0 6px rgba(25,135,84,0.3)"
                : isProcessing
                ? "0 0 6px rgba(255,193,7,0.3)"
                : "none",
            }}
          />

          <div
            style={{
              height: "24px",
              marginBottom: "20px",
              fontSize: "0.95rem",
              color: isProcessing ? "#ffc107" : numeroBL ? "#198754" : "#6c757d",
              fontWeight: 500,
            }}
          >
            {isProcessing ? "⏳ Traitement en cours..." : numeroBL ? "✓ Code détecté" : "En attente du scan..."}
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={!numeroBL || isProcessing}
            style={{
              width: "100%",
              height: "48px",
              fontSize: "1.1rem",
              fontWeight: "600",
              borderRadius: "8px",
            }}
          >
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Envoi...
              </>
            ) : (
              "Valider"
            )}
          </Button>

          <Button
            variant="outline-secondary"
            onClick={() => handleScanComplete("BL209982")}
            style={{
              width: "100%",
              height: "46px",
              marginTop: "12px",
              fontSize: "1rem",
              fontWeight: "500",
              borderRadius: "8px",
            }}
          >
            Simuler un Scan
          </Button>
        </form>
      </div>

      <footer
        style={{
          marginTop: "30px",
          textAlign: "center",
          color: "#6c757d",
          fontSize: "0.9rem",
        }}
      >
        <p style={{ margin: "4px 0" }}>Utilisez votre lecteur pour capturer le code-barres.</p>
        <p style={{ margin: "4px 0" }}>Le scan se valide automatiquement.</p>
      </footer>
    </div>
  );
};

export default ScanForm;
