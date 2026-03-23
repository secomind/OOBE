import { Modal, Button } from "react-bootstrap";
import { useState , type ReactNode } from "react";
import "./AIErrorModal.scss";

interface AIErrorModalProps {
  show: boolean;
  onHide: () => void;
  onContinue: () => Promise<boolean>;
  onExit?: () => void;
  message?: ReactNode;
}

const AIErrorModal = ({ 
  show, 
  onHide, 
  onContinue, 
  onExit,
  message = (
    <>
      <strong>No AI model</strong> is currently deployed on this device.<br />
      To run this application, deploy a model from your <strong>Clea</strong> account.<br />
      If you have already deployed the model click '<strong>Check again</strong>' to verify.
    </>
  )}: AIErrorModalProps) => {  const [loading, setLoading] = useState(false);
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
        setErrorMsg("No model detected. Please deploy a model and try again");
      }
    } catch (e) {
      setLoading(false);
      setErrorMsg("No model detected. Please deploy a model and try again");
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered
      backdrop="static"
      keyboard={false}
      dialogClassName="custom-modal"
      contentClassName="border border-grey rounded-4 overflow-hidden"
    >
      <Modal.Header 
        className="border-0" 
        style={{ backgroundColor: '#000', paddingBottom: '0.5rem' }}
      >
      </Modal.Header>

      <Modal.Body 
        className="px-5 py-4 text-center border-0 d-flex flex-column justify-content-center" 
        style={{ backgroundColor: '#000', color: '#fff' }}
      >
        <h2 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>Attention</h2>
        
        <p className="mb-4" style={{ fontSize: '2rem', opacity: 0.9, lineHeight: '1.6' }}>
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

        <div className="d-flex justify-content-center gap-3">
          <Button 
            variant="primary" 
            onClick={handleContinue} 
            disabled={loading}
            className="px-5 py-3 fw-bold"
            style={{ borderRadius: '15px', backgroundColor: '#fff', color: '#000', border: 'none' }}
          >
            <h2 className="mb-1" style={{ fontSize: '1.7rem', fontWeight: '800' }}>Check again</h2>
          </Button>
          <Button 
            variant="outline-light" 
            onClick={onExit || onHide} 
            disabled={loading}
            className="px-5 py-3 fw-bold"
            style={{ borderRadius: '15px', border: '2px solid #fff' }}
          >
            <h2 className="mb-1" style={{ fontSize: '1.7rem', fontWeight: '800',color: '#fff' }}>Exit</h2>
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AIErrorModal;
