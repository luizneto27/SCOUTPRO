import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, Calendar, Edit, Plus, RefreshCw, Search, Shield, Target, Trash2, X } from 'lucide-react';
import {
  createDisputa,
  createPartida,
  deleteDisputa,
  deletePartida,
  isAuthError,
  listCampeonatos,
  listCompeticaoEdicoes,
  listDisputas,
  listEstatisticas,
  listJogadores,
  listPartidas,
  updateDisputa,
  updatePartida,
} from '../lib/api';

const TOKEN_KEY = 'scoutpro.token';

const emptyPartidaForm = {
  id: null,
  data: '',
  competicaoEdicaoId: '',
};

const emptyDisputaForm = {
  jogadorId: '',
  golsPartida: '0',
  finalizacoesGolPartida: '0',
  faltasCometidasPartida: '0',
  faltasSofridasPartida: '0',
  cartoesAmarelosPartida: '0',
  cartoesVermelhosPartida: '0',
  impedimentosPartida: '0',
  kmPercorridosPartida: '0',
  desarmesPartida: '0',
  passesChavePartida: '0',
  minutosJogadosPartida: '0',
  notaPartida: '',
  reposicoesPartida: '0',
  golsSofridosPartida: '0',
  penaltisDefendidosPartida: '0',
  defesasDificeisPartida: '0',
  cleanSheetPartida: false,
};

