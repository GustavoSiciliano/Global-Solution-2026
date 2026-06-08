import { useState, useEffect } from "react";
import { javaApi } from "../services/api";
import { useAppContext } from "../context/AppContext";
import type { Usuario, FonteSatelital, Regiao } from "../types";
import { LoadingSpinner } from "../components/Ui";

type Aba = "usuarios" | "fontes" | "regioes";

interface FormUsuario {
  nmUsuario: string;
  dsEmail: string;
  dsSenha: string;
  dsPerfil: "ADMIN" | "PRODUTOR" | "GESTOR";
}

const FORM_VAZIO: FormUsuario = {
  nmUsuario: "",
  dsEmail: "",
  dsSenha: "",
  dsPerfil: "PRODUTOR",
};

export default function Gerenciar() {
  const { showModal } = useAppContext();
  const [aba, setAba] = useState<Aba>("usuarios");

  // ── Usuários ──────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadU, setLoadU] = useState(true);
  const [formU, setFormU] = useState<FormUsuario>(FORM_VAZIO);
  const [editId, setEditId] = useState<number | null>(null);
  const [savingU, setSavingU] = useState(false);

  // ── Fontes ────────────────────────────────────────────────────────────────
  const [fontes, setFontes] = useState<FonteSatelital[]>([]);
  const [loadF, setLoadF] = useState(true);

  // ── Regiões ───────────────────────────────────────────────────────────────
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loadR, setLoadR] = useState(true);
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    javaApi.getUsuarios().then((u) => {
      setUsuarios(u);
      setLoadU(false);
    });
    javaApi.getFontes().then((f) => {
      setFontes(f);
      setLoadF(false);
    });
    javaApi.getRegioes().then((r) => {
      setRegioes(r);
      setLoadR(false);
    });
  }, []);

  // ── CRUD Usuários ─────────────────────────────────────────────────────────
  const handleSalvarUsuario = async () => {
    if (!formU.nmUsuario || !formU.dsEmail) return;
    setSavingU(true);
    try {
      if (editId) {
        // PUT /usuarios/{id}
        const u = await javaApi.atualizarUsuario(editId, {
          nmUsuario: formU.nmUsuario,
          dsEmail: formU.dsEmail,
          dsPerfil: formU.dsPerfil,
        });
        setUsuarios((prev) =>
          prev.map((x) => (x.id_usuario === editId ? u : x)),
        );
        showModal({
          tipo: "sucesso",
          titulo: "Usuário atualizado",
          mensagem: `${u.nm_usuario} atualizado com sucesso.`,
        });
      } else {
        // POST /usuarios
        const u = await javaApi.criarUsuario(formU);
        setUsuarios((prev) => [u, ...prev]);
        showModal({
          tipo: "sucesso",
          titulo: "Usuário criado",
          mensagem: `${u.nm_usuario} cadastrado com sucesso.`,
        });
      }
      setFormU(FORM_VAZIO);
      setEditId(null);
    } catch (e: any) {
      showModal({
        tipo: "erro",
        titulo: "Erro",
        mensagem: e?.message ?? "Erro ao salvar usuário.",
      });
    } finally {
      setSavingU(false);
    }
  };

  const handleEditarUsuario = (u: Usuario) => {
    setFormU({
      nmUsuario: u.nm_usuario,
      dsEmail: u.ds_email,
      dsSenha: "",
      dsPerfil: u.ds_perfil,
    });
    setEditId(u.id_usuario);
  };

  const handleDeletarUsuario = (u: Usuario) => {
    showModal({
      tipo: "aviso",
      titulo: `Deletar ${u.nm_usuario}?`,
      mensagem: "Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          // DELETE /usuarios/{id}
          await javaApi.deletarUsuario(u.id_usuario);
          setUsuarios((prev) =>
            prev.filter((x) => x.id_usuario !== u.id_usuario),
          );
        } catch {
          showModal({
            tipo: "erro",
            titulo: "Erro",
            mensagem: "Não foi possível deletar o usuário.",
          });
        }
      },
    });
  };

  // ── POST Nova Região ──────────────────────────────────────────────────────
  const handleNovaRegiao = async () => {
    if (!cidade || !estado) return;
    setAdicionando(true);
    try {
      // POST /regioes/buscar-por-cidade — coordenadas automáticas
      await javaApi.criarRegiao(cidade.trim(), estado.trim().toUpperCase());
      const regs = await javaApi.getRegioes();
      setRegioes(regs);
      setCidade("");
      setEstado("");
      showModal({
        tipo: "sucesso",
        titulo: "Região adicionada",
        mensagem: `${cidade} cadastrada com coordenadas automáticas.`,
      });
    } catch (e: any) {
      showModal({
        tipo: "erro",
        titulo: "Erro",
        mensagem: e?.message ?? "Cidade não encontrada ou erro de conexão.",
      });
    } finally {
      setAdicionando(false);
    }
  };

  // ── DELETE Região ─────────────────────────────────────────────────────────
  const handleDeletarRegiao = (r: Regiao) => {
    showModal({
      tipo: "aviso",
      titulo: `Remover ${r.nm_regiao}?`,
      mensagem:
        "Leituras, previsões e alertas vinculados também serão removidos.",
      onConfirm: async () => {
        try {
          await javaApi.deletarRegiao(r.id_regiao);
          setRegioes((prev) => prev.filter((x) => x.id_regiao !== r.id_regiao));
        } catch {
          showModal({
            tipo: "erro",
            titulo: "Erro",
            mensagem: "Não foi possível remover a região.",
          });
        }
      },
    });
  };

  const perfisOpts: Array<"ADMIN" | "PRODUTOR" | "GESTOR"> = [
    "ADMIN",
    "PRODUTOR",
    "GESTOR",
  ];

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-lg font-semibold text-text mb-1">Gerenciar</h1>
        <p className="text-sm text-muted mb-6">
          Administração de usuários, fontes satelitais e regiões monitoradas.
        </p>

        {/* Abas */}
        <div className="flex gap-1 border-b border-border mb-6">
          {(
            [
              { id: "usuarios", label: "Usuários" },
              { id: "fontes", label: "Fontes Satelitais" },
              { id: "regioes", label: "Regiões" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
                aba === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── ABA USUÁRIOS ────────────────────────────────────────────────── */}
        {aba === "usuarios" && (
          <div className="space-y-5">
            {/* Formulário POST/PUT */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-4">
                {editId ? "Atualizar usuário" : "Novo usuário"}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-muted block mb-1">Nome</label>
                  <input
                    value={formU.nmUsuario}
                    onChange={(e) =>
                      setFormU((p) => ({ ...p, nmUsuario: e.target.value }))
                    }
                    placeholder="Nome completo"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text placeholder-dim outline-none focus:border-accent transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">
                    E-mail
                  </label>
                  <input
                    value={formU.dsEmail}
                    onChange={(e) =>
                      setFormU((p) => ({ ...p, dsEmail: e.target.value }))
                    }
                    placeholder="email@exemplo.com"
                    type="email"
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text placeholder-dim outline-none focus:border-accent transition-colors"
                  />
                </div>
                {!editId && (
                  <div>
                    <label className="text-xs text-muted block mb-1">
                      Senha
                    </label>
                    <input
                      value={formU.dsSenha}
                      onChange={(e) =>
                        setFormU((p) => ({ ...p, dsSenha: e.target.value }))
                      }
                      placeholder="Mínimo 6 caracteres"
                      type="password"
                      className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text placeholder-dim outline-none focus:border-accent transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted block mb-1">
                    Perfil
                  </label>
                  <select
                    value={formU.dsPerfil}
                    onChange={(e) =>
                      setFormU((p) => ({
                        ...p,
                        dsPerfil: e.target.value as any,
                      }))
                    }
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text outline-none focus:border-accent transition-colors"
                  >
                    {perfisOpts.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSalvarUsuario}
                  disabled={savingU || !formU.nmUsuario || !formU.dsEmail}
                  className="text-sm font-medium text-white bg-accent px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {savingU
                    ? "Salvando…"
                    : editId
                      ? "Atualizar"
                      : "Criar usuário"}
                </button>
                {editId && (
                  <button
                    onClick={() => {
                      setFormU(FORM_VAZIO);
                      setEditId(null);
                    }}
                    className="text-sm text-muted border border-border px-4 py-2 rounded-lg hover:text-text transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de usuários */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-surface2">
                <p className="text-xs font-medium text-muted">
                  Usuários cadastrados
                </p>
              </div>
              {loadU ? (
                <LoadingSpinner />
              ) : usuarios.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  Nenhum usuário encontrado.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {usuarios.map((u) => (
                    <div
                      key={u.id_usuario}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">
                          {u.nm_usuario}
                        </p>
                        <p className="text-xs text-muted">{u.ds_email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-accent border border-accent/30 bg-accent-bg px-2 py-0.5 rounded-md font-medium">
                          {u.ds_perfil}
                        </span>
                        <button
                          onClick={() => handleEditarUsuario(u)}
                          className="text-xs text-muted hover:text-accent transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletarUsuario(u)}
                          className="text-xs text-muted hover:text-red-600 transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ABA FONTES SATELITAIS ────────────────────────────────────────── */}
        {aba === "fontes" && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface2">
              <p className="text-xs font-medium text-muted">
                Fontes de dados satelitais
              </p>
            </div>
            {loadF ? (
              <LoadingSpinner />
            ) : fontes.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">
                Nenhuma fonte cadastrada.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {fontes.map((f) => (
                  <div
                    key={f.id_fonte}
                    className="px-5 py-4 hover:bg-surface2 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-text">
                            {f.nm_fonte}
                          </p>
                          <span className="text-[10px] font-mono text-accent border border-accent/30 bg-accent-bg px-1.5 py-0.5 rounded">
                            {f.ds_tipo_dado}
                          </span>
                        </div>
                        <p className="text-xs text-muted">{f.ds_descricao}</p>
                      </div>
                      <a
                        href={f.ds_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted hover:text-accent transition-colors shrink-0"
                      >
                        URL ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ABA REGIÕES ──────────────────────────────────────────────────── */}
        {aba === "regioes" && (
          <div className="space-y-5">
            {/* Formulário nova região — POST /regioes/buscar-por-cidade */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-1">
                Adicionar região
              </p>
              <p className="text-xs text-muted mb-4">
                Informe cidade e estado — coordenadas e bioma são buscados
                automaticamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  placeholder="Cidade (ex: Cuiabá)"
                  className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text placeholder-dim outline-none focus:border-accent transition-colors"
                />
                <input
                  value={estado}
                  onChange={(e) => setEstado(e.target.value.toUpperCase())}
                  maxLength={2}
                  placeholder="UF"
                  className="w-16 text-sm border border-border rounded-lg px-3 py-2 bg-surface text-text placeholder-dim outline-none focus:border-accent transition-colors text-center"
                />
                <button
                  onClick={handleNovaRegiao}
                  disabled={adicionando || !cidade || !estado}
                  className="text-sm font-medium text-white bg-accent px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {adicionando ? "Buscando…" : "Adicionar"}
                </button>
              </div>
            </div>

            {/* Lista de regiões */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-surface2">
                <p className="text-xs font-medium text-muted">
                  Regiões monitoradas
                </p>
              </div>
              {loadR ? (
                <LoadingSpinner />
              ) : regioes.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  Nenhuma região cadastrada.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {regioes.map((r) => (
                    <div
                      key={r.id_regiao}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-text">
                          {r.nm_regiao}
                        </p>
                        <p className="text-xs text-muted font-mono">
                          {r.ds_estado} · {r.ds_bioma} ·{" "}
                          {r.nr_latitude.toFixed(4)},{" "}
                          {r.nr_longitude.toFixed(4)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletarRegiao(r)}
                        className="text-xs text-muted hover:text-red-600 transition-colors shrink-0"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
