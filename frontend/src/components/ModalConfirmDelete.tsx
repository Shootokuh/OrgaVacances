// src/components/ModalConfirmDelete.tsx
import "../styles/ModalConfirmDelete.css";

type ModalConfirmDeleteProps = {
  tripTitle: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ModalConfirmDelete({ tripTitle, onClose, onConfirm }: ModalConfirmDeleteProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Confirmation</h2>
        <p>Souhaitez-vous vraiment supprimer le voyage <strong>{tripTitle}</strong> ?</p>
        <div className="form-actions">
          <button onClick={onConfirm} className="button-danger">Oui, supprimer</button>
          <button onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

