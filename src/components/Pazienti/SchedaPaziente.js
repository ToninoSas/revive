import styles from "./SchedaPaziente.module.css";
import { useEffect, useState } from "react";
import StatistichePaziente from "./StatistichePaziente";
import GenericButton from "../UI/GenericButton";
import { Accordion, Modal, Tab, Tabs } from "react-bootstrap";
import { getServerMgr } from "../../backend_conn/ServerMgr";
import QRCode from "react-qr-code";

function SchedaPaziente(props) {
  const [sezioneScheda, setSezioneScheda] = useState("DATI_PERSONALI");
  const [credentials, setCredentials] = useState(
    props.credentialsAccount || []
  );
  const [showCredentials, setShowCredentials] = useState(false);
  const [createCredentials, setCreateCredentials] = useState(false);

  // Form states
  const [enteredEmail, setEnteredEmail] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [validity, setValidity] = useState({ email: true, password: true });

  useEffect(() => {
    setCredentials(props.credentialsAccount || []);
  }, [props.credentialsAccount]);

  const creaAccountPaziente = async () => {
    const isEmailValid = enteredEmail.includes("@");
    const isPassValid = enteredPassword.trim().length >= 6;

    setValidity({ email: isEmailValid, password: isPassValid });

    if (isEmailValid && isPassValid) {
      try {
        const accounts = await getServerMgr().getAccount();
        if (accounts.some((acc) => acc.email === enteredEmail)) {
          alert("Email già esistente!");
          return;
        }
        const newId = await getServerMgr().addAccount(
          props.nome,
          props.cognome,
          2,
          enteredEmail,
          enteredPassword,
          props.id
        );
        await getServerMgr().updatePatientWithProfileID(
          newId,
          props.id,
          enteredEmail
        );
        const updatedCreds = await getServerMgr().getPatientCredentials(newId);
        setCredentials(updatedCreds);
        console.log("Credenziali paziente: ");
        console.log(updatedCreds);
        setCreateCredentials(false);
        alert("Account creato con successo!");
      } catch (err) {
        console.error(err);
      }
    }
  };

  console.log(props)

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatar}>
          {props.nome.charAt(0)}
          {props.cognome.charAt(0)}
        </div>
        <div>
          <h1 className={styles.page_title}>
            {props.nome} {props.cognome}
          </h1>
          <p className={styles.patient_id}>ID Paziente: #{props.id}</p>
        </div>
      </header>

      <div className={styles.main_card}>
        <Tabs
          activeKey={sezioneScheda}
          onSelect={(k) => setSezioneScheda(k)}
          className={styles.custom_tabs}
        >
          <Tab eventKey="DATI_PERSONALI" title="📍 Anagrafica">
            <div className={styles.tab_content}>
              <div className={styles.info_grid}>
                <div className={styles.info_group}>
                  <h3>Informazioni Personali</h3>
                  <div className={styles.data_row}>
                    <span>Città di Nascita:</span>{" "}
                    <strong>{props.città}</strong>
                  </div>
                  <div className={styles.data_row}>
                    <span>Data di Nascita:</span>{" "}
                    <strong>{props.datanascita}</strong>
                  </div>
                  <div className={styles.data_row}>
                    <span>Codice Fiscale:</span>{" "}
                    <strong>{props.codicefiscale}</strong>
                  </div>
                </div>
                <div className={styles.info_group}>
                  <h3>Contatti</h3>
                  <div className={styles.data_row}>
                    <span>Email:</span>{" "}
                    <strong>{props.contattoEmail || "N/A"}</strong>
                  </div>
                  <div className={styles.data_row}>
                    <span>Cellulare:</span>{" "}
                    <strong>{props.contattoCellulare || "N/A"}</strong>
                  </div>
                </div>
                <div className={styles.info_group}>
                  <h3>Inquadramento Clinico</h3>
                  <div className={styles.data_row}>
                    <span>Patologie:</span>{" "}
                    <strong>{props.patologie.map((patologia)=>patologia+ ", ")}</strong>
                  </div>
                  <div className={styles.data_row}>
                    <span>Descrizione clinica:</span>{" "}
                    <strong>{props.descrizione}</strong>
                  </div>
                </div>
                <div className={styles.info_group_full}>
                  <h3>Accesso Piattaforma</h3>
                  {credentials.length === 0 ? (
                    <div className={styles.empty_creds}>
                      <p>Nessun account associato.</p>
                      <GenericButton
                        onClick={() => setCreateCredentials(true)}
                        buttonText="Crea Credenziali"
                        generic_button
                      />
                    </div>
                  ) : (
                    <div className={styles.active_creds}>
                      <span>Account attivo: {credentials[0]?.email}</span>
                      <GenericButton
                        onClick={() => setShowCredentials(true)}
                        buttonText="Visualizza Accesso"
                        generic_button
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Tab>

          <Tab eventKey="GIOCHI" title="🎮 Giochi">
            <div className={styles.tab_content}>
              {(props.listaGiochi==null || props.listaGiochi?.length === 0) ? (
                <p className={styles.no_data_msg}>
                  Nessun gioco assegnato attualmente.
                </p>
              ) : (
                <Accordion className={styles.custom_accordion}>
                  {props.listaGiochi.map((gioco, i) => (
                    <Accordion.Item eventKey={i.toString()} key={gioco.gameID}>
                      <Accordion.Header>{gioco.nomeGioco}</Accordion.Header>
                      <Accordion.Body>
                        <div className={styles.accordion_grid}>
                          <div>
                            Tipo: <strong>{gioco.tipoGioco}</strong>
                          </div>
                          <div>
                            Livello: <strong>{gioco.livelloGioco}</strong>
                          </div>
                        </div>
                      </Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              )}
            </div>
          </Tab>

          <Tab eventKey="STATISTICHE" title="📊 Statistiche">
            <div className={styles.tab_content}>
              <StatistichePaziente
                pazienteID={props.id}
                stats={props.statsPaziente}
              />
            </div>
          </Tab>
        </Tabs>
      </div>

      <div className={styles.footer_actions}>
        <GenericButton
          generic_button
          red_styling
          onClick={props.goBackButton}
          buttonText="Torna allo Schedario"
        />
      </div>

      {/* Modale Visualizzazione Credenziali */}
      <Modal
        centered
        show={showCredentials}
        onHide={() => setShowCredentials(false)}
        contentClassName={styles.modal_custom}
      >
        <Modal.Header closeButton>
          <Modal.Title>Chiave di Accesso Paziente</Modal.Title>
        </Modal.Header>
        <Modal.Body className={styles.modal_qr_body}>
          <div className={styles.qr_container}>
            <QRCode
              value={`https://cognicare.altervista.org/QRCodeLogin/${credentials[0]?.UID}`}
              size={180}
            />
          </div>
          <div className={styles.creds_details}>
            <p>
              <strong>Email:</strong> {props.credentialsAccount.email}
            </p>
            <p>
              <strong>Password:</strong> {props.credentialsAccount.password}
            </p>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modale Creazione Credenziali */}
      <Modal
        centered
        show={createCredentials}
        onHide={() => setCreateCredentials(false)}
        contentClassName={styles.modal_custom}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nuovo Account Paziente</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.form_group}>
            <label>Email</label>
            <input
              type="email"
              value={enteredEmail}
              onChange={(e) => setEnteredEmail(e.target.value)}
              className={!validity.email ? styles.invalid : ""}
            />
          </div>
          <div className={styles.form_group}>
            <label>Password (min. 6 caratteri)</label>
            <input
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className={!validity.password ? styles.invalid : ""}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <GenericButton
            onClick={creaAccountPaziente}
            buttonText="Conferma e Crea"
            generic_button
          />
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SchedaPaziente;
