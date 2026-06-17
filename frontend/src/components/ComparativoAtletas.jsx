import React, { useEffect, useMemo, useState } from 'react';
import { GitCompare, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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
        if (itens.length >= 2) {
          setAtleta1Id(String(itens[0].id));
          setAtleta2Id(String(itens[1].id));
        }
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
      [atleta1.nome]: Number(item.valorAtletaA ?? 0),
      [atleta2.nome]: Number(item.valorAtletaB ?? 0),
    }));
  }, [comparativo, atleta1, atleta2]);

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

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.headerTitle}>
          <GitCompare size={24} color="#3b82f6" />
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Comparativo Head-to-Head</h2>
        </div>
        <div style={styles.selectContainer}>
          <div style={styles.selectBox}>
            <div style={{...styles.colorDot, backgroundColor: '#3b82f6'}}></div>
            <select style={styles.select} value={atleta1Id} onChange={(e) => setAtleta1Id(e.target.value)}>
              {atletas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
          <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>VS</span>
          <div style={styles.selectBox}>
            <div style={{...styles.colorDot, backgroundColor: '#10b981'}}></div>
            <select style={styles.select} value={atleta2Id} onChange={(e) => setAtleta2Id(e.target.value)}>
              {atletas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loading ? <div style={styles.loadingBox}>Carregando comparativo...</div> : null}

      <div style={styles.mainGrid}>
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>Cruzamento de Relatórios</h3>
          <div style={{ width: '100%', height: '350px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dadosGrafico}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                {atleta1 && <Radar name={atleta1.nome} dataKey={atleta1.nome} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />}
                {atleta2 && <Radar name={atleta2.nome} dataKey={atleta2.nome} stroke="#10b981" fill="#10b981" fillOpacity={0.5} />}
              </RadarChart>
            </ResponsiveContainer>
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
  selectContainer: { display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#0f172a', padding: '10px 20px', borderRadius: '8px', border: '1px solid #334155' },
  selectBox: { display: 'flex', alignItems: 'center', gap: '10px' },
  colorDot: { width: '12px', height: '12px', borderRadius: '50%' },
  select: { backgroundColor: 'transparent', color: '#fff', border: 'none', outline: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  errorBox: { backgroundColor: '#7f1d1d', color: '#fecaca', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ef4444' },
  loadingBox: { backgroundColor: '#0f172a', color: '#94a3b8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' },
  mainGrid: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  chartCard: { flex: 2, backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155', minWidth: '400px' },
  tableCard: { flex: 1, backgroundColor: '#1e293b', padding: '25px', borderRadius: '12px', border: '1px solid #334155', minWidth: '300px' },
  cardTitle: { color: '#fff', margin: 0, fontSize: '18px' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableRow: { borderBottom: '1px solid #334155' },
  tdLabel: { padding: '15px 0', color: '#94a3b8', fontSize: '13px', textAlign: 'center', textTransform: 'uppercase', fontWeight: 'bold' },
  tdValor1: { padding: '15px 0', color: '#fff', fontSize: '16px', textAlign: 'right', width: '30%' },
  tdValor2: { padding: '15px 0', color: '#fff', fontSize: '16px', textAlign: 'left', width: '30%' }
};

export default ComparativoAtletas;
