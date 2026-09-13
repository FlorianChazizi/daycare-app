import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <p className="not-found-code">404</p>
      <h1>Η σελίδα δεν βρέθηκε</h1>
      <p>Ο σύνδεσμος που ακολουθήσατε ίσως έχει αλλάξει διεύθυνση ή δεν υπάρχει πια.</p>
      <Link to="/" className="btn-hero-primary">
        Επιστροφή στην αρχική
      </Link>
    </div>
  );
}