const EstatisticasPartida = ({ onSessionExpired }) => {
  const [busca, setBusca] = useState('');
  const [campeonatos, setCampeonatos] = useState([]);
  const [edicoes, setEdicoes] = useState([]);
  const [jogadores, setJogadores] = useState([]);
  const [campeonatoSelecionadoId, setCampeonatoSelecionadoId] = useState('');
  const [edicaoSelecionadaId, setEdicaoSelecionadaId] = useState('');
  const [partidas, setPartidas] = useState([]);
  const [partidasPage, setPartidasPage] = useState({ number: 0, totalPages: 0, totalElements: 0, size: 8 });
  const [partidaSelecionadaId, setPartidaSelecionadaId] = useState('');
  const [disputas, setDisputas] = useState([]);
  const [estatisticas, setEstatisticas] = useState([]);
  const [estatisticasPage, setEstatisticasPage] = useState({ number: 0, totalPages: 0, totalElements: 0, size: 8 });
  const [loadingCampeonatos, setLoadingCampeonatos] = useState(true);
  const [loadingPartidas, setLoadingPartidas] = useState(false);
  const [loadingPainel, setLoadingPainel] = useState(false);
  const [error, setError] = useState('');
  const [modalPartidaAberto, setModalPartidaAberto] = useState(false);
  const [modoModalPartida, setModoModalPartida] = useState('novo');
  const [formPartida, setFormPartida] = useState(emptyPartidaForm);
  const [modalDisputaAberto, setModalDisputaAberto] = useState(false);
  const [modoModalDisputa, setModoModalDisputa] = useState('novo');
  const [formDisputa, setFormDisputa] = useState(emptyDisputaForm);

  const campeonatoSelecionado = useMemo(
    () => campeonatos.find((item) => String(item.id) === String(campeonatoSelecionadoId)) ?? null,
    [campeonatos, campeonatoSelecionadoId]
  );

  const edicaoSelecionada = useMemo(
    () => edicoes.find((item) => String(item.id) === String(edicaoSelecionadaId)) ?? null,
    [edicoes, edicaoSelecionadaId]
  );

  const partidaSelecionada = useMemo(
    () => partidas.find((item) => String(item.id) === String(partidaSelecionadaId)) ?? null,
    [partidas, partidaSelecionadaId]
  );

  const partidasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) {
      return partidas;
    }

    return partidas.filter((partida) =>
      [partida.id, partida.data, partida.competicaoEdicaoId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(termo))
    );
  }, [partidas, busca]);

  const getToken = () => {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setError('Sessao expirada. Faça login novamente.');
      onSessionExpired?.();
      return null;
    }
    return token;
  };

  const carregarCampeonatos = async () => {
    const token = getToken();
    if (!token) {
      setLoadingCampeonatos(false);
      return;
    }

    try {
      const [campeonatosData, jogadoresData] = await Promise.all([
        listCampeonatos(token, { size: 100 }),
        listJogadores(token, { size: 200 }),
      ]);
      const itens = campeonatosData?.content ?? [];
      setCampeonatos(itens);
      setJogadores(jogadoresData?.content ?? []);
      if (!campeonatoSelecionadoId && itens.length > 0) {
        setCampeonatoSelecionadoId(String(itens[0].id));
      }
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar campeonatos.');
      }
    } finally {
      setLoadingCampeonatos(false);
    }
  };

  const carregarEdicoes = async (campeonatoId) => {
    const token = getToken();
    if (!token || !campeonatoId) {
      setEdicoes([]);
      setEdicaoSelecionadaId('');
      return;
    }

    try {
      const itens = await listCompeticaoEdicoes(token, campeonatoId);
      setEdicoes(itens ?? []);
      const primeiraEdicaoId = itens?.[0]?.id ? String(itens[0].id) : '';
      setEdicaoSelecionadaId((current) => {
        if (current && itens.some((item) => String(item.id) === String(current))) {
          return current;
        }
        return primeiraEdicaoId;
      });
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar edicoes.');
      }
    }
  };

  const carregarPartidas = async (campeonatoId, competicaoEdicaoId, page = 0) => {
    const token = getToken();
    if (!token) {
      return;
    }

    if (!campeonatoId) {
      setPartidas([]);
      setPartidasPage({ number: 0, totalPages: 0, totalElements: 0, size: 8 });
      setPartidaSelecionadaId('');
      return;
    }

    setLoadingPartidas(true);
    try {
      const data = await listPartidas(token, campeonatoId, { page, size: 8, competicaoEdicaoId });
      const itens = data?.content ?? [];
      setPartidas(itens);
      setPartidasPage({
        number: data?.number ?? 0,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        size: data?.size ?? 8,
      });
      setPartidaSelecionadaId((current) => {
        if (current && itens.some((item) => String(item.id) === String(current))) {
          return current;
        }
        return itens[0]?.id ? String(itens[0].id) : '';
      });
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar partidas.');
      }
    } finally {
      setLoadingPartidas(false);
    }
  };

  const carregarPainelPartida = async (partidaId, competicaoEdicaoId, page = 0) => {
    const token = getToken();
    if (!token) {
      return;
    }

    if (!partidaId) {
      setDisputas([]);
      setEstatisticas([]);
      setEstatisticasPage({ number: 0, totalPages: 0, totalElements: 0, size: 8 });
      return;
    }

    setLoadingPainel(true);
    try {
      const [disputasData, estatisticasData] = await Promise.all([
        listDisputas(token, partidaId),
        listEstatisticas(token, { competicaoEdicaoId, page, size: 8 }),
      ]);
      setDisputas(disputasData ?? []);
      setEstatisticas(estatisticasData?.content ?? []);
      setEstatisticasPage({
        number: estatisticasData?.number ?? 0,
        totalPages: estatisticasData?.totalPages ?? 0,
        totalElements: estatisticasData?.totalElements ?? 0,
        size: estatisticasData?.size ?? 8,
      });
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao carregar disputas e estatisticas.');
      }
    } finally {
      setLoadingPainel(false);
    }
  };

  useEffect(() => {
    carregarCampeonatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (campeonatoSelecionadoId) {
      carregarEdicoes(campeonatoSelecionadoId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campeonatoSelecionadoId]);

  useEffect(() => {
    if (campeonatoSelecionadoId) {
      carregarPartidas(campeonatoSelecionadoId, edicaoSelecionadaId || undefined, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campeonatoSelecionadoId, edicaoSelecionadaId]);

  useEffect(() => {
    if (partidaSelecionadaId) {
      carregarPainelPartida(partidaSelecionadaId, edicaoSelecionadaId || undefined, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partidaSelecionadaId, edicaoSelecionadaId]);

  const abrirNovaPartida = () => {
    setModoModalPartida('novo');
    setFormPartida({
      ...emptyPartidaForm,
      competicaoEdicaoId: edicaoSelecionadaId || '',
    });
    setModalPartidaAberto(true);
  };

  const abrirEditarPartida = (partida) => {
    setModoModalPartida('editar');
    setFormPartida({
      id: partida.id,
      data: partida.data ?? '',
      competicaoEdicaoId: partida.competicaoEdicaoId ? String(partida.competicaoEdicaoId) : '',
    });
    setModalPartidaAberto(true);
  };

  const abrirNovaDisputa = () => {
    if (!partidaSelecionadaId) {
      return;
    }
    setModoModalDisputa('novo');
    setFormDisputa(emptyDisputaForm);
    setModalDisputaAberto(true);
  };

  const abrirEditarDisputa = (disputa) => {
    setModoModalDisputa('editar');
    setFormDisputa({
      jogadorId: String(disputa.jogadorId),
      golsPartida: String(disputa.golsPartida ?? 0),
      finalizacoesGolPartida: String(disputa.finalizacoesGolPartida ?? 0),
      faltasCometidasPartida: String(disputa.faltasCometidasPartida ?? 0),
      faltasSofridasPartida: String(disputa.faltasSofridasPartida ?? 0),
      cartoesAmarelosPartida: String(disputa.cartoesAmarelosPartida ?? 0),
      cartoesVermelhosPartida: String(disputa.cartoesVermelhosPartida ?? 0),
      impedimentosPartida: String(disputa.impedimentosPartida ?? 0),
      kmPercorridosPartida: String(disputa.kmPercorridosPartida ?? 0),
      desarmesPartida: String(disputa.desarmesPartida ?? 0),
      passesChavePartida: String(disputa.passesChavePartida ?? 0),
      minutosJogadosPartida: String(disputa.minutosJogadosPartida ?? 0),
      notaPartida: disputa.notaPartida != null ? String(disputa.notaPartida) : '',
      reposicoesPartida: String(disputa.reposicoesPartida ?? 0),
      golsSofridosPartida: String(disputa.golsSofridosPartida ?? 0),
      penaltisDefendidosPartida: String(disputa.penaltisDefendidosPartida ?? 0),
      defesasDificeisPartida: String(disputa.defesasDificeisPartida ?? 0),
      cleanSheetPartida: Boolean(disputa.cleanSheetPartida),
    });
    setModalDisputaAberto(true);
  };

  const handleChangePartida = (e) => {
    const { name, value } = e.target;
    setFormPartida((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeDisputa = (e) => {
    const { name, value, type, checked } = e.target;
    setFormDisputa((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const salvarPartida = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      return;
    }

    const payload = {
      data: formPartida.data,
      competicaoEdicaoId: Number(formPartida.competicaoEdicaoId),
    };

    try {
      if (modoModalPartida === 'novo') {
        await createPartida(token, payload);
      } else {
        await updatePartida(token, formPartida.id, payload);
      }

      await carregarPartidas(campeonatoSelecionadoId, edicaoSelecionadaId || undefined);
      setModalPartidaAberto(false);
      setFormPartida(emptyPartidaForm);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao salvar partida.');
      }
    }
  };

  const removerPartida = async (partida) => {
    if (!window.confirm(`Remover a partida ${partida.id}?`)) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    try {
      await deletePartida(token, partida.id);
      await carregarPartidas(campeonatoSelecionadoId, edicaoSelecionadaId || undefined);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao excluir partida.');
      }
    }
  };

  const toNumberOrZero = (value) => Number(value || 0);

  const salvarDisputa = async (e) => {
    e.preventDefault();

    const token = getToken();
    if (!token || !partidaSelecionadaId) {
      return;
    }

    const payload = {
      jogadorId: Number(formDisputa.jogadorId),
      golsPartida: toNumberOrZero(formDisputa.golsPartida),
      finalizacoesGolPartida: toNumberOrZero(formDisputa.finalizacoesGolPartida),
      faltasCometidasPartida: toNumberOrZero(formDisputa.faltasCometidasPartida),
      faltasSofridasPartida: toNumberOrZero(formDisputa.faltasSofridasPartida),
      cartoesAmarelosPartida: toNumberOrZero(formDisputa.cartoesAmarelosPartida),
      cartoesVermelhosPartida: toNumberOrZero(formDisputa.cartoesVermelhosPartida),
      impedimentosPartida: toNumberOrZero(formDisputa.impedimentosPartida),
      kmPercorridosPartida: Number(formDisputa.kmPercorridosPartida || 0),
      desarmesPartida: toNumberOrZero(formDisputa.desarmesPartida),
      passesChavePartida: toNumberOrZero(formDisputa.passesChavePartida),
      minutosJogadosPartida: toNumberOrZero(formDisputa.minutosJogadosPartida),
      notaPartida: formDisputa.notaPartida === '' ? null : Number(formDisputa.notaPartida),
      reposicoesPartida: toNumberOrZero(formDisputa.reposicoesPartida),
      golsSofridosPartida: toNumberOrZero(formDisputa.golsSofridosPartida),
      penaltisDefendidosPartida: toNumberOrZero(formDisputa.penaltisDefendidosPartida),
      defesasDificeisPartida: toNumberOrZero(formDisputa.defesasDificeisPartida),
      cleanSheetPartida: Boolean(formDisputa.cleanSheetPartida),
    };

    try {
      if (modoModalDisputa === 'novo') {
        await createDisputa(token, partidaSelecionadaId, payload);
      } else {
        await updateDisputa(token, partidaSelecionadaId, payload.jogadorId, payload);
      }

      await carregarPainelPartida(partidaSelecionadaId, edicaoSelecionadaId || undefined, estatisticasPage.number);
      setModalDisputaAberto(false);
      setFormDisputa(emptyDisputaForm);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao salvar disputa.');
      }
    }
  };

  const removerDisputa = async (disputa) => {
    if (!window.confirm(`Remover a disputa do jogador ${disputa.jogadorNome}?`)) {
      return;
    }

    const token = getToken();
    if (!token || !partidaSelecionadaId) {
      return;
    }

    try {
      await deleteDisputa(token, partidaSelecionadaId, disputa.jogadorId);
      await carregarPainelPartida(partidaSelecionadaId, edicaoSelecionadaId || undefined, estatisticasPage.number);
      setError('');
    } catch (err) {
      if (isAuthError(err)) {
        setError('Sessao expirada. Faça login novamente.');
        onSessionExpired?.();
      } else {
        setError(err.message || 'Falha ao excluir disputa.');
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.cardsGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Calendar size={20} color="#3b82f6" />
            <span style={styles.cardTitle}>Partidas carregadas</span>
          </div>
          <h3 style={styles.cardValue}>{partidas.length}</h3>
          <span style={styles.cardHint}>Filtradas pela edição selecionada</span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Shield size={20} color="#10b981" />
            <span style={styles.cardTitle}>Campeonato ativo</span>
          </div>
          <h3 style={styles.cardValue}>{campeonatoSelecionado?.nome || '-'}</h3>
          <span style={styles.cardHint}>{edicaoSelecionada?.temporada || 'Selecione uma edição'}</span>
        </div>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Target size={20} color="#f59e0b" />
            <span style={styles.cardTitle}>Disputas da partida</span>
          </div>
          <h3 style={styles.cardValue}>{disputas.length}</h3>
          <span style={styles.cardHint}>{partidaSelecionada ? `Partida #${partidaSelecionada.id}` : 'Selecione uma partida'}</span>
        </div>
      </div>

      <div style={styles.topBar}>
        <div style={styles.searchBox}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar por id, data ou edição..."
            style={styles.searchInput}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div style={styles.filterGroup}>
          <select
            style={styles.select}
            value={campeonatoSelecionadoId}
            onChange={(e) => setCampeonatoSelecionadoId(e.target.value)}
          >
            <option value="">Selecione um campeonato</option>
            {campeonatos.map((campeonato) => (
              <option key={campeonato.id} value={campeonato.id}>
                {campeonato.nome}
              </option>
            ))}
          </select>

          <select
            style={styles.select}
            value={edicaoSelecionadaId}
            onChange={(e) => setEdicaoSelecionadaId(e.target.value)}
            disabled={!campeonatoSelecionadoId}
          >
            <option value="">Selecione uma edição</option>
            {edicoes.map((edicao) => (
              <option key={edicao.id} value={edicao.id}>
                {edicao.temporada} {edicao.divisao ? `- Div ${edicao.divisao}` : ''}
              </option>
            ))}
          </select>

          <button style={styles.refreshButton} onClick={() => carregarPartidas(campeonatoSelecionadoId, edicaoSelecionadaId || undefined, partidasPage.number)}>
            <RefreshCw size={16} /> Atualizar
          </button>

          <button style={styles.addButton} onClick={abrirNovaPartida} disabled={!edicaoSelecionadaId}>
            <Plus size={18} /> Nova Partida
          </button>
        </div>
      </div>

      {error ? <div style={styles.errorBox}>{error}</div> : null}
      {loadingCampeonatos || loadingPartidas ? <div style={styles.loadingBox}>Carregando partidas...</div> : null}

      <div style={styles.tableContainer}>
        <div style={styles.tableSummary}>
          <span style={styles.paginationInfo}>
            {partidasPage.totalElements > 0 ? `${partidasPage.totalElements} partidas` : '0 partidas'}
          </span>
        </div>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Data</th>
              <th style={styles.th}>Temporada</th>
              <th style={styles.th}>Edição ID</th>
              <th style={styles.th}>Selecionar</th>
              <th style={{ ...styles.th, textAlign: 'center' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {partidasFiltradas.map((partida) => (
              <tr key={partida.id} style={styles.tableRow}>
                <td style={styles.tdBold}>#{partida.id}</td>
                <td style={styles.td}>{partida.data || '-'}</td>
                <td style={styles.td}>{edicaoSelecionada?.temporada || '-'}</td>
                <td style={styles.td}><span style={styles.badge}>{partida.competicaoEdicaoId ?? '-'}</span></td>
                <td style={styles.td}>
                  <button
                    style={String(partida.id) === String(partidaSelecionadaId) ? styles.selectButtonActive : styles.selectButton}
                    onClick={() => setPartidaSelecionadaId(String(partida.id))}
                  >
                    {String(partida.id) === String(partidaSelecionadaId) ? 'Ativa' : 'Abrir'}
                  </button>
                </td>
                <td style={styles.tdActions}>
                  <button style={styles.actionBtn} title="Editar" onClick={() => abrirEditarPartida(partida)}>
                    <Edit size={18} color="#10b981" />
                  </button>
                  <button style={styles.actionBtn} title="Excluir" onClick={() => removerPartida(partida)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </td>
              </tr>
            ))}
            {partidasFiltradas.length === 0 && (
              <tr>
                <td colSpan="6" style={styles.emptyState}>
                  Nenhuma partida encontrada para esta edição.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {partidasPage.totalPages > 1 ? (
        <div style={styles.paginationBar}>
          <button
            style={styles.paginationButton}
            onClick={() => carregarPartidas(campeonatoSelecionadoId, edicaoSelecionadaId || undefined, partidasPage.number - 1)}
            disabled={loadingPartidas || partidasPage.number <= 0}
          >
            Anterior
          </button>
          <span style={styles.paginationText}>
            Página {partidasPage.number + 1} de {partidasPage.totalPages}
          </span>
          <button
            style={styles.paginationButton}
            onClick={() => carregarPartidas(campeonatoSelecionadoId, edicaoSelecionadaId || undefined, partidasPage.number + 1)}
            disabled={loadingPartidas || partidasPage.number >= partidasPage.totalPages - 1}
          >
            Próxima
          </button>
        </div>
      ) : null}

      <div style={styles.dualGrid}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleWrap}>
              <Target size={18} color="#3b82f6" />
              <h3 style={styles.panelTitle}>Disputas</h3>
            </div>
            <button style={styles.addButtonSmall} onClick={abrirNovaDisputa} disabled={!partidaSelecionadaId}>
              <Plus size={16} /> Nova disputa
            </button>
          </div>
          {loadingPainel ? <div style={styles.loadingBox}>Carregando disputas...</div> : null}
          <div style={styles.listWrap}>
            {disputas.map((disputa) => (
              <div key={`${disputa.partidaId}-${disputa.jogadorId}`} style={styles.listCard}>
                <div>
                  <div style={styles.listTitle}>{disputa.jogadorNome}</div>
                  <div style={styles.listMeta}>
                    {disputa.minutosJogadosPartida} min | {disputa.golsPartida} gols | nota {disputa.notaPartida ?? '-'}
                  </div>
                </div>
                <div style={styles.listActions}>
                  <button style={styles.actionBtn} title="Editar" onClick={() => abrirEditarDisputa(disputa)}>
                    <Edit size={18} color="#10b981" />
                  </button>
                  <button style={styles.actionBtn} title="Excluir" onClick={() => removerDisputa(disputa)}>
                    <Trash2 size={18} color="#ef4444" />
                  </button>
                </div>
              </div>
            ))}
            {!loadingPainel && disputas.length === 0 && (
              <div style={styles.emptyStateCard}>Nenhuma disputa cadastrada para a partida selecionada.</div>
            )}
          </div>
        </div>

        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <div style={styles.panelTitleWrap}>
              <BarChart3 size={18} color="#10b981" />
              <h3 style={styles.panelTitle}>Estatísticas agregadas</h3>
            </div>
            <div style={styles.paginationInfo}>
              {estatisticasPage.totalElements > 0 ? `${estatisticasPage.totalElements} registros` : '0 registros'}
            </div>
          </div>
          <div style={styles.listWrap}>
            {estatisticas.map((item) => (
              <div key={item.id} style={styles.listCard}>
                <div>
                  <div style={styles.listTitle}>{item.jogadorNome}</div>
                  <div style={styles.listMeta}>
                    {item.clubeNome} | {item.jogos} jogos | {item.minutos} min | {item.gols} gols | {item.assistencias} ast
                  </div>
                </div>
              </div>
            ))}
            {!loadingPainel && estatisticas.length === 0 && (
              <div style={styles.emptyStateCard}>Nenhuma estatística agregada disponível para a edição selecionada.</div>
            )}
          </div>
          {estatisticasPage.totalPages > 1 ? (
            <div style={styles.paginationBar}>
              <button
                style={styles.paginationButton}
                onClick={() => carregarPainelPartida(partidaSelecionadaId, edicaoSelecionadaId || undefined, estatisticasPage.number - 1)}
                disabled={loadingPainel || estatisticasPage.number <= 0}
              >
                Anterior
              </button>
              <span style={styles.paginationText}>
                Página {estatisticasPage.number + 1} de {estatisticasPage.totalPages}
              </span>
              <button
                style={styles.paginationButton}
                onClick={() => carregarPainelPartida(partidaSelecionadaId, edicaoSelecionadaId || undefined, estatisticasPage.number + 1)}
                disabled={loadingPainel || estatisticasPage.number >= estatisticasPage.totalPages - 1}
              >
                Próxima
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {modalPartidaAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={salvarPartida} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={24} color="#3b82f6" />
                <h3 style={styles.modalTitle}>{modoModalPartida === 'novo' ? 'Nova Partida' : `Editar Partida #${formPartida.id}`}</h3>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setModalPartidaAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Data da partida</label>
                    <input type="date" name="data" required value={formPartida.data} onChange={handleChangePartida} style={styles.inputModal} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.fieldLabel}>Edição</label>
                    <select name="competicaoEdicaoId" required value={formPartida.competicaoEdicaoId} onChange={handleChangePartida} style={styles.inputModal}>
                      <option value="">Selecione uma edição</option>
                      {edicoes.map((edicao) => (
                        <option key={edicao.id} value={edicao.id}>
                          {edicao.temporada} {edicao.divisao ? `- Div ${edicao.divisao}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalPartidaAberto(false)}>
                Cancelar
              </button>
              <button type="submit" style={styles.btnSave}>
                Salvar Partida
              </button>
            </div>
          </form>
        </div>
      )}

      {modalDisputaAberto && (
        <div style={styles.modalOverlay}>
          <form onSubmit={salvarDisputa} style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={24} color="#3b82f6" />
                <h3 style={styles.modalTitle}>{modoModalDisputa === 'novo' ? 'Nova Disputa' : `Editar Disputa do Jogador #${formDisputa.jogadorId}`}</h3>
              </div>
              <button type="button" style={styles.closeBtn} onClick={() => setModalDisputaAberto(false)}>
                <X size={24} color="#94a3b8" />
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGrid}>
                <div style={styles.formFull}>
                  <label style={styles.fieldLabel}>Jogador</label>
                  <select
                    name="jogadorId"
                    required
                    value={formDisputa.jogadorId}
                    onChange={handleChangeDisputa}
                    style={styles.inputModal}
                    disabled={modoModalDisputa === 'editar'}
                  >
                    <option value="">Selecione um jogador</option>
                    {jogadores.map((jogador) => (
                      <option key={jogador.id} value={jogador.id}>
                        {jogador.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {[
                  ['golsPartida', 'Gols'],
                  ['finalizacoesGolPartida', 'Finalizações no gol'],
                  ['faltasCometidasPartida', 'Faltas cometidas'],
                  ['faltasSofridasPartida', 'Faltas sofridas'],
                  ['cartoesAmarelosPartida', 'Amarelos'],
                  ['cartoesVermelhosPartida', 'Vermelhos'],
                  ['impedimentosPartida', 'Impedimentos'],
                  ['desarmesPartida', 'Desarmes'],
                  ['passesChavePartida', 'Passes-chave'],
                  ['minutosJogadosPartida', 'Minutos'],
                  ['reposicoesPartida', 'Reposições'],
                  ['golsSofridosPartida', 'Gols sofridos'],
                  ['penaltisDefendidosPartida', 'Pênaltis defendidos'],
                  ['defesasDificeisPartida', 'Defesas difíceis'],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label style={styles.fieldLabel}>{label}</label>
                    <input type="number" min="0" name={name} value={formDisputa[name]} onChange={handleChangeDisputa} style={styles.inputModal} />
                  </div>
                ))}

                <div>
                  <label style={styles.fieldLabel}>Km percorridos</label>
                  <input type="number" min="0" step="0.01" name="kmPercorridosPartida" value={formDisputa.kmPercorridosPartida} onChange={handleChangeDisputa} style={styles.inputModal} />
                </div>

                <div>
                  <label style={styles.fieldLabel}>Nota</label>
                  <input type="number" min="0" max="10" step="0.1" name="notaPartida" value={formDisputa.notaPartida} onChange={handleChangeDisputa} style={styles.inputModal} />
                </div>

                <div style={styles.formFullCheckbox}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="cleanSheetPartida" checked={formDisputa.cleanSheetPartida} onChange={handleChangeDisputa} />
                    Clean sheet
                  </label>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" style={styles.btnCancel} onClick={() => setModalDisputaAberto(false)}>
                Cancelar
              </button>
              <button type="submit" style={styles.btnSave}>
                Salvar Disputa
              </button>
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
  cardValue: { color: '#fff', fontSize: '22px', margin: '0 0 5px 0', fontWeight: 'bold' },
  cardHint: { color: '#94a3b8', fontSize: '12px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', backgroundColor: '#1e293b', padding: '15px 20px', borderRadius: '12px', border: '1px solid #334155', flexWrap: 'wrap' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', width: '320px', flex: '1 1 320px' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  searchInput: { backgroundColor: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' },
  select: { backgroundColor: '#0f172a', color: '#fff', border: '1px solid #334155', borderRadius: '8px', padding: '10px 12px', minWidth: '220px', outline: 'none' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  addButtonSmall: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' },
  refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' },
  errorBox: { backgroundColor: '#7f1d1d', color: '#fecaca', padding: '12px 14px', borderRadius: '10px', border: '1px solid #ef4444' },
  loadingBox: { backgroundColor: '#0f172a', color: '#94a3b8', padding: '12px 14px', borderRadius: '10px', border: '1px solid #334155' },
  tableContainer: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', overflowX: 'auto' },
  tableSummary: { display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  tableHeader: { borderBottom: '1px solid #334155', textAlign: 'left' },
  th: { color: '#94a3b8', fontSize: '13px', paddingBottom: '15px', fontWeight: 'bold', textTransform: 'uppercase' },
  tableRow: { borderBottom: '1px solid #334155' },
  td: { padding: '15px 0', color: '#cbd5e1', fontSize: '14px' },
  tdBold: { padding: '15px 0', color: '#fff', fontSize: '14px', fontWeight: 'bold' },
  badge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '13px', fontWeight: 'bold' },
  selectButton: { backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' },
  selectButtonActive: { backgroundColor: '#1d4ed8', color: '#fff', border: '1px solid #3b82f6', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' },
  tdActions: { padding: '15px 0', display: 'flex', gap: '10px', justifyContent: 'center' },
  actionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  emptyState: { textAlign: 'center', padding: '30px', color: '#94a3b8' },
  dualGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' },
  panel: { backgroundColor: '#1e293b', borderRadius: '12px', padding: '20px', border: '1px solid #334155', minHeight: '220px' },
  panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  panelTitleWrap: { display: 'flex', alignItems: 'center', gap: '10px' },
  panelTitle: { margin: 0, color: '#fff', fontSize: '18px' },
  listWrap: { display: 'flex', flexDirection: 'column', gap: '12px' },
  listCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '14px' },
  listTitle: { color: '#fff', fontWeight: 'bold', marginBottom: '4px' },
  listMeta: { color: '#94a3b8', fontSize: '13px' },
  listActions: { display: 'flex', gap: '8px' },
  emptyStateCard: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '18px', color: '#94a3b8', textAlign: 'center' },
  paginationInfo: { color: '#94a3b8', fontSize: '12px' },
  paginationBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #334155' },
  paginationButton: { backgroundColor: 'transparent', color: '#cbd5e1', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer' },
  paginationText: { color: '#94a3b8', fontSize: '13px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#1e293b', padding: '0', borderRadius: '12px', width: '100%', maxWidth: '860px', border: '1px solid #334155', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #334155' },
  modalTitle: { color: '#fff', margin: 0, fontSize: '20px', fontWeight: 'bold' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex' },
  modalBody: { padding: '25px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '15px' },
  formFull: { gridColumn: '1 / -1' },
  formFullCheckbox: { gridColumn: '1 / -1' },
  fieldLabel: { color: '#cbd5e1', fontSize: '13px', display: 'block', marginBottom: '6px' },
  inputModal: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', outline: 'none', boxSizing: 'border-box', fontSize: '14px' },
  checkboxLabel: { color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '20px', borderTop: '1px solid #334155' },
  btnCancel: { padding: '10px 20px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '10px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: '#ffffff', cursor: 'pointer', fontWeight: 'bold' },
};

export default EstatisticasPartida;
