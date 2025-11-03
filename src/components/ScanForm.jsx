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
    document.body.style.backgroundColor = "#f4f6f8";
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

  const handleScanComplete = useCallback(
    async (scannedValue) => {
      if (!scannedValue || isProcessing) return;
      setIsProcessing(true);
      setNumeroBL(scannedValue);

      try {
        const result = await sendScan(scannedValue);
        setMessage({
          type: "success",
          text: result.Message || "✅ Scan enregistré avec succès",
        });
        setShowMessage(true);
        setTimeout(resetScan, SUCCESS_TOAST_DURATION);
      } catch (err) {
        setMessage({
          type: "danger",
          text: err.Message || err.message || "❌ Erreur lors du scan",
        });
        setShowMessage(true);
        setTimeout(resetScan, ERROR_TOAST_DURATION);
      }
    },
    [isProcessing, resetScan]
  );

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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
        padding: "20px",
      }}
    >
      {message && (
        <Message
          type={message.type}
          text={message.text}
          show={showMessage}
          onClose={resetScan}
          duration={
            message.type === "success"
              ? SUCCESS_TOAST_DURATION
              : ERROR_TOAST_DURATION
          }
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
        <h2
          style={{
            marginBottom: "25px",
            color: "#0d6efd",
            fontWeight: 600,
            fontSize: "1.6rem",
          }}
        >
          Scanner un Code-Barres
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
                ? "2px solid #0d6efd"
                : "2px solid #ced4da",
              backgroundColor: "#f9fafb",
              color: "#212529",
              textAlign: "center",
              marginBottom: "18px",
              transition: "all 0.3s ease",
              outline: "none",
              boxShadow:
                numeroBL || isProcessing
                  ? "0 0 8px rgba(13,110,253,0.15)"
                  : "none",
            }}
          />

          <div
            style={{
              height: "24px",
              marginBottom: "20px",
              fontSize: "0.95rem",
              color: isProcessing ? "#0d6efd" : numeroBL ? "#198754" : "#6c757d",
              fontWeight: 500,
            }}
          >
            {isProcessing
              ? "Lecture en cours..."
              : numeroBL
              ? "✓ Code détecté"
              : "En attente du scan..."}
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
              marginBottom: "10px",
            }}
          >
            {isProcessing ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Envoi...
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
              fontSize: "1rem",
              fontWeight: "500",
              borderRadius: "8px",
            }}
          >
            Simuler un Scan
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ScanForm;
