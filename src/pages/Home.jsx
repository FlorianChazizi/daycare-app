import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Για εκπαιδευτικούς",
    text: "Καταγράψτε παρουσίες, γεύματα, ύπνο και διάθεση σε λίγα δευτερόλεπτα, ανά τμήμα.",
  },
  {
    title: "Για γονείς",
    text: "Δείτε την ημέρα του παιδιού σας τη στιγμή που καταγράφεται, χωρίς τηλεφωνήματα.",
  },
  {
    title: "Για διευθυντές",
    text: "Διαχειριστείτε τμήματα, προσωπικό, ανακοινώσεις και εβδομαδιαίο μενού από ένα σημείο.",
  },
  {
    title: "Ασφάλεια & ιδιωτικότητα",
    text: "Κάθε σχολείο βλέπει μόνο τα δικά του δεδομένα. Πρόσβαση μόνο στους κατάλληλους ανθρώπους.",
  },
];

const STEPS = [
  {
    step: "1",
    title: "Ο σταθμός δημιουργεί λογαριασμό",
    text: "Ο διευθυντής προσθέτει τμήματα, παιδιά και προσκαλεί τους εκπαιδευτικούς του.",
  },
  {
    step: "2",
    title: "Οι εκπαιδευτικοί καταγράφουν την ημέρα",
    text: "Παρουσία, γεύμα, ύπνος, διάθεση — με λίγα πατήματα, μέσα από το κινητό.",
  },
  {
    step: "3",
    title: "Οι γονείς βλέπουν σε πραγματικό χρόνο",
    text: "Με έναν απλό κωδικό πρόσκλησης, ο γονέας συνδέεται και παρακολουθεί την ημέρα του παιδιού.",
  },
];

export default function Home() {
  return (
    <div className="landing">
      <section className="hero">
        <h1 className="hero-title">
          Η καθημερινότητα του παιδιού σας,
          <br />σε πραγματικό χρόνο.
        </h1>
        <p className="hero-subtitle">
          Το Day Care συνδέει βρεφονηπιακούς σταθμούς, εκπαιδευτικούς και γονείς σε μία απλή
          και ασφαλή εφαρμογή — παρουσίες, γεύματα, ύπνος και ανακοινώσεις, όλα σε ένα μέρος.
        </p>
        <div className="hero-actions">
          <Link to="/login" className="btn-hero-primary">
            Σύνδεση
          </Link>
          <a href="#mission" className="btn-hero-secondary">
            Μάθετε περισσότερα
          </a>
        </div>
      </section>

      <section id="mission" className="mission">
        <h2>Τι θέλουμε να πετύχουμε</h2>
        <p>
          Ξεκινάμε μικρά και συγκεκριμένα: να κάνουμε μία μόνο συνήθεια εύκολη — έναν
          εκπαιδευτικό να καταγράφει πραγματικά την ημέρα ενός παιδιού, κάθε μέρα. Πιστεύουμε
          ότι όταν αυτό λειτουργεί άψογα, όλα τα υπόλοιπα (ανακοινώσεις, μενού, εκδηλώσεις)
          χτίζονται φυσικά από πάνω. Χτίζουμε μαζί με πραγματικούς σταθμούς, ένα βήμα τη φορά.
        </p>
      </section>

      <section className="features">
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="how-it-works">
        <h2>Πώς λειτουργεί</h2>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <div key={s.step} className="step-card">
              <div className="step-number">{s.step}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-final">
        <h2>Έτοιμοι να ξεκινήσετε;</h2>
        <p>
          Αν είστε ήδη μέλος ενός σταθμού που χρησιμοποιεί το Day Care, συνδεθείτε παρακάτω.
          Αν εκπροσωπείτε έναν σταθμό και θέλετε να μάθετε περισσότερα,{" "}
          <Link to="/support">επικοινωνήστε μαζί μας</Link>.
        </p>
        <Link to="/login" className="btn-hero-primary">
          Σύνδεση
        </Link>
      </section>
    </div>
  );
}
