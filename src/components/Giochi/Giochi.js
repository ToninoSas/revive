import styles from "./Giochi.module.css";
import { useContext, useState } from "react";
import GameContext from "../../context/game-context";
import GenericButton from "../UI/GenericButton";
import RisultatiGioco, { RisultatiGiocoPazAccnt } from "./RisultatiGioco";
import ListaGiochi from "./ListaGiochi";
import AddGioco from "./AddGioco";
import EditGioco from "./EditGioco";
import AddDomanda from "./AddDomanda";
import ExerciseGuessTheFace from "./ExerciseGuessTheFace";
import EditDomanda from "./EditDomanda";
import GuessTheWord from "./GuessTheWord";
import ExerciseReflexes from "./ExerciseReflexes";
import AuthContext from "../../context/auth-context";
import AssignGameToPatient from "./AssignGameToPatient";
import ExercisePairGame from "./ExercisePairGame";
import SearchBox from "../UI/SearchBox";
import RatingEmotivo from "../Giochi/RatingEmotivo"; // Importazione corretta

// Variabili di supporto esterne
let modifica_gioco;
let modifica_domanda;
let assegnazione_gioco;
let risultati_utente_gioco;

var giocoSvoltoID;
let TIPOGIOCO;
let CODICEGIOCO;
let LIVELLOGIOCO;
let DOMANDEGIOCO = [];
let NUMEROCOPPIE;
let INDICEGIOCO_VAR = -1;

