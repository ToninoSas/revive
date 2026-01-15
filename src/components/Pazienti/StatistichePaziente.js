import { useEffect, useState, useMemo } from "react";
import styles from "./StatistichePaziente.module.css";
import { ProgressBar } from "react-bootstrap";

function StatistichePaziente(props) {
    const [filtroStatistiche, setFiltroStatistiche] = useState("Totali");
    const risultatiTotali = props.stats || [];

    // Funzione helper per mappare il valore numerico (1-5) in Emoji e Testo
    const getMoodDetails = (value) => {
        const val = parseFloat(value);
        if (val === 0) return { emoji: "N.D.", label: "Nessun dato", color: "#6c757d" };
        if (val <= 1.5) return { emoji: "😫", label: "Molto provato", color: "#dc3545" };
        if (val <= 2.5) return { emoji: "🙁", label: "Triste/Ansioso", color: "#fd7e14" };
        if (val <= 3.5) return { emoji: "😐", label: "Neutrale", color: "#ffc107" };
        if (val <= 4.5) return { emoji: "🙂", label: "Sereno", color: "#20c997" };
        return { emoji: "😄", label: "Molto Felice", color: "#28a745" };
    };

    const stats = useMemo(() => {
        let tot = 0, corr = 0, sbag = 0, moodSum = 0, moodCount = 0;
        const now = Date.now();

        risultatiTotali.forEach((item) => {
            const dataEsecuzione = new Date(item.dataSvolgimento).getTime();
            const diffMs = now - dataEsecuzione;

            let include = false;
            if (filtroStatistiche === "Totali") include = true;
            else if (filtroStatistiche === "ultime 48 ore" && diffMs < 172800000) include = true;
            else if (filtroStatistiche === "ultima settimana" && diffMs < 604800000) include = true;
            else if (filtroStatistiche === "ultimi 30 giorni" && diffMs < 2592000000) include = true;

            if (include) {
                tot += item.rispTotali;
                corr += item.rispCorrette;
                sbag += item.rispSbagliate;
                
                // Integrazione Stato Emotivo
                if (item.statoEmotivo && item.statoEmotivo > 0) {
                    moodSum += item.statoEmotivo;
                    moodCount++;
                }
            }
        });

        const percCorr = tot > 0 ? ((corr / tot) * 100).toFixed(1) : 0;
        const percSbag = tot > 0 ? ((sbag / tot) * 100).toFixed(1) : 0;
        const avgMood = moodCount > 0 ? (moodSum / moodCount).toFixed(1) : 0;

        return { tot, corr, sbag, percCorr, percSbag, avgMood };
    }, [filtroStatistiche, risultatiTotali]);

    const moodInfo = getMoodDetails(stats.avgMood);

    return (
        <div className={styles.stats_container}>
            <div className={styles.filter_header}>
                <label className={styles.filter_label}>Analisi Periodo:</label>
                <select 
                    value={filtroStatistiche} 
                    onChange={(e) => setFiltroStatistiche(e.target.value)} 
                    className={styles.select_modern}
                >
                    <option>Totali</option>
                    <option>ultime 48 ore</option>
                    <option>ultima settimana</option>
                    <option>ultimi 30 giorni</option>
                </select>
            </div>

            <div className={styles.kpi_grid}>
                {/* ... KPI precedenti ... */}
                <div className={styles.kpi_card}>
                    <span className={styles.kpi_icon}>📝</span>
                    <div className={styles.kpi_data}>
                        <span className={styles.kpi_value}>{stats.tot}</span>
                        <span className={styles.kpi_title}>Quesiti Totali</span>
                    </div>
                </div>
                <div className={`${styles.kpi_card} ${styles.success}`}>
                    <span className={styles.kpi_icon}>✅</span>
                    <div className={styles.kpi_data}>
                        <span className={styles.kpi_value}>{stats.corr}</span>
                        <span className={styles.kpi_title}>Corrette</span>
                    </div>
                </div>

                {/* NUOVA CARD: Stato Emotivo Medio */}
                <div className={styles.kpi_card} style={{borderLeft: `5px solid ${moodInfo.color}`}}>
                    <span className={styles.kpi_icon} style={{fontSize: '2rem'}}>{moodInfo.emoji}</span>
                    <div className={styles.kpi_data}>
                        <span className={styles.kpi_value}>{stats.avgMood > 0 ? stats.avgMood : "--"}</span>
                        <span className={styles.kpi_title}>Umore Medio</span>
                    </div>
                </div>
            </div>

            <div className={styles.main_stats_layout}>
                {/* Rendimento Percentuale */}
                <div className={styles.visual_card}>
                    <h3 className={styles.card_title}>Rendimento</h3>
                    {/* ... ProgressBar precedenti ... */}
                    <div className={styles.progress_section}>
                        <div className={styles.progress_info}>
                            <span>Risposte Corrette</span>
                            <span className={styles.perc_text_green}>{stats.percCorr}%</span>
                        </div>
                        <ProgressBar now={stats.percCorr} variant="success" animated className={styles.custom_bar} />
                    </div>
                </div>

                {/* NUOVA SEZIONE: Analisi del Benessere */}
                <div className={styles.visual_card}>
                    <h3 className={styles.card_title}>Benessere Psicologico</h3>
                    <div className={styles.mood_summary}>
                        <div className={styles.mood_big_icon} style={{color: moodInfo.color}}>
                            {moodInfo.emoji}
                        </div>
                        <div className={styles.mood_text_info}>
                            <h4>{moodInfo.label}</h4>
                            <p>Valutazione media basata sulle ultime sessioni di gioco.</p>
                        </div>
                    </div>
                    {/* Una barra graduata per mostrare dove si colloca il paziente */}
                    <div className={styles.mood_range}>
                        <div className={styles.mood_pointer} style={{left: `${(stats.avgMood - 1) * 25}%`}}>▼</div>
                        <div className={styles.range_bar}></div>
                        <div className={styles.range_labels}>
                            <span>Critico</span>
                            <span>Ottimale</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatistichePaziente;