import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Trash2, X, Briefcase, FileText, Calendar, MapPin, Eye, Edit } from 'lucide-react';
import { createClube, deleteClube, isAuthError, listClubeJogadores, listClubes, updateClube } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const emptyForm = {
  cnpj: '',
  nome: '',
  pais_id: '',
  cidade: '',
  fundacao: '',
};

const ClubesContratos = ({ onSessionExpired }) => {
  const [busca, setBusca] = useState('');
  const [clubes, setClubes] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [jogadoresDoClube, setJogadoresDoClube] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modoModal, setModoModal] = useState('novo');
  const [formClube, setFormClube] = useState(emptyForm);

  const carregarClubes = async () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      onSessionExpired?.();
      setLoading(false);
      return;
    }

    try {
      const data = await listClubes(token);
      setClubes(data ?? []);
      if (!selecionado && data?.length) {
        setSelecionado(data[0]);
      }
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessão expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar clubes.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarClubes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const carregarJogadores = async () => {
      const token = window.localStorage.getItem(TOKEN_KEY);
      if (!token || !selecionado?.cnpj) {
        setJogadoresDoClube([]);
        if (!token) {
          setError('Sessão expirada. Faça login novamente.');
          onSessionExpired?.();
        }
        return;
      }

      try {
        const data = await listClubeJogadores(token, selecionado.cnpj);
        setJogadoresDoClube(data ?? []);
      } catch (err) {
        setJogadoresDoClube([]);
        if (isAuthError(err)) {
          setError('Sessão expirada. Faça login novamente.');
          onSessionExpired?.();
        }
      }
    };

    carregarJogadores();
  }, [selecionado]);

  const clubesFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return clubes;
    }

    return clubes.filter((clube) => {
      return [clube.nome, clube.cnpj, clube.cidade, clube.pais?.nome, clube.pais?.sigla]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termo));
    });
  }, [clubes, busca]);

  const abrirNovo = () => {
    setModoModal('novo');
    setFormClube(emptyForm);
    setModalAberto(true);
  };

  const abrirEditar = (clube) => {
    setModoModal('editar');
    setFormClube({
      cnpj: clube.cnpj ?? '',
      nome: clube.nome ?? '',
      pais_id: clube.pais?.id ?? '',
      cidade: clube.cidade ?? '',
      fundacao: clube.fundacao ?? '',
    });
    setModalAberto(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormClube((prev) => ({ ...prev, [name]: value }));
  };

  const salvar = async (e) => {
    e.preventDefault();

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    const payload = {
      cnpj: formClube.cnpj.trim(),
      nome: formClube.nome.trim(),
      pais_id: Number(formClube.pais_id),
      cidade: formClube.cidade.trim() || null,
      fundacao: formClube.fundacao || null,
    };

    try {
      if (modoModal === 'novo') {
        await createClube(token, payload);
      } else {
        await updateClube(token, formClube.cnpj, payload);
      }

      await carregarClubes();
      setModalAberto(false);
      setFormClube(emptyForm);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessão expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao salvar clube.');
      }
    }
  };

  const remover = async (clube) => {
    if (!window.confirm(`Remover o clube ${clube.nome}?`)) {
      return;
    }

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    try {
      await deleteClube(token, clube.cnpj);
      setClubes((atual) => atual.filter((item) => item.cnpj !== clube.cnpj));
      if (selecionado?.cnpj === clube.cnpj) {
        setSelecionado(null);
        setJogadoresDoClube([]);
      }
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessão expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao excluir clube.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Briefcase size={20} color="#3b82f6" />
            <span style={styles.cardTitle}>Clubes cadastrados</span>
          </div>
          <h3 style={styles.cardValue}>{clubes.length}</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Endpoint /clubes</span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <MapPin size={20} color="#10b981" />
            <span style={styles.cardTitle}>Clube selecionado</span>
          </div>
          <h3 style={styles.cardValue}>{selecionado?.nome || '-'}</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>{selecionado?.cnpj || 'Selecione um clube'}</span>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <FileText size={20} color="#f59e0b" />
            <span style={styles.cardTitle}>Jogadores do clube</span>
          </div>
          <h3 style={styles.cardValue}>{jogadoresDoClube.length}</h3>
          <span style={{ color: '#94a3b8', fontSize: '12px' }}>Endpoint /clubes/jogadores?cnpj=...</span>
        </div>
      </div>

      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar clube..."
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button style={styles.addButton} onClick={abrirNovo}>
          <Plus size={18} /> Novo Clube
        </button>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loading ? <div style={styles.loadingBox}>Carregando clubes...</div> : null}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>CNPJ</th>
              <th style={styles.th}>País</th>
              <th style={styles.th}>Cidade</th>
              <th style={styles.th}>Fundação</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clubesFiltrados.map((clube) => (
              <tr key={clube.id} style={styles.tableRow}>
                <td style={styles.tdBold}>{clube.nome}</td>
                <td style={styles.td}>{clube.cnpj}</td>
                <td style={styles.td}>{clube.pais ? `${clube.pais.nome} (${clube.pais.sigla})` : '-'}</td>
                <td style={styles.td}>{clube.cidade || '-'}</td>
                <td style={styles.td}>{clube.fundacao || '-'}</td>
                <td style={styles.tdActions}>
                  <button style={styles.actionBtn} title="Selecionar" onClick={() => setSelecionado(clube)}>
                    <Eye size={18} color="#3b82f6" />
                  </button>
                  <button style={styles.actionBtn} title="Editar" onClick={() => abrirEditar(clube)}>
                    <Edit size={18} color="#10b981" />
                  </button>
                  <button style={styles.actionBtn} title="Excluir" onClick={() => remover(clube)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecionado && (
        <div style={styles.detailCard}>
          <div style={styles.detailHeader}>
            <h3 style={styles.detailTitle}>Jogadores do clube</h3>
            <span style={styles.detailSubtitle}>{selecionado.nome}</span>
          </div>
          <div style={styles.playerList}>
            {jogadoresDoClube.length === 0 ? (
              <div style={styles.emptyState}>Nenhum jogador ativo vinculado a este clube.</div>
            ) : (
              jogadoresDoClube.map((jogador) => (
                <div key={jogador.id} style={styles.playerItem}>
                  <div>
                    <div style={styles.playerName}>{jogador.nome}</div>
                    <div style={styles.playerMeta}>{jogador.tipoJogador}</div>
                  </div>
                  <div style={styles.playerMeta}>{jogador.pais ? jogador.pais.nome : '-'}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {modalAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={salvar} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{modoModal === 'novo' ? 'Novo Clube' : 'Editar Clube'}</h3>
              <button type="button" style={styles.closeBtn} onClick={() => setModalAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={styles.fieldLabel}>CNPJ</label>
                  <input type="text" name="cnpj" required value={formClube.cnpj} onChange={handleChange} style={styles.inputModal} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Nome</label>
                  <input type="text" name="nome" required value={formClube.nome} onChange={handleChange} style={styles.inputModal} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>País ID</label>
                    <input type="number" name="pais_id" required value={formClube.pais_id} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Cidade</label>
                    <input type="text" name="cidade" value={formClube.cidade} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>
                <div>
                  <label style={styles.fieldLabel}>Fundação</label>
                  <input type="date" name="fundacao" value={formClube.fundacao} onChange={handleChange} style={styles.inputModal} />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalAberto(false)}>Cancelar</button>
              <button type="submit" style={styles.btnSave}>Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '20px' },
  cardsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' },
  card: { backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  cardTitle: { color: '#94a3b8', fontSize: '14px', fontWeight: 'bold' },
  cardValue: { color: '#fff', fontSize: '24px', margin: '0 0 5px 0', fontWeight: 'bold' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '12px', border: '1px solid #334155' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', width: '350px' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  errorBox: { backgroundColor: '#7f1d1d', color: '#fecaca', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ef4444' },
  loadingBox: { backgroundColor: '#0f172a', color: '#94a3b8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '13px', paddingBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #334155' },
  td: { padding: '15px 0', color: '#cbd5e1', fontSize: '14px' },
  tdBold: { padding: '15px 0', color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  detailCard: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  detailTitle: { color: '#fff', margin: 0 },
  detailSubtitle: { color: '#94a3b8', fontSize: '14px' },
  playerList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  playerItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#0f172a', borderRadius: '10px', border: '1px solid #334155' },
  playerName: { color: '#fff', fontWeight: 'bold' },
  playerMeta: { color: '#94a3b8', fontSize: '13px' },
  emptyState: { color: '#94a3b8', padding: '12px 0' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1e293b', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '720px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' },
  modalTitle: { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  modalBody: { padding: '25px' },
  fieldLabel: { color: '#cbd5e1', fontSize: '13px', display: 'block', marginBottom: '6px' },
  inputModal: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #334155' },
  btnCancel: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' }
};

export default ClubesContratos;
