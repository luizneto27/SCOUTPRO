import React, { useState, useMemo } from 'react';
import { GitCompare, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Mocks unificados com Atributos Gerais para facilitar a comparação no mesmo gráfico
const atletasDb = [
  { id: 1, nome: 'João Silva', posicao: 'Meio-Campo', idade: 24, valor: '€ 15M', jogos: 32, gols: 8, assistencias: 12, passes: '88%', atributos: { Ritmo: 75, Chute: 80, Passe: 88, Drible: 85, Defesa: 65, Fisico: 72 } },
  { id: 2, nome: 'Pedro Santos', posicao: 'Atacante', idade: 21, valor: '€ 22M', jogos: 28, gols: 18, assistencias: 4, passes: '78%', atributos: { Ritmo: 92, Chute: 89, Passe: 70, Drible: 86, Defesa: 35, Fisico: 75 } },
  { id: 3, nome: 'Lucas Pereira', posicao: 'Zagueiro', idade: 30, valor: '€ 4M', jogos: 41, gols: 2, assistencias: 1, passes: '91%', atributos: { Ritmo: 60, Chute: 45, Passe: 65, Drible: 55, Defesa: 88, Fisico: 90 } },
  { id: 4, nome: 'Gabriel Costa', posicao: 'Goleiro', idade: 28, valor: '€ 8.5M', jogos: 38, gols: 0, assistencias: 0, passes: '65%', atributos: { Ritmo: 40, Chute: 30, Passe: 65, Drible: 45, Defesa: 85, Fisico: 78 } }
];

const ComparativoAtletas = () => {
  const [atleta1Id, setAtleta1Id] = useState(1);
  const [atleta2Id, setAtleta2Id] = useState(2);

  // Busca os objetos completos dos atletas selecionados
  const atleta1 = atletasDb.find(a => a.id === atleta1Id);
  const atleta2 = atletasDb.find(a => a.id === atleta2Id);

  // Memoiza (salva na memória) a formatação dos dados para o Recharts ler corretamente
  const dadosGrafico = useMemo(() => {
    const chaves = ['Ritmo', 'Chute', 'Passe', 'Drible', 'Defesa', 'Fisico'];
    return chaves.map(chave => ({
      subject: chave,
      [atleta1.nome]: atleta1.atributos[chave],
      [atleta2.nome]: atleta2.atributos[chave],
    }));
  }, [atleta1, atleta2]);

  return (
    <div style={styles.container}>
      
      {/* Cabeçalho de Seleção */}
      <div style={styles.topBar}>
        <div style={styles.headerTitle}>
          <GitCompare size={24} color="#3b82f6" />
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Comparativo Head-to-Head</h2>
        </div>
        
        <div style={styles.selectContainer}>
          <div style={styles.selectBox}>
            <div style={{...styles.colorDot, backgroundColor: '#3b82f6'}}></div>
            <select style={styles.select} value={atleta1Id} onChange={(e) => setAtleta1Id(Number(e.target.value))}>
              {atletasDb.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.posicao})</option>)}
            </select>
          </div>
          <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>VS</span>
          <div style={styles.selectBox}>
            <div style={{...styles.colorDot, backgroundColor: '#10b981'}}></div>
            <select style={styles.select} value={atleta2Id} onChange={(e) => setAtleta2Id(Number(e.target.value))}>
              {atletasDb.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.posicao})</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={styles.mainGrid}>
        
        {/* Gráfico de Radar Sobreposto */}
        <div style={styles.chartCard}>
          <h3 style={styles.cardTitle}>Cruzamento de Atributos</h3>
          <div style={{ width: '100%', height: '350px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dadosGrafico}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                
                <Radar name={atleta1.nome} dataKey={atleta1.nome} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                <Radar name={atleta2.nome} dataKey={atleta2.nome} stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Comparação Direta */}
        <div style={styles.tableCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Info size={20} color="#f59e0b" />
            <h3 style={styles.cardTitle}>Comparação Direta</h3>
          </div>
          
          <table style={styles.table}>
            <tbody>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1.idade}</td>
                <td style={styles.tdLabel}>Idade</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2.idade}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1.posicao}</td>
                <td style={styles.tdLabel}>Posição</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2.posicao}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1.jogos}</td>
                <td style={styles.tdLabel}>Jogos na Temporada</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2.jogos}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, fontWeight: 'bold'}}>{atleta1.gols}</td>
                <td style={styles.tdLabel}>Gols</td>
                <td style={{...styles.tdValor2, fontWeight: 'bold'}}>{atleta2.gols}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, fontWeight: 'bold'}}>{atleta1.assistencias}</td>
                <td style={styles.tdLabel}>Assistências</td>
                <td style={{...styles.tdValor2, fontWeight: 'bold'}}>{atleta2.assistencias}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#3b82f6'}}>{atleta1.passes}</td>
                <td style={styles.tdLabel}>Acerto de Passes</td>
                <td style={{...styles.tdValor2, color: '#10b981'}}>{atleta2.passes}</td>
              </tr>
              <tr style={styles.tableRow}>
                <td style={{...styles.tdValor1, color: '#f59e0b'}}>{atleta1.valor}</td>
                <td style={styles.tdLabel}>Valor de Mercado</td>
                <td style={{...styles.tdValor2, color: '#f59e0b'}}>{atleta2.valor}</td>
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