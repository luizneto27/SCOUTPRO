import React, { useState } from 'react';
import { Search, Plus, Edit, Eye, Trash2, X, User, Shield, MapPin, DollarSign, FileText } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Mocks iniciais com atributos para o Gráfico de Radar
const atletasIniciais = [
  { id: 1, nome: 'João Silva', posicao: 'Meio-Campo', tipo: 'Linha', idade: 24, nacionalidade: 'Brasil', status: 'Vinculado', valorMercado: '€ 15.000.000', clube: 'Clube A', atributos: [ { subject: 'Ritmo', A: 75 }, { subject: 'Chute', A: 80 }, { subject: 'Passe', A: 88 }, { subject: 'Drible', A: 85 }, { subject: 'Defesa', A: 65 }, { subject: 'Físico', A: 72 } ] },
  { id: 2, nome: 'Gabriel Costa', posicao: 'Goleiro', tipo: 'Goleiro', idade: 28, nacionalidade: 'Portugal', status: 'Livre', valorMercado: '€ 8.500.000', clube: 'Sem Clube', atributos: [ { subject: 'Reflexo', A: 90 }, { subject: 'Mergulho', A: 88 }, { subject: 'Passe', A: 65 }, { subject: 'Posicionamento', A: 85 }, { subject: '1v1', A: 82 }, { subject: 'Físico', A: 78 } ] },
  { id: 3, nome: 'Pedro Santos', posicao: 'Atacante', tipo: 'Linha', idade: 21, nacionalidade: 'Brasil', status: 'Vinculado', valorMercado: '€ 22.000.000', clube: 'Clube C', atributos: [ { subject: 'Ritmo', A: 92 }, { subject: 'Chute', A: 89 }, { subject: 'Passe', A: 70 }, { subject: 'Drible', A: 86 }, { subject: 'Defesa', A: 35 }, { subject: 'Físico', A: 75 } ] },
  { id: 4, nome: 'Lucas Pereira', posicao: 'Zagueiro', tipo: 'Linha', idade: 30, nacionalidade: 'Argentina', status: 'Vinculado', valorMercado: '€ 4.000.000', clube: 'Clube A', atributos: [ { subject: 'Ritmo', A: 60 }, { subject: 'Chute', A: 45 }, { subject: 'Passe', A: 65 }, { subject: 'Drible', A: 55 }, { subject: 'Defesa', A: 88 }, { subject: 'Físico', A: 90 } ] },
];

