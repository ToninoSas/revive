import React, { useState, useContext, useEffect } from "react";
import PatientContext from "./patients-context";
import Modal from "../components/UI/Modal";
import AuthContext from "./auth-context";
import { getServerMgr } from "../backend_conn/ServerMgr";

const GameContext = React.createContext({
    listaGiochi: null,
    aggiungiGiocoAllaLista: () => { },
    formCreaNuovoGioco: () => { },
    domandeDaModificare: null,
    modificaGioco: () => { },
    salvaGiocoModificato: () => { },
    eliminaGioco: () => { },
    domande: null,
    aggiungiDomandaAllaLista: () => { },
    recuperaCategorieDomande: () => { },
    showModale: null,
    modale: null,
    salvaRisultatiGiocoPaziente: () => { },
    eliminaDomanda: () => { },
    salvaDomandaModificata: () => { },
    prendiTuttiGiochiDomande: () => { },
    listaPazientiPerGioco: null,
    prendiPazientiPerUnSingoloGioco: () => { },
    stringSearched: null,
    cercaGioco: () => { }
});

export function GameContextProvider(props) {
    const patients_ctx = useContext(PatientContext);
    const auth_ctx = useContext(AuthContext);

    const [stringaCercata, setStringaCercata] = useState("");
    const [elencoGiochi, setElencoGiochi] = useState([]);
    const [elencoDomande, setElencoDomande] = useState([]);
    const [domandeModifica, setDomandeModifica] = useState([]);
    const [patientsListForSingleGame, setPatientsListForSingleGame] = useState([]);
    
    // STATI PER LA MODALE
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);

    async function getAllGamesQuestions() {
        let resultQuestions;
        let resultGames;

        const parseResult = (resultsArray) => {
            let markersList = {}
            resultsArray.forEach((item) => {
                let currentMarker = (({ categoriaGioco, creatorID, gameID, livelloGioco, nomeGioco, tipoGioco, numero }) => ({ categoriaGioco, creatorID, gameID, livelloGioco, nomeGioco, tipoGioco, numero, domandeID: [] }))(item);
                markersList[item.gameID] ??= currentMarker
                if (item.IDquestion !== null) {
                    markersList[item.gameID].domandeID.push(item.IDquestion)
                }
            })

            let arrayGiochi = []
            Object.keys(markersList).forEach((item) => {
                arrayGiochi.push(markersList[item])
            })
            return arrayGiochi;
        }

        if (auth_ctx.tipoAccount !== "Paziente") {
            resultQuestions = await getServerMgr().getQuestionsList(auth_ctx.utenteLoggatoUID).catch(err => console.error(err));
            setElencoDomande(resultQuestions || []);

            resultGames = await getServerMgr().getGamesList(auth_ctx.utenteLoggatoUID).catch(err => console.error(err));
            if (resultGames) {
                setElencoGiochi(parseResult(resultGames));
            } else {
                setElencoGiochi([]);
            }
        } else {
            const userId = sessionStorage.getItem('UID');
            resultGames = await getServerMgr().listaGiochiPaziente(userId).catch(err => console.error(err));
            
            let creatoreDomandaID = (resultGames && resultGames.length > 0) ? resultGames[0].creatorID : -1;

            resultQuestions = await getServerMgr().getQuestionsList(creatoreDomandaID).catch(err => console.error(err));
            setElencoDomande(resultQuestions || []);

            if (resultGames) {
                setElencoGiochi(parseResult(resultGames));
            } else {
                setElencoGiochi([]);
            }
        }
    }

    useEffect(() => {
        if (auth_ctx.utenteLoggato !== null) {
            getAllGamesQuestions();
        }
    }, [auth_ctx.utenteLoggato]);

    async function deleteGame(gameID) {
        await getServerMgr().deleteGame(gameID).catch(err => console.error(err));
        alert("Gioco eliminato dalla lista.");
        getAllGamesQuestions();
    }

    async function deleteQuestion(ID) {
        await getServerMgr().deleteQuestion(ID).catch(err => console.error(err));
        alert("Domanda eliminata.");
        getAllGamesQuestions();
    }

    // GESTIONE ELIMINAZIONE GIOCO (MODALE)
    function modalDeleteGame(gameID) {
        setModalContent(
            <Modal
                testoModale={"Sei sicuro di voler eliminare il gioco?"}
                CONFERMA={() => {
                    deleteGame(gameID);
                    setShowModal(false);
                }}
                ANNULLA={() => {
                    setShowModal(false);
                }}
            />
        );
        setShowModal(true);
    }

    // GESTIONE ELIMINAZIONE DOMANDA (MODALE)
    function modalDeleteQuestion(ID) {
        setModalContent(
            <Modal
                testoModale={"Sei sicuro di voler eliminare questa domanda?"}
                CONFERMA={() => {
                    deleteQuestion(ID); // Corretto: passa solo l'ID
                    setShowModal(false);
                }}
                ANNULLA={() => {
                    setShowModal(false);
                }}
            />
        );
        setShowModal(true);
    }

    // ... (Altre funzioni addNewGameToList, editGame, ecc. rimangono invariate)
    function formCreateNewGame() { setDomandeModifica([]); }
    async function addNewGameToList(name, type, level, category, questionsList) {
        await getServerMgr().addGame(auth_ctx.utenteLoggatoUID, name, type, level, category, questionsList).catch(err => console.error(err));
        getAllGamesQuestions();
    }
    async function addNewQuestionToList(nuova_domanda) {
        await getServerMgr().addQuestion(
            nuova_domanda.doctor_UID, nuova_domanda.tipoGioco, nuova_domanda.categoria, nuova_domanda.domanda,
            nuova_domanda.rispCorrette.correct_answer_n1, nuova_domanda.rispCorrette.correct_answer_n2, nuova_domanda.rispCorrette.correct_answer_n3, nuova_domanda.rispCorrette.correct_answer_n4,
            nuova_domanda.rispSbagliate.wrong_answer_n1, nuova_domanda.rispSbagliate.wrong_answer_n2, nuova_domanda.rispSbagliate.wrong_answer_n3, nuova_domanda.rispSbagliate.wrong_answer_n4,
            nuova_domanda.immagine, nuova_domanda.suggerimento
        );
        alert("Nuova domanda salvata!");
        getAllGamesQuestions();
    }
    function getAllCategories(tipoGioco) {
        const unique = (value, index, self) => self.indexOf(value) === index;
        let elenco = elencoDomande.filter(d => d.tipoGioco === tipoGioco).map(d => d.categoria);
        return elenco.filter(unique);
    }
    function editGame(listaa) { setDomandeModifica(listaa.domandeID); }
    async function addModifiedGameToList(name, level, category, questionsList, gameID) {
        await getServerMgr().updateGame(name, level, category, questionsList, gameID).catch(err => console.error(err));
        getAllGamesQuestions();
    }
    async function addModifiedQuestionToList(domandaModificata, ID) {
        await getServerMgr().updateQuestion(
            domandaModificata.domanda, domandaModificata.rispCorrette.correct_answer_n1, domandaModificata.rispCorrette.correct_answer_n2, domandaModificata.rispCorrette.correct_answer_n3,
            domandaModificata.rispCorrette.correct_answer_n4, domandaModificata.rispSbagliate.wrong_answer_n1, domandaModificata.rispSbagliate.wrong_answer_n2, domandaModificata.rispSbagliate.wrong_answer_n3,
            domandaModificata.rispSbagliate.wrong_answer_n4, domandaModificata.immagine, domandaModificata.suggerimento, ID
        );
        getAllGamesQuestions();
    }
    function searchGame(stringaDaCercare) { setStringaCercata(stringaDaCercare); }
    async function getPatientsListForSingleGame(gameID) {
        let result = await getServerMgr().patientsListForSingleGame(gameID);
        setPatientsListForSingleGame(result || []);
    }
    async function salvaRisultati(pazienteID, giocoID, risposteTotali, risposteCorrette, risposteSbagliate, statoEmotivo) {
        var today = new Date();
        let dateString = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        await getServerMgr().saveGameResults(pazienteID, giocoID, risposteTotali, risposteCorrette, risposteSbagliate, dateString, statoEmotivo);
    }

    return (
        <GameContext.Provider
            value={{
                listaGiochi: elencoGiochi,
                aggiungiGiocoAllaLista: addNewGameToList,
                formCreaNuovoGioco: formCreateNewGame,
                domandeDaModificare: domandeModifica,
                modificaGioco: editGame,
                salvaGiocoModificato: addModifiedGameToList,
                eliminaGioco: modalDeleteGame,
                domande: elencoDomande,
                aggiungiDomandaAllaLista: addNewQuestionToList,
                recuperaCategorieDomande: getAllCategories,
                showModale: showModal,
                modale: modalContent, // Ora punta allo stato
                salvaRisultatiGiocoPaziente: salvaRisultati,
                eliminaDomanda: modalDeleteQuestion,
                salvaDomandaModificata: addModifiedQuestionToList,
                prendiTuttiGiochiDomande: getAllGamesQuestions,
                listaPazientiPerGioco: patientsListForSingleGame,
                prendiPazientiPerUnSingoloGioco: getPatientsListForSingleGame,
                stringSearched: stringaCercata,
                cercaGioco: searchGame
            }}
        >
            {props.children}
        </GameContext.Provider>
    );
}

export default GameContext;