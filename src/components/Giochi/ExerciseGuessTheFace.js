import styles from './ExerciseGuessTheFace.module.css';
import GameButton from '../UI/GameButton';
import GenericAlternativeButton from '../UI/GenericAlternativeButton';
import { useEffect, useState, useRef } from 'react';
import { Badge } from 'react-bootstrap';

function ExerciseGuessTheFace(props) {
    const questions = props.domandeGioco;
    const websiteUrl = "/immagini/";

    // Stati del gioco
    const [gameStarted, setGameStarted] = useState(false);
    const [questionIdx, setQuestionIdx] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [messaggioRisposta, setMessaggioRisposta] = useState(null);
    const [disableButton, setDisableButton] = useState(false);

    // Gestione risposte correnti
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [correctAnswersLeft, setCorrectAnswersLeft] = useState([]);
    const [buttonStates, setButtonStates] = useState({}); // { index: 'correct' | 'wrong' }

    const timerInterval = useRef(null);

    // Inizializzazione Timer e Domanda
    useEffect(() => {
        if (gameStarted && questions[questionIdx]) {
            setupQuestion();
        }
        return () => clearInterval(timerInterval.current);
    }, [questionIdx, gameStarted]);

    const setupQuestion = () => {
        const currentQ = questions[questionIdx];
        
        // Prepariamo le risposte corrette e sbagliate
        const corrette = [currentQ.rispCorrettaN1, currentQ.rispCorrettaN2, currentQ.rispCorrettaN3, currentQ.rispCorrettaN4].filter(a => a?.trim());
        const sbagliate = [currentQ.rispSbagliataN1, currentQ.rispSbagliataN2, currentQ.rispSbagliataN3, currentQ.rispSbagliataN4].filter(a => a?.trim());
        
        setCorrectAnswersLeft([...corrette]);
        setButtonStates({});
        
        // Shuffle
        const tutte = [...corrette, ...sbagliate].sort(() => Math.random() - 0.5);
        setShuffledAnswers(tutte);

        // Timer
        let secondi = props.LIVELLOGIOCO === "DIFFICILE" ? 10 : 15;
        if (props.LIVELLOGIOCO !== "FACILE") {
            setTimer(secondi);
            clearInterval(timerInterval.current);
            timerInterval.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerInterval.current);
                        autoFail();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    };

    const autoFail = () => {
        setDisableButton(true);
        setHasAnswered(true);
        setMessaggioRisposta(false);
    };

    const checkAnswer = (answer, index) => {
        const currentQ = questions[questionIdx];
        const isCorrect = [currentQ.rispCorrettaN1, currentQ.rispCorrettaN2, currentQ.rispCorrettaN3, currentQ.rispCorrettaN4].includes(answer);

        if (isCorrect) {
            // Aggiorna stato bottone a corretto
            setButtonStates(prev => ({ ...prev, [index]: 'correct' }));
            
            const remaining = correctAnswersLeft.filter(a => a !== answer);
            setCorrectAnswersLeft(remaining);

            if (remaining.length === 0) {
                setCorrectCount(prev => prev + 1);
                setMessaggioRisposta(true);
                finalizzaRisposta();
            }
        } else {
            // Risposta sbagliata
            setButtonStates(prev => ({ ...prev, [index]: 'wrong' }));
            setMessaggioRisposta(false);
            finalizzaRisposta();
        }
    };

    const finalizzaRisposta = () => {
        clearInterval(timerInterval.current);
        setDisableButton(true);
        setHasAnswered(true);
    };

    const handleNext = () => {
        if (questionIdx < questions.length - 1) {
            setQuestionIdx(prev => prev + 1);
            setHasAnswered(false);
            setDisableButton(false);
            setMessaggioRisposta(null);
        } else {
            setGameStarted(false);
            // FINE GIOCO: Passa i dati al padre Giochi.jsx
            props.giocoTerminato(correctCount, questions.length);
        }
    };

    const iniziaGioco = () => {
        setCorrectCount(0);
        setQuestionIdx(0);
        setGameStarted(true);
    };

    return (
        <>
            {!gameStarted && (
                <div className={styles.wrap_generico}>
                    <h1 className={styles.pre_game}>Quando sei pronto, clicca su Inizia</h1>
                    <GenericAlternativeButton onClick={iniziaGioco} buttonText={"INIZIA"} />
                    <GenericAlternativeButton onClick={props.giocoAnnullato} buttonText={"INDIETRO"} colore_rosso />
                </div>
            )}

            {gameStarted && questions[questionIdx] && (
                <div className={styles.wrapper_gioco}>
                    <h1 className={styles.domanda}>Domanda N.{questionIdx + 1}</h1>
                    <h1 className={styles.domanda}>{questions[questionIdx].domanda}</h1>

                    {/* Media Rendering */}
                    {props.TIPOGIOCO === "QUIZ CON IMMAGINI" && (
                        <img className={styles.resize_image} src={websiteUrl.concat(questions[questionIdx].immagine)} alt="Quiz" />
                    )}
                    {props.TIPOGIOCO === "QUIZ CON SUONI" && (
                        <audio controls autoPlay src={websiteUrl.concat(questions[questionIdx].immagine)} />
                    )}
                    {props.TIPOGIOCO === "QUIZ CON VIDEO" && (
                        <video key={questionIdx} controls autoPlay width="640" height="360">
                            <source src={websiteUrl.concat(questions[questionIdx].immagine)} type="video/mp4" />
                        </video>
                    )}

                    {correctAnswersLeft.length > 1 && (
                        <Badge bg="warning" text="dark" style={{ fontSize: "15px", margin: "10px" }}>
                            ! Questa domanda ha più risposte corrette !
                        </Badge>
                    )}

                    <div className={styles.wrapper_horizontal_flex}>
                        <p className={styles.risposte_corrette}>
                            Indovinate: {correctCount}/{questions.length}
                        </p>
                        {props.LIVELLOGIOCO !== "FACILE" && timer > 0 && <p>TEMPO: {timer}</p>}
                    </div>

                    {hasAnswered && (
                        <>
                            <GenericAlternativeButton onClick={handleNext} buttonText={"PROSSIMA"} />
                            <p style={{ color: messaggioRisposta ? "green" : "red" }} className={styles.messaggio_risposta}>
                                {messaggioRisposta ? "😍 Complimenti! Hai indovinato" : "Peccato. Risposta sbagliata"}
                            </p>
                        </>
                    )}

                    <div className={styles.wrapper_bottoni_risposte}>
                        {shuffledAnswers.map((risposta, index) => (
                            <GameButton
                                key={index}
                                onClick={() => checkAnswer(risposta, index)}
                                buttonText={risposta}
                                is_disabled={disableButton || buttonStates[index] === 'correct'}
                                correct_answer={buttonStates[index] === 'correct'}
                                wrong_answer={buttonStates[index] === 'wrong'}
                                game_button={true}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default ExerciseGuessTheFace;