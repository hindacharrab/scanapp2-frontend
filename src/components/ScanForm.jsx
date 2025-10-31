// ScanForm.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { sendScan } from "../services/ScanService";
import { Button } from "react-bootstrap";
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
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    document.body.style.backgroundColor = "#f8f9fa";
    return () => {
      document.body.style.margin = "";
      document.body.style.padding = "";
      document.body.style.overflow = "";
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
      setMessage({ type: "success", text: result.Message || "Scan enregistré avec succès" });
      setShowMessage(true);
      setTimeout(resetScan, SUCCESS_TOAST_DURATION);
    } catch (err) {
      setMessage({ type: "danger", text: err.Message || err.message || "Erreur lors du scan" });
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

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (numeroBL && !isProcessing) handleScanComplete(numeroBL);
  }, [numeroBL, isProcessing, handleScanComplete]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "center",
      paddingTop: "20vh",
      paddingBottom: "150px", // espace pour instructions
      backgroundColor: "#ffffff",
      position: "relative"
    }}>
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
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2 style={{ marginBottom: "30px", color: "#212529", fontWeight: 600, fontSize: "1.8rem" }}>
          Scanner Code-Barres
        </h2>

        <form onSubmit={handleSubmit} style={{ textAlign: "center", width: "100%" }}>
          <input
            type="text"
            ref={inputRef}
            value={numeroBL}
            readOnly
            onKeyDown={(e) => e.preventDefault()}
            onKeyPress={(e) => e.preventDefault()}
            onKeyUp={(e) => e.preventDefault()}
            onInput={(e) => e.preventDefault()}
            onPaste={(e) => e.preventDefault()}
            placeholder="Scannez le code-barres..."
            className="text-center"
            style={{
              height: "70px",
              width: "100%",
              fontSize: "1.6rem",
              fontWeight: "600",
              borderRadius: "12px",
              border: isProcessing
                ? "3px solid #ffc107"
                : numeroBL
                ? "3px solid #28a745"
                : "2px solid #ced4da",
              backgroundColor: isProcessing ? "#fff3cd" : "#f8f9fa",
              color: "#212529",
              marginBottom: "25px",
              padding: "0 15px",
              transition: "all 0.3s ease",
              outline: "none",
              boxShadow: numeroBL ? "0 0 0 0.2rem rgba(40, 167, 69, 0.25)" : "none",
              cursor: "text",
              userSelect: "none",
            }}
          />

          <div style={{ height: "24px", marginBottom: "20px", fontSize: "0.9rem", color: "#6c757d", fontWeight: 500 }}>
            {isProcessing ? (
              <span style={{ color: "#ffc107" }}>⏳ Traitement en cours...</span>
            ) : numeroBL ? (
              <span style={{ color: "#28a745" }}>✓ Code détecté</span>
            ) : (
              <span>En attente du scan...</span>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            disabled={!numeroBL || isProcessing}
            style={{
              width: "180px",
              height: "50px",
              fontSize: "1.1rem",
              fontWeight: "600",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              opacity: !numeroBL || isProcessing ? 0.5 : 1,
              cursor: !numeroBL || isProcessing ? "not-allowed" : "pointer",
            }}
          >
            {isProcessing ? "Envoi..." : "Valider"}
          </Button>
          <Button
    variant="secondary"
    onClick={() => handleScanComplete("1234567890")}
    style={{
      width: "180px",
      height: "50px",
      fontSize: "1.1rem",
      fontWeight: "600",
      borderRadius: "10px",
      marginTop: "15px",
    }}
  >
    Simuler Scan
  </Button>
        </form>
      </div>

      {/* Footer mobile-friendly */}
      <div
        style={{
          position: "absolute",
          bottom: "env(safe-area-inset-bottom, 20px)",
          width: "100%",
          textAlign: "center",
          color: "#6c757d",
          fontSize: "0.9rem",
          padding: "0 10px",
          zIndex: 1000
        }}
      >
        <p style={{ margin: "5px 0" }}>Utilisez votre scanner pour capturer le code-barres</p>
        <p style={{ margin: "5px 0" }}>Le scan se valide automatiquement</p>
      </div>
    </div>
  );
};

export default ScanForm;
