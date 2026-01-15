import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useContext } from "react";
import { getServerMgr } from "../../backend_conn/ServerMgr.js";
import RicordoSingolo from "./RicordoSingolo";
import styles from "./DettagliBox.module.css"; 
import GenericButton from "../UI/GenericButton";
import AuthContext from "../../context/auth-context";

function DettagliBox() {
    const { userID, boxID } = useParams();
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroTitolo, setFiltroTitolo] = useState("");
    const [ricordi, setRicordi] = useState([]);
    const navigate = useNavigate();

    const auth_ctx = useContext(AuthContext);
    const isPaziente = auth_ctx.tipoAccount === "Paziente";

    useEffect(() => {
        const EstraiRicordi = async () => {
            try {
                const data = await getServerMgr().getRicordiByBoxId(boxID);
                setRicordi(data || []); 
            } catch (error) {
                console.error("Errore nel recupero dei ricordi:", error);
            }
        };
        EstraiRicordi();
    }, [boxID]);

    // Filtraggio ottimizzato
    const ricordiFiltrati = useMemo(() => {
        return ricordi.filter(ricordo => {
            const matchesTipo = filtroTipo === "" || ricordo.tipo === filtroTipo;
            const matchesTitolo = filtroTitolo === "" || 
                ricordo.titolo.toLowerCase().includes(filtroTitolo.toLowerCase());
            return matchesTipo && matchesTitolo;
        });
    }, [ricordi, filtroTipo, filtroTitolo]);

    const handleInserisciRicordo = () => {
        navigate(`/box-dei-ricordi/dettagliBox/dettagli-ricordo/inserisci-ricordo/${boxID}`);
    };

    return (
        <div className={styles.main_wrapper}>
            {/* Toolbar Superiore */}
            <header className={styles.toolbar}>
                <div className={styles.toolbar_content}>
                    <div className={styles.left_section}>
                        <button className={styles.back_btn} onClick={() => navigate(-1)}>
                            <span className={styles.arrow}>←</span> Torna alle Box
                        </button>
                    </div>

                    <div className={styles.center_section}>
                        <div className={styles.filter_group}>
                            <select 
                                className={styles.select_filter}
                                value={filtroTipo} 
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="">Tutti i contenuti</option>
                                <option value="immagine">🖼️ Immagini</option>
                                <option value="video">🎥 Video</option>
                                <option value="audio">🎵 Audio</option>
                                <option value="luogo">📍 Luogo</option>
                            </select>
                            
                            <div className={styles.search_wrapper}>
                                <input 
                                    type="text" 
                                    className={styles.search_input} 
                                    placeholder="Cerca per titolo..." 
                                    value={filtroTitolo} 
                                    onChange={(e) => setFiltroTitolo(e.target.value)} 
                                />
                                <span className={styles.search_icon}>🔍</span>
                            </div>
                        </div>
                    </div>

                    {/* Solo il dottore/caregiver vede questo tasto */}
            {!isPaziente && (
                <GenericButton 
                    onClick={handleInserisciRicordo}
                    buttonText="＋ Aggiungi Ricordo"
                    generic_button
                />
            )}
                </div>
            </header>

            <main className={styles.content_container}>
                <div className={styles.header_info}>
                    <h1>Contenuti dell'Archivio</h1>
                    <p>Gestisci e visualizza i multimedia salvati per questa box</p>
                </div>

                {ricordiFiltrati.length > 0 ? (
                    <div className={styles.ricordi_grid}>
                        {ricordiFiltrati.map((ricordo) => (
                            <RicordoSingolo 
                                key={ricordo.id_ricordo}
                                titolo={ricordo.titolo}
                                tipo={ricordo.tipo}
                                multimedia={ricordo.multimedia}
                                longitudine={ricordo.longitudine}
                                latitudine={ricordo.latitudine}
                                descrizione={ricordo.descrizione}
                                idRicordo={ricordo.id_ricordo} 
                                boxID={boxID}
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.empty_state}>
                        <span className={styles.empty_icon}>✨</span>
                        <h3>Nessun ricordo trovato</h3>
                        <p>Prova a cambiare i filtri o aggiungi un nuovo ricordo cliccando il pulsante in alto.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default DettagliBox;