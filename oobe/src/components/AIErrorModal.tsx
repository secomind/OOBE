import { Modal, Button } from "react-bootstrap";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";

interface AIErrorModalProps {
  show: boolean;
  onHide: () => void;
  onContinue: () => Promise<boolean>;
  message?: string;
}

const AIErrorModal = ({ 
  show, 
  onHide, 
  onContinue, 
  message = "if you see this pop-up, please check that the AI service is available or deployed." 
}: AIErrorModalProps) => {  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleContinue = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const ok = await onContinue();
      setLoading(false);
      if (ok) {
        onHide();
      } else {
        setErrorMsg("Still unavailable. Please try again.");
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg("Still unavailable. Please try again.");
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      backdrop="static" 
      contentClassName="border border-white rounded-4 overflow-hidden"
    >
      <Modal.Header 
        className="flex-row-reverse border-0" 
        style={{ backgroundColor: '#000', paddingBottom: '0.5rem' }}
      >
        <Modal.Title className="w-100 d-flex justify-content-end">
          <Button variant="link" className="close-icon-button p-0 text-white shadow-none" onClick={onHide}>
            <FontAwesomeIcon icon={faX} size="sm" style={{ color: '#fff' }} />
          </Button>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body 
        className="px-4 pb-5 pt-0 text-center border-0" 
        style={{ backgroundColor: '#000', color: '#fff' }}
      >
        {}
        <h2 className="fw-bold mb-3" style={{ fontSize: '2rem' }}>Welcome</h2>
        
        {}
        <p className="mb-4" style={{ fontSize: '1.7rem', opacity: 0.9 }}>
          {message}
        </p>
        
        {errorMsg && (
          <div 
            className="mb-4 fw-bold" 
            style={{ color: '#ff0000', fontSize: '1.4rem', textShadow: '0 0 10px rgba(255,0,0,0.3)' }}
          >
            {errorMsg}
          </div>
        )}

        <div>
          <Button 
            variant="primary" 
            onClick={handleContinue} 
            disabled={loading}
            className="px-5 py-2 fw-bold"
            style={{ borderRadius: '50px', backgroundColor: '#007bff', border: 'none' }}
          >
            {loading ? (
              <span className="d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" />
                Checking...
              </span>
            ) : (
              <h2 className="fw-bold mb-1" style={{ fontSize: '1.4rem' }}>Continue with analysis</h2>
            )}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AIErrorModal;
