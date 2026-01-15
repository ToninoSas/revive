import { useContext, useState } from "react";
import GenericButton from "../UI/GenericButton";
import styles from "./AddPaziente.module.css";
import AuthContext from "../../context/auth-context";
import { getServerMgr } from "../../backend_conn/ServerMgr";
import PatientContext from "../../context/patients-context";
import { Modal, Dropdown, Form } from "react-bootstrap";

function AddPaziente(props) {
    const auth_ctx = useContext(AuthContext);
    const patients_ctx = useContext(PatientContext);

    const [stepAggiuntaPaziente, setStepAggiuntaPaziente] = useState(1);

    // --- FORM STATES ---
    // Anagrafica
    const [enteredNome, setEnteredNome] = useState("");
    const [enteredCognome, setEnteredCognome] = useState("");
    const [enteredCittà, setEnteredCittà] = useState("");
    const [enteredData, setEnteredData] = useState("");
    const [enteredCF, setEnteredCF] = useState("");

    // Contatti
    const [enteredContattoEmail, setEnteredContattoEmail] = useState("");
    const [enteredContattoTelefono, setEnteredContattoTelefono] = useState("");

    // Inquadramento Clinico
    const [selectedPatologie, setSelectedPatologie] = useState([]);
    const [enteredDescrizione, setEnteredDescrizione] = useState("");

    // Account Credentials
    const [modaleCreazioneAccount, setModaleCreazioneAccount] = useState(false);
    const [enteredEmail, setEnteredEmail] = useState("");
    const [enteredPsw, setEnteredPsw] = useState("");

    // Validazione
    const [errors, setErrors] = useState({});

    // --- CONFIGURAZIONE OPZIONI CLINICHE ---
    const opzioniPatologie = [
        "Alzheimer",
        "Demenza Vascolare",
        "Demenza a Corpi di Lewy",
        "Demenza Frontotemporale",
        "MCI (Deficit Cognitivo Lieve)",
        "Parkinson-Demenza",
        "Declino Cognitivo Senile",
        "Altro"
    ];

    // --- LOGICA FUNZIONALE ---
    const handleCopyContactEmail = () => {
        setEnteredEmail(enteredContattoEmail);
    };

    const togglePatologia = (pat) => {
        setSelectedPatologie(prev =>
            prev.includes(pat) ? prev.filter(p => p !== pat) : [...prev, pat]
        );
    };

    const validateStep1 = () => {
        let newErrors = {title:"Ci sono dei campi mancanti:"};
        if (!enteredNome.trim()) newErrors.nome = "Nome obbligatorio";
        if (!enteredCognome.trim()) newErrors.cognome = "Cognome obbligatorio";
        if (!enteredCittà.trim()) newErrors.citta = "Città obbligatoria";
        if (!enteredData) newErrors.data = "Data non valida";
        if (enteredCF.trim().length !== 16) newErrors.codiceFiscale = "Il codice fiscale deve essere di 16 caratteri";
        if (enteredContattoEmail.trim() && !enteredContattoEmail.includes("@")) {
            newErrors.contattoEmail = "Email non valida";
        }

        if (Object.keys(newErrors).length !== 1) {
            const messaggio = Object.entries(newErrors)
                .map(([campo, errore]) => `${errore}`)
                .join('\n');
            alert(messaggio);
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 1;
    };

    const formSubmitHandler = async (withAccount = false) => {
        // Validazione credenziali se richiesto account
        if (withAccount && (!enteredEmail.includes("@") || enteredPsw.length < 6)) {
            setErrors(prev => ({
                ...prev,
                accountEmail: !enteredEmail.includes("@"),
                psw: enteredPsw.length < 6
            }));
            return;
        }

        const datiPaziente = {
            doct_UID: auth_ctx.utenteLoggatoUID,
            nome: enteredNome,
            cognome: enteredCognome,
            city: enteredCittà,
            codiceFiscale: enteredCF.toUpperCase(),
            dataNascita: enteredData,
            contattoEmail: enteredContattoEmail,
            contattoCellulare: enteredContattoTelefono,
            patologie: selectedPatologie, // Inviato come array di stringhe
            descrizione: enteredDescrizione
        };

        try {
            const res = await getServerMgr().addPaziente(datiPaziente);

            if (withAccount && res.pazienteID) {
                await getServerMgr().addAccount(
                    enteredNome,
                    enteredCognome,
                    2,
                    enteredEmail,
                    enteredPsw,
                    res.pazienteID
                );
            }

            alert("Operazione completata con successo!");
            patients_ctx.nuovoPazienteHandler();
        } catch (err) {
            console.error("Errore salvataggio:", err);
            alert("Errore nel salvataggio dei dati.");
        }
    };

    return (
        <div className={styles.mainContainer}>
            <div className={styles.stepperCard}>
                {/* Header Stepper Progressivo */}
                <div className={styles.progressHeader}>
                    <div className={`${styles.step} ${stepAggiuntaPaziente >= 1 ? styles.active : ""}`}>
                        <span className={styles.stepNum}>1</span>
                        <span className={styles.stepLabel}>Anagrafica</span>
                    </div>
                    <div className={styles.line}></div>
                    <div className={`${styles.step} ${stepAggiuntaPaziente >= 2 ? styles.active : ""}`}>
                        <span className={styles.stepNum}>2</span>
                        <span className={styles.stepLabel}>Account</span>
                    </div>
                </div>

                {stepAggiuntaPaziente === 1 ? (
                    <div className={styles.formSection}>
                        <h2 className={styles.sectionTitle}>Anagrafica e Contatti</h2>
                        <div className={styles.gridFields}>
                            {/* Dati Personali */}
                            <div className={styles.inputGroup}>
                                <label>Nome</label>
                                <input type="text" value={enteredNome} onChange={(e) => setEnteredNome(e.target.value)} className={errors.nome ? styles.invalid : ""} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Cognome</label>
                                <input type="text" value={enteredCognome} onChange={(e) => setEnteredCognome(e.target.value)} className={errors.cognome ? styles.invalid : ""} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Città</label>
                                <input type="text" value={enteredCittà} onChange={(e) => setEnteredCittà(e.target.value)} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Data di Nascita</label>
                                <input type="date" value={enteredData} onChange={(e) => setEnteredData(e.target.value)} />
                            </div>

                            {/* Recapiti */}
                            <div className={styles.inputGroup}>
                                <label>Email di Contatto</label>
                                <input type="email" value={enteredContattoEmail} onChange={(e) => setEnteredContattoEmail(e.target.value)} placeholder="famigliare@mail.it" />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Telefono di Contatto</label>
                                <input type="tel" value={enteredContattoTelefono} onChange={(e) => setEnteredContattoTelefono(e.target.value)} placeholder="+39..." />
                            </div>

                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label>Codice Fiscale</label>
                                <input type="text" value={enteredCF} onChange={(e) => setEnteredCF(e.target.value.toUpperCase())} maxLength={16} />
                            </div>

                            <div className={styles.divider}></div>

                            {/* Inquadramento Clinico */}
                            <h2 className={`${styles.sectionTitle} ${styles.fullWidth}`}>Inquadramento Clinico</h2>

                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label>Patologie Cognitive / Demenze</label>
                                <Dropdown className={styles.customDropdown}>
                                    <Dropdown.Toggle className={styles.dropdownToggle}>
                                        {selectedPatologie.length === 0
                                            ? "Seleziona patologie..."
                                            : `Voci selezionate: ${selectedPatologie.length}`}
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className={styles.dropdownMenu}>
                                        {opzioniPatologie.map((pat, idx) => (
                                            <div key={idx} className={styles.dropdownItemCustom} onClick={() => togglePatologia(pat)}>
                                                <Form.Check
                                                    type="checkbox"
                                                    label={pat}
                                                    checked={selectedPatologie.includes(pat)}
                                                    readOnly
                                                />
                                            </div>
                                        ))}
                                    </Dropdown.Menu>
                                </Dropdown>

                                <div className={styles.tagContainer}>
                                    {selectedPatologie.map(p => (
                                        <span key={p} className={styles.tag} onClick={() => togglePatologia(p)}>
                                            {p} ✕
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                <label>Anamnesi e Descrizione Clinica</label>
                                <textarea
                                    rows="3"
                                    className={styles.textArea}
                                    value={enteredDescrizione}
                                    onChange={(e) => setEnteredDescrizione(e.target.value)}
                                    placeholder="Inserisci note su deficit, farmaci o stadiazione..."
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <GenericButton onClick={props.hideFormNewPaziente} buttonText="Annulla" red_styling generic_button />
                            <GenericButton onClick={() => validateStep1() && setStepAggiuntaPaziente(2)} buttonText="Continua" generic_button />
                        </div>
                    </div>
                ) : (
                    /* Step 2: Scelta Account */
                    <div className={styles.formSection}>
                        <div className={styles.accountChoice}>
                            <div className={styles.iconCircle}>🔑</div>
                            <h2 className={styles.sectionTitle}>Accesso Paziente</h2>
                            <p className={styles.description}>
                                Creando un account, il paziente potrà accedere alla sua area personale tramite App o QR Code.
                            </p>
                            <div className={styles.choiceButtons}>
                                <GenericButton onClick={() => setModaleCreazioneAccount(true)} buttonText="Sì, Crea Account" generic_button />
                                <GenericButton onClick={() => formSubmitHandler(false)} buttonText="No, Salva solo Anagrafica" generic_button />
                            </div>
                            <button className={styles.backLink} onClick={() => setStepAggiuntaPaziente(1)}>Torna all'anagrafica</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modale Creazione Credenziali */}
            <Modal centered show={modaleCreazioneAccount} onHide={() => setModaleCreazioneAccount(false)} contentClassName={styles.customModal}>
                <Modal.Header closeButton><Modal.Title>Nuove Credenziali</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <label>Email / Username Accesso</label>
                            {enteredContattoEmail && (
                                <button type="button" className={styles.copyBtn} onClick={handleCopyContactEmail}>
                                    📋 Usa email contatto
                                </button>
                            )}
                        </div>
                        <input type="email" value={enteredEmail} onChange={(e) => setEnteredEmail(e.target.value)} placeholder="mail@accesso.it" />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Password (min. 6 caratteri)</label>
                        <input type="password" value={enteredPsw} onChange={(e) => setEnteredPsw(e.target.value)} placeholder="******" />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <GenericButton onClick={() => formSubmitHandler(true)} buttonText="Finalizza e Salva" generic_button />
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AddPaziente;