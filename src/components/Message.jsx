import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { Toast } from "react-bootstrap";

const Message = ({ type, text, show, onClose, duration }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

 
  const bgColor = type === "success" ? "#0d6efd" : "#dc3545"; 
  const icon = type === "success" ? "✓" : "✗";
  const title = type === "success" ? "Succès" : "Erreur";

  return (
    <Toast
      show={show}
      onClose={onClose}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        minWidth: "300px",
        maxWidth: "400px",
        zIndex: 9999,
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          backgroundColor: bgColor,
          color: "#fff",
          padding: "12px 16px",
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        <span style={{ marginRight: "10px" }}>{icon}</span>
        <span style={{ flexGrow: 1 }}>{title}</span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1.1rem",
          }}
        >
          ×
        </button>
      </div>
      <div
        style={{
          backgroundColor: "#f1f5f9",
          color: "#212529",
          padding: "12px 16px",
          fontSize: "0.95rem",
        }}
      >
        {text}
      </div>
    </Toast>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf(["success", "danger"]).isRequired,
  text: PropTypes.string.isRequired,
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

Message.defaultProps = {
  duration: 2000,
};

export default Message;
