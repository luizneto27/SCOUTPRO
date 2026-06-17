import React, { useEffect, useMemo, useState } from 'react';
import { Search, Plus, Edit, Eye, Trash2, X, User, Shield, MapPin, DollarSign, FileText } from 'lucide-react';
import { createJogador, deleteJogador, isAuthError, listJogadores, updateJogador } from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const emptyForm = {
  id: null,
  nome: '',
  nomeCompleto: '',
  tipoJogador: 'JOGADOR_LINHA',
  ativo: true,
  dataNascimento: '',
  paisId: '',
  valorMercado: '',
  titulos: '',
  alturaCm: '',
  pesoKg: '',
  peDominante: '',
  empresarioId: '',
  perfilTexto: '',
};

const GestaoAtletas = ({ onSessionExpired }) => {
  const [busca, setBusca] = useState('');
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [modoModal, setModoModal] = useState('novo');
  const [formAtleta, setFormAtleta] = useState(emptyForm);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [atletaVisto, setAtletaVisto] = useState(null);

  useEffect(() => {
    let ativo = true;
    const token = window.localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      onSessionExpired?.();
      setLoading(false);
      return () => {
        ativo = false;
      };
    }

    const carregar = async () => {
      try {
        const data = await listJogadores(token, { size: 100 });
        if (ativo) {
          setAtletas(data?.content ?? []);
        }
      } catch (err) {
        if (ativo) {
          if (isAuthError(err)) {
            setError('Sessão expirada. Faça login novamente.');
            onSessionExpired?.();
            return;
          }
          setError(err.message || 'Falha ao carregar atletas.');
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const atletasFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return atletas;
    }

    return atletas.filter((atleta) => {
      return [
        atleta.nome,
        atleta.nomeCompleto,
        atleta.tipoJogador,
        atleta.pais?.nome,
        atleta.pais?.sigla,
      ]
        .filter(Boolean)
        .some((valor) => String(valor).toLowerCase().includes(termo));
    });
  }, [atletas, busca]);

  const abrirPerfil = (atleta) => {
    setAtletaVisto(atleta);
    setPerfilAberto(true);
  };

  const abrirModalNovo = () => {
    setModoModal('novo');
    setFormAtleta(emptyForm);
    setModalFormAberto(true);
  };

  const abrirModalEditar = (atleta) => {
    setModoModal('editar');
    setFormAtleta({
      id: atleta.id,
      nome: atleta.nome ?? '',
      nomeCompleto: atleta.nomeCompleto ?? '',
      tipoJogador: atleta.tipoJogador ?? 'JOGADOR_LINHA',
      ativo: atleta.ativo ?? true,
      dataNascimento: atleta.dataNascimento ?? '',
      paisId: atleta.pais?.id ?? '',
      valorMercado: atleta.valorMercado ?? '',
      titulos: atleta.titulos ?? '',
      alturaCm: atleta.alturaCm ?? '',
      pesoKg: atleta.pesoKg ?? '',
      peDominante: atleta.peDominante ?? '',
      empresarioId: atleta.empresario?.id ?? '',
      perfilTexto: atleta.perfilTexto ?? '',
    });
    setModalFormAberto(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormAtleta((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    const payload = {
      nome: formAtleta.nome.trim(),
      nomeCompleto: formAtleta.nomeCompleto.trim() || null,
      perfilTexto: formAtleta.perfilTexto.trim() || null,
      dataNascimento: formAtleta.dataNascimento || null,
      paisId: formAtleta.paisId ? Number(formAtleta.paisId) : null,
      valorMercado: formAtleta.valorMercado ? Number(formAtleta.valorMercado) : null,
      titulos: formAtleta.titulos === '' ? null : Number(formAtleta.titulos),
      alturaCm: formAtleta.alturaCm === '' ? null : Number(formAtleta.alturaCm),
      pesoKg: formAtleta.pesoKg === '' ? null : Number(formAtleta.pesoKg),
      peDominante: formAtleta.peDominante || null,
      empresarioId: formAtleta.empresarioId ? Number(formAtleta.empresarioId) : null,
      ativo: Boolean(formAtleta.ativo),
      tipoJogador: formAtleta.tipoJogador,
      posicoes: null,
    };

    try {
      const saved = modoModal === 'novo'
        ? await createJogador(token, payload)
        : await updateJogador(token, formAtleta.id, payload);

      const reload = await listJogadores(token, { size: 100 });
      setAtletas(reload?.content ?? []);
      setModalFormAberto(false);
      setFormAtleta(emptyForm);
      setError('');
      if (saved) {
        setAtletaVisto(saved);
      }
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessão expirada. Faça login novamente.');
        onSessionExpired?.();
        return;
      }
      setError(err.message || 'Falha ao salvar atleta.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover este atleta?')) {
      return;
    }

    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessão expirada. Faça login novamente.');
      onSessionExpired?.();
      return;
    }

    try {
      await deleteJogador(token, id);
      setAtletas((current) => current.filter((atleta) => atleta.id !== id));
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessão expirada. Faça login novamente.');
        onSessionExpired?.();
        return;
      }
      setError(err.message || 'Falha ao remover atleta.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar atleta..."
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <button style={styles.addButton} onClick={abrirModalNovo}>
          <Plus size={18} /> Novo Atleta
        </button>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loading ? <div style={styles.loadingBox}>Carregando atletas...</div> : null}

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Nome</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Ativo</th>
              <th style={styles.th}>País</th>
              <th style={styles.th}>Valor</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {atletasFiltrados.map((atleta) => (
              <tr key={atleta.id} style={styles.tableRow}>
                <td style={styles.tdBold}>{atleta.nome}</td>
                <td style={styles.td}>{atleta.tipoJogador}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: atleta.ativo ? '#10b98120' : '#ef444420', color: atleta.ativo ? '#10b981' : '#ef4444' }}>
                    {atleta.ativo ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td style={styles.td}>{atleta.pais ? `${atleta.pais.nome} (${atleta.pais.sigla})` : '-'}</td>
                <td style={styles.td}>{atleta.valorMercado ?? '-'}</td>
                <td style={styles.tdActions}>
                  <button style={styles.actionBtn} title="Ver Perfil" onClick={() => abrirPerfil(atleta)}>
                    <Eye size={18} color="#3b82f6" />
                  </button>
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

      {perfilAberto && atletaVisto && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, maxWidth: '760px' }}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={styles.avatarGiga}><User size={32} color="#fff" /></div>
                <div>
                  <h3 style={styles.modalTitle}>{atletaVisto.nome}</h3>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>{atletaVisto.tipoJogador}</span>
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setPerfilAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <div style={styles.profileBody}>
              <div style={styles.infoBox}>
                <h4 style={styles.sectionTitle}>Informações Gerais</h4>
                <div style={styles.infoRow}><MapPin size={18} color="#3b82f6" /><div><div style={styles.infoLabel}>País</div><div style={styles.infoValue}>{atletaVisto.pais ? atletaVisto.pais.nome : '-'}</div></div></div>
                <div style={styles.infoRow}><Shield size={18} color="#10b981" /><div><div style={styles.infoLabel}>Ativo</div><div style={styles.infoValue}>{atletaVisto.ativo ? 'Sim' : 'Não'}</div></div></div>
                <div style={styles.infoRow}><FileText size={18} color="#f59e0b" /><div><div style={styles.infoLabel}>Posições</div><div style={styles.infoValue}>{Array.isArray(atletaVisto.posicoes) && atletaVisto.posicoes.length ? atletaVisto.posicoes.map((p) => p.nome).join(', ') : '-'}</div></div></div>
                <div style={styles.infoRow}><DollarSign size={18} color="#06b6d4" /><div><div style={styles.infoLabel}>Valor de Mercado</div><div style={styles.infoValue}>{atletaVisto.valorMercado ?? '-'}</div></div></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalFormAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={handleSave} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{modoModal === 'novo' ? 'Cadastrar Novo Atleta' : `Editar ${formAtleta.nome}`}</h3>
              <button type="button" style={styles.closeBtn} onClick={() => setModalFormAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={styles.fieldLabel}>Nome</label>
                  <input type="text" name="nome" required value={formAtleta.nome} onChange={handleChange} style={styles.inputModal} />
                </div>
                <div>
                  <label style={styles.fieldLabel}>Nome completo</label>
                  <input type="text" name="nomeCompleto" value={formAtleta.nomeCompleto} onChange={handleChange} style={styles.inputModal} />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Tipo</label>
                    <select name="tipoJogador" value={formAtleta.tipoJogador} onChange={handleChange} style={styles.inputModal}>
                      <option value="JOGADOR_LINHA">Jogador de linha</option>
                      <option value="GOLEIRO">Goleiro</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Ativo</label>
                    <select name="ativo" value={formAtleta.ativo ? 'true' : 'false'} onChange={(e) => setFormAtleta((prev) => ({ ...prev, ativo: e.target.value === 'true' }))} style={styles.inputModal}>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>País ID</label>
                    <input type="number" name="paisId" value={formAtleta.paisId} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data de nascimento</label>
                    <input type="date" name="dataNascimento" value={formAtleta.dataNascimento} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Valor de mercado</label>
                    <input type="number" step="0.01" name="valorMercado" value={formAtleta.valorMercado} onChange={handleChange} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Posição dominante (opcional)</label>
                    <input type="text" name="perfilTexto" value={formAtleta.perfilTexto} onChange={handleChange} style={styles.inputModal} />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalFormAberto(false)}>Cancelar</button>
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
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#1e293b', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '720px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' },
  modalTitle: { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  avatarGiga: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  profileBody: { display: 'flex', padding: '20px', gap: '30px' },
  infoBox: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
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