function Giochi() {
  const auth_ctx = useContext(AuthContext);
  const game_ctx = useContext(GameContext);

  const [showSearchBoxAndButton, setShowSearchBoxAndButton] = useState(true);
  const [showElencoGiochi, setShowElencoGiochi] = useState(true);
  const [showAddNewQuestion, setShowAddNewQuestion] = useState(false);
  const [showAddNewGame, setShowAddNewGame] = useState(false);
  const [showEditGame, setShowEditGame] = useState(false);
  const [showEditQuestion, setShowEditQuestion] = useState(false);
  const [showAssignGameTo, setShowAssignGameTo] = useState(false);
  const [showGameResults, setShowGameResults] = useState(false);
  
  // STATI PER IL FEEDBACK EMOTIVO
  const [showFeedback, setShowFeedback] = useState(false);
  const [tempResults, setTempResults] = useState(null);

  const [gameObject, setGameObject] = useState(null);
  const [gameActiveIndex, setGameActiveIndex] = useState(-1);

  const [tipoGiocoCercato, setTipoGiocoCercato] = useState("");

  function tipoGiocoChangeHandler(event) {
    setTipoGiocoCercato(event.target.value);
  }

  function formCreateNewGame() {
    setShowSearchBoxAndButton(false);
    setShowElencoGiochi(false);
    setShowAddNewGame(true);
  }

  function closeFormCreateNewGame() {
    setShowSearchBoxAndButton(true);
    setShowElencoGiochi(true);
    setShowAddNewGame(false);
  }

  function formEditGame(listaa) {
    modifica_gioco = (
      <EditGioco
        nomeGioco={listaa.nomeGioco}
        tipoGioco={listaa.tipoGioco}
        difficulty={listaa.livelloGioco}
        categoria={listaa.categoriaGioco}
        numero={listaa.numero}
        gameID={listaa.gameID}
        chiudiFormModifica={closeFormEditGame}
      />
    );
    setShowSearchBoxAndButton(false);
    setShowElencoGiochi(false);
    setShowEditGame(true);
  }

  function closeFormEditGame() {
    setShowSearchBoxAndButton(true);
    setShowElencoGiochi(true);
    setShowEditGame(false);
  }

  function startGame(stringa_TIPOGIOCO, stringa_CODICEGIOCO, stringa_LIVELLOGIOCO) {
    TIPOGIOCO = stringa_TIPOGIOCO;
    CODICEGIOCO = stringa_CODICEGIOCO;
    LIVELLOGIOCO = stringa_LIVELLOGIOCO;

    let coppie;
    let indice = game_ctx.listaGiochi.findIndex((g) => g.gameID === stringa_CODICEGIOCO);

    if (indice !== -1) {
      giocoSvoltoID = game_ctx.listaGiochi[indice].gameID;
      coppie = game_ctx.listaGiochi[indice].numero;
      INDICEGIOCO_VAR = indice;
      setGameActiveIndex(indice);
    }

    let domandeDelGioco = game_ctx.domande.filter((d) =>
      game_ctx.listaGiochi[indice].domandeID.includes(d.ID)
    );
    DOMANDEGIOCO = domandeDelGioco;
    NUMEROCOPPIE = coppie;

    const commonProps = {
      giocoTerminato: endGame,
      giocoAnnullato: closeGameResults,
      INDICEGIOCO: indice,
      TIPOGIOCO: stringa_TIPOGIOCO,
      LIVELLOGIOCO: stringa_LIVELLOGIOCO,
      domandeGioco: domandeDelGioco,
    };

    if(DOMANDEGIOCO.length === 0){
      console.log("gioco vuoto senza domande");
      setGameObject(null);
      alert("Questo gioco non presenta ancora domande!");
      return;
    }

    switch (stringa_TIPOGIOCO) {
      case "QUIZ":
      case "QUIZ CON SUONI":
      case "QUIZ CON IMMAGINI":
      case "QUIZ CON VIDEO":
        setGameObject(<ExerciseGuessTheFace {...commonProps} />);
        break;
      case "COMPLETA LA PAROLA":
        setGameObject(<GuessTheWord {...commonProps} />);
        break;
      case "GIOCO DELLE COPPIE":
        setGameObject(<ExercisePairGame {...commonProps} numeroCoppie={coppie} />);
        break;
      default:
        setGameObject(null);
    }
    setShowElencoGiochi(false);
  }

  function restartGame() {
    startGame(TIPOGIOCO, CODICEGIOCO, LIVELLOGIOCO);
    setShowGameResults(false);
  }

  // --- MODIFICA DI ENDGAME ---
  function endGame(risposteUtente, domandeTotali) {
    setGameObject(null);
    // 1. Memorizziamo i dati del punteggio
    setTempResults({ risposteUtente, domandeTotali });
    // 2. Attiviamo la UI del feedback (RatingEmotivo)
    setShowFeedback(true);
  }

  // --- NUOVA FUNZIONE DI GESTIONE FEEDBACK ---
  const handleFeedbackSelection = (valoreEmotivo) => {
    const { risposteUtente, domandeTotali } = tempResults;

    if (auth_ctx.tipoAccount !== "Paziente") {
      // LOGICA CAREGIVER: Prepariamo la scheda risultati con l'assegnazione
      risultati_utente_gioco = (
        <RisultatiGioco
          numeroRisposteCorrette={risposteUtente}
          numeroDomandeTotali={domandeTotali}
          chiudiSchedaRisultati={closeGameResults}
          assegnaRisultatiPaziente={(pazID) => {
            game_ctx.salvaRisultatiGiocoPaziente(
              pazID,
              giocoSvoltoID,
              domandeTotali,
              risposteUtente,
              domandeTotali - risposteUtente,
              valoreEmotivo // Passiamo il feedback scelto
            );
            closeGameResults();
          }}
        />
      );
    } else {
      // LOGICA PAZIENTE: Salvataggio automatico con feedback
      game_ctx.salvaRisultatiGiocoPaziente(
        auth_ctx.utenteLoggatoUID,
        giocoSvoltoID,
        domandeTotali,
        risposteUtente,
        domandeTotali - risposteUtente,
        valoreEmotivo
      );
      risultati_utente_gioco = (
        <RisultatiGiocoPazAccnt
          rigioca={restartGame}
          chiudiSchedaRisultati={closeGameResults}
        />
      );
    }

    setShowFeedback(false); // Chiude la selezione emoji
    setShowGameResults(true); // Mostra la scheda dei risultati
  };

  function closeGameResults() {
    risultati_utente_gioco = null;
    setGameObject(null);
    setShowGameResults(false);
    setShowFeedback(false);
    setShowSearchBoxAndButton(true);
    setShowElencoGiochi(true);
    INDICEGIOCO_VAR = -1;
    setGameActiveIndex(-1);
  }

  function formEditQuestion(tipoGioco, singleQuestion, ID) {
    modifica_domanda = (
      <EditDomanda
        ID={ID}
        tipoGioco={tipoGioco}
        categoriaDomanda={singleQuestion.categoria}
        domanda={singleQuestion.domanda}
        correttaN1={singleQuestion.rispCorrettaN1}
        sbagliataN1={singleQuestion.rispSbagliataN1}
        immagine={singleQuestion.immagine}
        suggerimento={singleQuestion.suggerimento}
        chiudiFormModificaDomanda={() => {
          setShowEditQuestion(false);
          setShowAddNewQuestion(true);
        }}
      />
    );
    setShowAddNewQuestion(false);
    setShowEditQuestion(true);
  }

  function formAssignGameTo(game_ID) {
    assegnazione_gioco = (
      <AssignGameToPatient
        chiudiSchedaAssegnazione={() => {
          setShowSearchBoxAndButton(true);
          setShowElencoGiochi(true);
          setShowAssignGameTo(false);
        }}
        gameID={game_ID}
      />
    );
    setShowSearchBoxAndButton(false);
    setShowElencoGiochi(false);
    setShowAssignGameTo(true);
  }

  return (
    <div className={styles.main_wrapper}>
      {game_ctx.showModale && game_ctx.modale}

      {/* FEEDBACK EMOTIVO: Renderizzato condizionalmente qui */}
      {showFeedback && <RatingEmotivo onSelect={handleFeedbackSelection} />}

      {showSearchBoxAndButton && auth_ctx.tipoAccount !== "Paziente" && (
        <header className={styles.toolbar}>
          <div className={styles.toolbar_content}>
            {gameActiveIndex === -1 ? (
              <>
                <div className={styles.filter_box}>
                  <select className={styles.select_style} onChange={tipoGiocoChangeHandler}>
                    <option value="TUTTI">Tutti i tipi</option>
                    <option>QUIZ</option>
                    <option>QUIZ CON IMMAGINI</option>
                    <option>QUIZ CON VIDEO</option>
                    <option>QUIZ CON SUONI</option>
                    <option>COMPLETA LA PAROLA</option>
                  </select>
                </div>
                <GenericButton
                  onClick={() => {
                    formCreateNewGame();
                    game_ctx.formCreaNuovoGioco();
                  }}
                  generic_button={true}
                  buttonText={" + Crea Gioco"}
                />
                <div className={styles.search_wrapper}>
                  <SearchBox onChange={(e) => game_ctx.cercaGioco(e.target.value)} />
                </div>
              </>
            ) : (
              <GenericButton
                onClick={closeGameResults}
                generic_button={true}
                red_styling
                buttonText={"Esci dal gioco"}
              />
            )}
          </div>
        </header>
      )}

      <main className={styles.content_container}>
        {showElencoGiochi && (
          <h1 className={styles.page_title}>
             {auth_ctx.tipoAccount === "Paziente" ? "I Miei Esercizi" : "Libreria Giochi"}
          </h1>
        )}

        <div className={styles.dynamic_content}>
          {showAddNewGame && <AddGioco chiudiFormNuovoGioco={closeFormCreateNewGame} />}
          {showEditGame && modifica_gioco}
          {showAddNewQuestion && (
            <AddDomanda
              chiudiFormNuovaDomanda={() => {
                setShowSearchBoxAndButton(true);
                setShowElencoGiochi(true);
                setShowAddNewQuestion(false);
              }}
              aggiungiDomanda={game_ctx.aggiungiDomandaAllaLista}
              mostraModificaDomanda={formEditQuestion}
            />
          )}
          {showEditQuestion && modifica_domanda}
          {showAssignGameTo && assegnazione_gioco}

          {showElencoGiochi && (
            <ListaGiochi
              iniziaGioco={startGame}
              tipoGioco={tipoGiocoCercato}
              mostraFormModificaGioco={formEditGame}
              mostraSchedaAssegnazione={formAssignGameTo}
              avvioGiocoChiudoIlResto={() => {
                setShowSearchBoxAndButton(false);
                setShowElencoGiochi(false);
              }}
            />
          )}

          {showGameResults && risultati_utente_gioco}
          {gameActiveIndex !== -1 && gameObject}
        </div>
      </main>
    </div>
  );
}

export default Giochi;