const GestaoAtletas = () => {
  const [busca, setBusca] = useState('');
  const [atletas, setAtletas] = useState(atletasIniciais);
  
  // Controle do Modal de Cadastro/Edição
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modoModal, setModoModal] = useState('novo'); // 'novo' ou 'editar'
  
  // Estado único para controlar os campos do formulário interno
  const [formAtleta, setFormAtleta] = useState({
    id: null,
    nome: '',
    tipo: 'Linha',
    posicao: '',
    idade: '',
    valorMercado: '',
    nacionalidade: '',
    status: 'Livre',
    clube: ''
  });

  // Controle do Modal de Perfil Detalhado (SP-12)
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [atletaVisto, setAtletaVisto] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm("Tem certeza que deseja remover este atleta?")) {
      setAtletas(atletas.filter(atleta => atleta.id !== id));
    }
  };

  const abrirPerfil = (atleta) => {
    setAtletaVisto(atleta);
    setPerfilAberto(true);
  };

  // Prepara os campos vazios para criar um NOVO atleta
  const abrirModalNovo = () => {
    setModoModal('novo');
    setFormAtleta({
      id: null,
      nome: '',
      tipo: 'Linha',
      posicao: '',
      idade: '',
      valorMercado: '€ ',
      nacionalidade: 'Brasil',
      status: 'Livre',
      clube: 'Sem Clube'
    });
    setModalFormAberto(true);
  };

  // Captura o atleta selecionado e preenche o formulário com as informações atuais dele
  const abrirModalEditar = (atleta) => {
    setModoModal('editar');
    setFormAtleta({
      id: atleta.id,
      nome: atleta.nome,
      tipo: atleta.tipo,
      posicao: atleta.posicao,
      idade: atleta.idade,
      valorMercado: atleta.valorMercado,
      nacionalidade: atleta.nacionalidade || 'Brasil',
      status: atleta.status || 'Livre',
      clube: atleta.clube || 'Sem Clube',
      atributos: atleta.atributos // Mantém as notas do radar intactas
    });
    setModalFormAberto(true);
  };

  // Função que atualiza o estado dinamicamente quando você digita nos inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormAtleta(prev => ({ ...prev, [name]: value }));
  };

  // Executa o salvamento no clique do botão final do formulário
  const handleSave = (e) => {
    e.preventDefault();

    if (modoModal === 'novo') {
      // Lógica para adicionar na lista temporária (Novo)
      const novoAtleta = {
        ...formAtleta,
        id: atletas.length + 1,
        // Gera notas padrão para o gráfico não quebrar
        atributos: [
          { subject: formAtleta.tipo === 'Goleiro' ? 'Reflexo' : 'Ritmo', A: 75 },
          { subject: formAtleta.tipo === 'Goleiro' ? 'Mergulho' : 'Chute', A: 70 },
          { subject: 'Passe', A: 75 },
          { subject: formAtleta.tipo === 'Goleiro' ? 'Posicionamento' : 'Drible', A: 70 },
          { subject: formAtleta.tipo === 'Goleiro' ? '1v1' : 'Defesa', A: 65 },
          { subject: 'Físico', A: 75 }
        ]
      };
      setAtletas([...atletas, novoAtleta]);
    } else {
      // Lógica para atualizar o item correto dentro da lista (Editar)
      setAtletas(atletas.map(atleta => 
        atleta.id === formAtleta.id ? { ...atleta, ...formAtleta } : atleta
      ));
    }

    setModalFormAberto(false);
  };

  const atletasFiltrados = atletas.filter(atleta => 
    atleta.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Barra superior de ações */}
      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Buscar atleta por nome..." 
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button style={styles.addButton} onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Atleta
        </button>
      </div>

      {/* Tabela de Gestão */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nome do Atleta</th>
              <th style={styles.th}>Classificação</th>
              <th style={styles.th}>Posição</th>
              <th style={styles.th}>Idade</th>
              <th style={styles.th}>Valor de Mercado</th>
              <th style={{...styles.th, textAlign: 'center'}}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {atletasFiltrados.map((atleta) => (
              <tr key={atleta.id} style={styles.tableRow}>
                <td style={styles.tdBold}>{atleta.nome}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: atleta.tipo === 'Goleiro' ? '#8b5cf620' : '#3b82f620', color: atleta.tipo === 'Goleiro' ? '#c4b5fd' : '#93c5fd' }}>
                    {atleta.tipo}
                  </span>
                </td>
                <td style={styles.td}>{atleta.posicao}</td>
                <td style={styles.td}>{atleta.idade} anos</td>
                <td style={styles.td}>{atleta.valorMercado}</td>
                <td style={styles.tdActions}>
                  <button style={styles.actionBtn} title="Ver Perfil" onClick={() => abrirPerfil(atleta)}>
                    <Eye size={18} color="#3b82f6" />
                  </button>
                  {/* CONECTADO: Abre o formulário preenchido com este atleta */}
                  <button style={styles.actionBtn} title="Editar" onClick={() => abrirModalEditar(atleta)}>
                    <Edit size={18} color="#10b981" />
                  </button>
                  <button style={styles.actionBtn} title="Excluir" onClick={() => handleDelete(atleta.id)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE PERFIL DETALHADO (SP-12) */}
      {perfilAberto && atletaVisto && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '800px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={styles.avatarGiga}><User size={32} color="#fff" /></div>
                <div>
                  <h3 style={styles.modalTitle}>{atletaVisto.nome}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>{atletaVisto.posicao} • {atletaVisto.idade} anos</span>
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setPerfilAberto(false)}><X size={24} color="#94a3b8" /></button>
            </div>
            <div style={styles.profileBody}>
              <div style={styles.infoBox}>
                <h4 style={styles.sectionTitle}>Informações Gerais</h4>
                <div style={styles.infoRow}><MapPin size={18} color="#3b82f6" /><div><div style={styles.infoLabel}>Nacionalidade</div><div style={styles.infoValue}>{atletaVisto.nacionalidade}</div></div></div>
                <div style={styles.infoRow}><Shield size={18} color="#10b981" /><div><div style={styles.infoLabel}>Clube Atual</div><div style={styles.infoValue}>{atletaVisto.clube}</div></div></div>
                <div style={styles.infoRow}><FileText size={18} color="#f59e0b" /><div><div style={styles.infoLabel}>Status Contratual</div><div style={styles.infoValue}>{atletaVisto.status}</div></div></div>
                <div style={styles.infoRow}><DollarSign size={18} color="#06b6d4" /><div><div style={styles.infoLabel}>Valor de Mercado</div><div style={styles.infoValue}>{atletaVisto.valorMercado}</div></div></div>
              </div>
              <div style={styles.chartBox}>
                <h4 style={{ ...styles.sectionTitle, textAlign: 'center' }}>Atributos de Scouting</h4>
                <div style={{ width: '100%', height: '250px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={atletaVisto.atributos}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Atributos" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------- */}
      {/* FORMULÁRIO DINÂMICO DE CADASTRO / EDIÇÃO */}
      {/* --------------------------------------------------- */}
      {modalFormAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSave} style={styles.modalContent}>
            
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modoModal === 'novo' ? 'Cadastrar Novo Atleta' : `Editar Perfil de ${formAtleta.nome}`}
              </h3>
              <button type="button" style={styles.closeBtn} onClick={() => setModalFormAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div>
                  <label style={styles.fieldLabel}>Nome Completo</label>
                  <input type="text" name="nome" required value={formAtleta.nome} onChange={handleChange} style={styles.inputModal} />
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Classificação</label>
                    <select name="tipo" value={formAtleta.tipo} onChange={handleChange} style={styles.inputModal}>
                      <option value="Linha">Jogador de Linha</option>
                      <option value="Goleiro">Goleiro</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Posição Técnica</label>
                    <input type="text" name="posicao" placeholder="Ex: Atacante, Zagueiro" required value={formAtleta.posicao} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Idade</label>
                    <input type="number" name="idade" required value={formAtleta.idade} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Valor de Mercado</label>
                    <input type="text" name="valorMercado" required value={formAtleta.valorMercado} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Clube Atual</label>
                    <input type="text" name="clube" required value={formAtleta.clube} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Status Contratual</label>
                    <select name="status" value={formAtleta.status} onChange={handleChange} style={styles.inputModal}>
                      <option value="Vinculado">Vinculado a Clube</option>
                      <option value="Livre">Livre no Mercado</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalFormAberto(false)}>Cancelar</button>
              <button type="submit" style={styles.btnSave}>Salvar Alterações</button>
            </div>

          </form>
        </div>
      )}
    </div>
  );
};

// --- ESTILOS ---
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '12px', border: '1px solid #334155' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', width: '350px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '13px', paddingBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #334155', transition: '0.2s' },
  td: { padding: '15px 0', color: '#cbd5e1', fontSize: '14px' },
  tdBold: { padding: '15px 0', color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1e293b', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '600px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' },
  modalTitle: { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  avatarGiga: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  profileBody: { display: 'flex', padding: '20px', gap: '30px' },
  infoBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
  chartBox: { flex: 1, backgroundColor: '#0f172a', borderRadius: '12px', padding: '15px', border: '1px solid #334155' },
  sectionTitle: { color: '#fff', fontSize: '16px', margin: '0 0 10px 0', fontWeight: 'bold' },
  infoRow: { display: 'flex', alignItems: 'center', gap: '15px' },
  infoLabel: { color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' },
  infoValue: { color: '#fff', fontSize: '15px' },
  modalBody: { padding: '25px' },
  fieldLabel: { color: '#cbd5e1', fontSize: '13px', display: 'block', marginBottom: '6px' },
  inputModal: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #334155' },
  btnCancel: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }
};

export default GestaoAtletas;