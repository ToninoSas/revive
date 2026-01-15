import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'; 
import L from 'leaflet'; 
import styles from "./RicordoSingolo.module.css";
import 'leaflet-fullscreen';
import { getServerMgr } from "../../backend_conn/ServerMgr.js";
import GenericButton from "../UI/GenericButton";
import AuthContext from "../../context/auth-context";

// Fix per l'icona del marker di Leaflet
const markerIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function FullscreenControl() {
    const map = useMap();
    useEffect(() => {
        const fsControl = L.control.fullscreen({ position: 'topright' });
        fsControl.addTo(map);
        return () => fsControl.remove();
    }, [map]);
    return null;
}

function RicordoSingolo({ titolo, tipo, multimedia, descrizione, idRicordo, latitudine, longitudine, boxID }) {
    const navigate = useNavigate();
    const auth_ctx = useContext(AuthContext);
    
    const isPaziente = auth_ctx.tipoAccount === "Paziente";
    const ricordo = { idRicordo, titolo, tipo, descrizione, latitudine, longitudine, multimedia };
    
    const file = tipo !== "luogo" && multimedia?.length > 0 ? multimedia[0] : null;
    const fileUrl = file ? `/immagini/${file.url.split('/').pop()}` : null;
    const fileType = file ? file.tipo : null;

    const handleViewDetails = () => {
        navigate(`/box-dei-ricordi/dettagliBox/dettagli-ricordo/RicordoSingolo/visualizza-ricordo/${idRicordo}`);
    };

    const handleEdit = () => {
        navigate(`/box-dei-ricordi/dettagliBox/dettagli-ricordo/RicordoSingolo/modifica-ricordo/${idRicordo}`, {
            state: { ricordo, boxID }  
        });
    };

    const handleDelete = async () => {
        if (window.confirm("Sei sicuro di voler eliminare questo ricordo?")) {
            try {
                const response = await getServerMgr().deleteRicordoById(idRicordo);
                if (response.success) {
                    alert("Eliminazione avvenuta con successo!");
                    window.location.reload();
                } else {
                    alert("Errore nell'eliminazione del ricordo.");
                }
            } catch (error) {
                console.error("Errore:", error);
            }
        }
    };

    return (
        <div className={styles.card_wrapper}>
            <div className={styles.card_header}>
                <div className={styles.type_badge}>
                    {tipo === 'immagine' && '🖼️'}
                    {tipo === 'video' && '🎥'}
                    {tipo === 'audio' && '🎵'}
                    {tipo === 'luogo' && '📍'}
                    <span>{tipo}</span>
                </div>
                <h3 className={styles.title}>{titolo}</h3>
            </div>

            <div className={styles.media_section}>
                {tipo !== "luogo" && file ? (
                    <div className={styles.media_display}>
                        {fileType.includes("immagine") && <img src={fileUrl} alt={titolo} className={styles.img_fill} />}
                        {fileType.includes("video") && (
                            <video controls className={styles.video_fill}>
                                <source src={fileUrl} type="video/mp4" />
                            </video>
                        )}
                        {fileType.includes("audio") && (
                            <div className={styles.audio_wrapper}>
                                <audio controls src={fileUrl} className={styles.audio_player} />
                            </div>
                        )}
                    </div>
                ) : (
                    tipo === "luogo" && latitudine && longitudine && (
                        <div className={styles.map_wrapper}>
                            <MapContainer center={[latitudine, longitudine]} zoom={13} className={styles.map_view}>
                                <FullscreenControl /> 
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[latitudine, longitudine]} icon={markerIcon} />
                            </MapContainer>
                        </div>
                    )
                )}
            </div>

            <div className={styles.card_body}>
                <p className={styles.description}>{descrizione}</p>
                {multimedia?.length > 1 && (
                    <div className={styles.extra_info}>
                        📂 +{multimedia.length - 1} altri file disponibili
                    </div>
                )}
            </div>

            <div className={styles.card_actions}>
                <div className={styles.main_btn}>
                    <GenericButton 
                        onClick={handleViewDetails} 
                        buttonText="Visualizza" 
                        generic_button 
                    />
                </div>

                {/* {!isPaziente && (
                    <div className={styles.tool_btns}>
                        <button className={styles.btn_edit} onClick={handleEdit}>
                            <span>📝</span> 
                        </button>
                        <button className={styles.btn_delete} onClick={handleDelete}>
                            <span>🗑️</span> 
                        </button>
                    </div>
                )} */}
            </div>
            <div className={styles.card_actions}>

                {!isPaziente && (
                    <div className={styles.tool_btns}>
                        <button className={styles.btn_edit} onClick={handleEdit}>
                            <span>📝</span> Modifica
                        </button>
                        <button className={styles.btn_delete} onClick={handleDelete}>
                            <span>🗑️</span> Elimina
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RicordoSingolo;