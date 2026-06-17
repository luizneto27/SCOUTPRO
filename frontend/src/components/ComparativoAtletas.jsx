import React, { useEffect, useMemo, useState } from 'react';
import { GitCompare, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { getComparativoJogadores, isAuthError, listJogadores } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const ComparativoAtletas = ({ onSessionExpired }) => {
  const [atletas, setAtletas] = useState([]);
  const [atleta1Id, setAtleta1Id] = useState('');
  const [atleta2Id, setAtleta2Id] = useState('');
  const [comparativo, setComparativo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      onSessionExpired?.();
      return;
    }

    let ativo = true;
    const carregarAtletas = async () => {
      try {
        const data = await listJogadores(token, { size: 200 });
        if (!ativo) {
          return;
        }
        const itens = data?.content ?? [];
        setAtletas(itens);
        setError('');
      } catch (err) {
        if (isAuthError(err)) {
          onSessionExpired?.();
        } else if (ativo) {
          setError(err.message || 'Falha ao carregar atletas.');
        }
      }
    };

    carregarAtletas();

    return () => {
      ativo = false;
    };
  }, [onSessionExpired]);

  const atletasComRelatorio = useMemo(
    () => atletas.filter((atleta) => atleta.possuiRelatorios),
    [atletas],
  );

  const atletasSelecionaveis = useMemo(
    () => (atletasComRelatorio.length >= 2 ? atletasComRelatorio : atletas),
    [atletas, atletasComRelatorio],
  );

  const seletorFiltradoPorRelatorios = atletasComRelatorio.length >= 2;

  useEffect(() => {
    if (atletasSelecionaveis.length === 0) {
      return;
    }

    const atleta1Valido = atletasSelecionaveis.some((atleta) => String(atleta.id) === atleta1Id);
    const atleta2Valido = atletasSelecionaveis.some((atleta) => String(atleta.id) === atleta2Id);

    if (!atleta1Valido || !atleta2Valido || atleta1Id === atleta2Id) {
      const [primeiro, segundo = primeiro] = atletasSelecionaveis;
      setAtleta1Id(String(primeiro.id));
      setAtleta2Id(String(segundo.id));
    }
  }, [atletasSelecionaveis, atleta1Id, atleta2Id]);

  useEffect(() => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token || !atleta1Id || !atleta2Id) {
      setLoading(false);
      return;
    }

    if (atleta1Id === atleta2Id) {
      setComparativo(null);
      setLoading(false);
      setError('Selecione dois atletas diferentes para comparar.');
      return;
    }

    let ativo = true;
    setLoading(true);

    const carregarComparativo = async () => {
      try {
        const data = await getComparativoJogadores(token, {
          jogadorAId: atleta1Id,
          jogadorBId: atleta2Id,
        });
        if (!ativo) {
          return;
        }
        setComparativo(data);
        setError('');
      } catch (err) {
        if (isAuthError(err)) {
          onSessionExpired?.();
        } else if (ativo) {
          setError(err.message || 'Falha ao carregar comparativo.');
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    carregarComparativo();

    return () => {
      ativo = false;
    };
  }, [atleta1Id, atleta2Id, onSessionExpired]);

  const atleta1 = comparativo?.atletaA;
  const atleta2 = comparativo?.atletaB;

  const dadosGrafico = useMemo(() => {
    if (!comparativo?.radar || !atleta1 || !atleta2) {
      return [];
    }

    return comparativo.radar.map((item) => ({
      subject: item.subject,
      atletaA: Number(item.valorAtletaA ?? 0),
      atletaB: Number(item.valorAtletaB ?? 0),
      nomeAtletaA: item.atletaA ?? atleta1.nome,
      nomeAtletaB: item.atletaB ?? atleta2.nome,
    }));
  }, [comparativo, atleta1, atleta2]);

  const atleta1SemRelatorios = useMemo(
    () => dadosGrafico.length > 0 && dadosGrafico.every((item) => item.atletaA === 0),
    [dadosGrafico],
  );

  const atleta2SemRelatorios = useMemo(
    () => dadosGrafico.length > 0 && dadosGrafico.every((item) => item.atletaB === 0),
    [dadosGrafico],
  );

  const radarCompletoDisponivel = dadosGrafico.length > 0 && !atleta1SemRelatorios && !atleta2SemRelatorios;

  const dadosGraficoEstatistico = useMemo(() => {
    if (!atleta1 || !atleta2) {
      return [];
    }

    const metricas = [
      { subject: 'Jogos', valorAtletaA: Number(atleta1.jogos ?? 0), valorAtletaB: Number(atleta2.jogos ?? 0) },
      { subject: 'Gols', valorAtletaA: Number(atleta1.gols ?? 0), valorAtletaB: Number(atleta2.gols ?? 0) },
      { subject: 'Assistencias', valorAtletaA: Number(atleta1.assistencias ?? 0), valorAtletaB: Number(atleta2.assistencias ?? 0) },
      { subject: 'Desarmes', valorAtletaA: Number(atleta1.desarmes ?? 0), valorAtletaB: Number(atleta2.desarmes ?? 0) },
      { subject: 'Minutos', valorAtletaA: Number(atleta1.minutos ?? 0), valorAtletaB: Number(atleta2.minutos ?? 0) },
      { subject: 'Chutes no Gol', valorAtletaA: Number(atleta1.chutesGol ?? 0), valorAtletaB: Number(atleta2.chutesGol ?? 0) },
    ];

    return metricas.map((item) => {
      const maximo = Math.max(item.valorAtletaA, item.valorAtletaB, 1);

      return {
        subject: item.subject,
        atletaA: Number(((item.valorAtletaA / maximo) * 10).toFixed(1)),
        atletaB: Number(((item.valorAtletaB / maximo) * 10).toFixed(1)),
        valorAtletaA: item.valorAtletaA,
        valorAtletaB: item.valorAtletaB,
      };
    });
  }, [atleta1, atleta2]);

  const tooltipFormatter = (value, _name, item) => {
    const label = item?.payload?.nomeAtletaA && item?.dataKey === 'atletaA'
      ? item.payload.nomeAtletaA
      : item?.payload?.nomeAtletaB && item?.dataKey === 'atletaB'
        ? item.payload.nomeAtletaB
        : item?.name;

    return [Number(value ?? 0).toFixed(1), label];
  };

  const tooltipEstatisticoFormatter = (_value, _name, item) => {
    const label = item?.payload && item?.dataKey === 'atletaA'
      ? atleta1?.nome
      : item?.payload && item?.dataKey === 'atletaB'
        ? atleta2?.nome
        : item?.name;

    const valorReal = item?.dataKey === 'atletaA'
      ? item?.payload?.valorAtletaA
      : item?.payload?.valorAtletaB;

    return [formatMetricValue(item?.payload?.subject, valorReal), label];
  };

  const formatCurrency = (value) => {
    if (value == null) {
      return '-';
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatMetricValue = (subject, value) => {
    if (value == null) {
      return '-';
    }
    if (subject === 'Minutos') {
      return `${value} min`;
    }
    return String(value);
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.headerTitle}>
          <GitCompare size={24} color="#3b82f6" />
          <h2 style={{ color: '#ffffff', margin: 0, fontSize: '20px' }}>Comparativo Head-to-Head</h2>
        </div>
        <div style={styles.selectArea}>
          {seletorFiltradoPorRelatorios ? (
            <div style={styles.filterHint}>Selecao priorizando atletas com relatórios cadastrados.</div>
          ) : (
            <div style={styles.filterHint}>Menos de dois atletas com relatórios. Seletor liberado para todos.</div>
          )}
          <div style={styles.selectContainer}>
          <div style={styles.selectBox}>
            <div style={{...styles.colorDot, backgroundColor: '#3b82f6'}}></div>
            <select style={styles.select} value={atleta1Id} onChange={(e) => setAtleta1Id(e.target.value)}>
              {atletasSelecionaveis.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
          <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>VS</span>
          <div style={styles.selectBox}>
            <div style={{...styles.colorDot, backgroundColor: '#10b981'}}></div>
            <select style={styles.select} value={atleta2Id} onChange={(e) => setAtleta2Id(e.target.value)}>
              {atletasSelecionaveis.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
        </div>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loading ? <div style={styles.loadingBox}>Carregando comparativo...</div> : null}

      <div style={styles.mainGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>Cruzamento de Relatórios</h3>
          {atleta1SemRelatorios || atleta2SemRelatorios ? (
            <div style={styles.chartHint}>
              {[
                atleta1SemRelatorios ? atleta1?.nome : null,
                atleta2SemRelatorios ? atleta2?.nome : null,
              ].filter(Boolean).join(' e ')} sem notas de relatórios suficientes no backend para compor o radar completo.
            </div>
          ) : null}
          <div style={{ width: '100%', height: '350px', marginTop: '20px' }}>
            {radarCompletoDisponivel ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dadosGrafico}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                  <Tooltip
                    formatter={tooltipFormatter}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Radar
                    name={atleta1?.nome ?? 'Atleta A'}
                    dataKey="atletaA"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.16}
                    strokeWidth={3}
                    isAnimationActive={false}
                  />
                  <Radar
                    name={atleta2?.nome ?? 'Atleta B'}
                    dataKey="atletaB"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.08}
                    strokeWidth={3}
                    strokeDasharray="6 4"
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : dadosGrafico.length > 0 ? (
              <div style={styles.emptyChart}>
                O radar comparativo exige relatórios cadastrados para os dois atletas selecionados.
              </div>
            ) : (
              <div style={styles.emptyChart}>Sem dados de relatórios para montar o gráfico comparativo.</div>
            )}
          </div>
          {dadosGrafico.length > 0 ? (
            <div style={styles.radarMetrics}>
              {dadosGrafico.map((item) => (
                <div key={item.subject} style={styles.radarMetricRow}>
                  <span style={{ ...styles.radarMetricValue, color: '#3b82f6' }}>{item.atletaA.toFixed(1)}</span>
                  <span style={styles.radarMetricLabel}>{item.subject}</span>
                  <span style={{ ...styles.radarMetricValue, color: '#10b981' }}>{item.atletaB.toFixed(1)}</span>
                </div>
              ))}
            </div>
          ) : null}
          <div style={styles.statsSection}>
            <h4 style={styles.subTitle}>
              {radarCompletoDisponivel ? 'Comparativo Estatístico Complementar' : 'Comparativo Estatístico Alternativo'}
            </h4>
            <div style={{ width: '100%', height: '320px', marginTop: '16px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGraficoEstatistico} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                  <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    formatter={tooltipEstatisticoFormatter}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar name={atleta1?.nome ?? 'Atleta A'} dataKey="atletaA" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar name={atleta2?.nome ?? 'Atleta B'} dataKey="atletaB" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={styles.tableCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Info size={20} color="#f59e0b" />
            <h3 style={styles.cardTitle}>Comparação Direta</h3>
          </div>
          
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1?.idade ?? '-'}</td>
                <td style={styles.tdLabel}>Idade</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2?.idade ?? '-'}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1?.posicao ?? '-'}</td>
                <td style={styles.tdLabel}>Posição</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2?.posicao ?? '-'}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1?.clubeNome ?? '-'}</td>
                <td style={styles.tdLabel}>Clube</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2?.clubeNome ?? '-'}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1?.jogos ?? 0}</td>
                <td style={styles.tdLabel}>Jogos Agregados</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2?.jogos ?? 0}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, fontWeight: 'bold'}}>{atleta1?.gols ?? 0}</td>
                <td style={styles.tdLabel}>Gols</td>
                <td style={{...styles.tdValor2, fontWeight: 'bold'}}>{atleta2?.gols ?? 0}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, fontWeight: 'bold'}}>{atleta1?.assistencias ?? 0}</td>
                <td style={styles.tdLabel}>Assistências</td>
                <td style={{...styles.tdValor2, fontWeight: 'bold'}}>{atleta2?.assistencias ?? 0}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1?.desarmes ?? 0}</td>
                <td style={styles.tdLabel}>Desarmes</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2?.desarmes ?? 0}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1?.minutos ?? 0}</td>
                <td style={styles.tdLabel}>Minutos</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2?.minutos ?? 0}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#f59e0b'}}>{formatCurrency(atleta1?.valorMercado)}</td>
                <td style={styles.tdLabel}>Valor de Mercado</td>
                <td style={{...styles.tdValor2, color: '#f59e0b'}}>{formatCurrency(atleta2?.valorMercado)}</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', flexWrap: 'wrap', gap: '15px' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '12px' },
  selectArea: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' },
  filterHint: { color: '#94a3b8', fontSize: '12px' },
  selectContainer: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#0f172a', padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155' },
  selectBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  colorDot: { width: '12px', height: '12px', borderRadius: '50%' },
  select: { backgroundColor: '#1e293b', color: '#fff', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  errorBox: { backgroundColor: '#7f1d1d', color: '#fecaca', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ef4444' },
  loadingBox: { backgroundColor: '#0f172a', color: '#94a3b8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' },
  mainGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  chartCard: { flex: 2, backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155', minWidth: '400px' },
  tableCard: { flex: 1, backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155', minWidth: '300px' },
  cardTitle: { color: '#fff', margin: 0, fontSize: '18px' },
  chartHint: { marginTop: '14px', backgroundColor: '#0f172a', color: '#cbd5e1', border: '1px solid #334155', borderRadius: '10px', padding: '10px 12px', fontSize: '13px' },
  emptyChart: { height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', backgroundColor: '#0f172a', border: '1px dashed #334155', borderRadius: '10px', padding: '20px', textAlign: 'center' },
  radarMetrics: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '18px' },
  radarMetricRow: { display: 'grid', gridTemplateColumns: '72px 1fr 72px', alignItems: 'center', gap: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px' },
  radarMetricLabel: { color: '#cbd5e1', fontSize: '13px', textAlign: 'center', fontWeight: 'bold' },
  radarMetricValue: { fontSize: '14px', fontWeight: 'bold' },
  statsSection: { marginTop: '22px', paddingTop: '22px', borderTop: '1px solid #334155' },
  subTitle: { color: '#fff', margin: 0, fontSize: '16px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableRow: { borderBottom: '1px solid #334155' },
  tdLabel: { padding: '15px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold' },
  tdValor1: { padding: '15px 0', color: '#fff', fontSize: '16px', textAlign: 'right', width: '30%' },
  tdValor2: { padding: '15px 0', color: '#fff', fontSize: '16px', textAlign: 'left', width: '30%' }
};

export default ComparativoAtletas;
