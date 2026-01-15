import React from "react";
import styles from "./BoxRicordoLayout.module.css"; 
import GenericButton from "../UI/GenericButton";

function BoxRicordo({ nome, cognome, citta, eta, onView, onEdit, onDelete, isDoctor }) {
    return (
        <div className={styles.card_wrapper}>
            <div className={styles.card_header}>
                <div className={styles.icon_container}>
                    📦
                </div>
                <div className={styles.title_group}>
                    <h3 className={styles.patient_name}>{nome} {cognome}</h3>
                    <span className={styles.id_badge}>Archivio Multimediale</span>
                </div>
            </div>

            <div className={styles.card_body}>
                <div className={styles.info_row}>
                    <span className={styles.label}>Città:</span>
                    <span className={styles.value}>{citta}</span>
                </div>
                <div className={styles.info_row}>
                    <span className={styles.label}>Età:</span>
                    <span className={styles.value}>{eta} anni</span>
                </div>
            </div>

            <div className={styles.card_actions}>
                <div className={styles.main_action}>
                    <GenericButton 
                        onClick={onView} 
                        buttonText="Apri Box" 
                        generic_button 
                    />
                </div>

                {isDoctor && (
                    <div className={styles.admin_tools}>
                        <button className={styles.btn_edit} onClick={onEdit} title="Modifica">
                             📝Modifica
                        </button>
                        <button className={styles.btn_delete} onClick={onDelete} title="Elimina">
                            🗑️ <span className={styles.custom_label}>Elimina</span>
                        </button>
                    </div>
                )}
            </div>

            {/* <div className={styles.card_actions}>
                {isDoctor && (
                    <div className={styles.admin_tools}>
                        <button className={styles.btn_edit} onClick={onEdit} title="Modifica">
                            📝 Modifica
                        </button>
                        <button className={styles.btn_delete} onClick={onDelete} title="Elimina">
                            🗑️ Elimina
                        </button>
                    </div>
                )}
            </div> */}
        </div>
    );
}

export default BoxRicordo;