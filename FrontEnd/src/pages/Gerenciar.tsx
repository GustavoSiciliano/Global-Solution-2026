import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { javaApi } from "../services/api";
import { useAppContext } from "../context/AppContext";
import type { Usuario, FonteSatelital, Regiao } from "../types";
import { LoadingSpinner } from "../components/Ui";

type Aba = "usuarios" | "regioes" | "vinculos" | "fontes";

interface FormUsuario {
  nmUsuario: string;
  dsEmail: string;
  dsSenha: string;
  dsPerfil: "ADMIN" | "PRODUTOR" | "GESTOR";
}
interface FormRegiao {
  cidade: string;
  estado: string;
}
interface FormEditRegiao {
  nmRegiao: string;
  dsEstado: string;
  dsBioma: string;
}

const FORM_U: FormUsuario = {
  nmUsuario: "",
  dsEmail: "",
  dsSenha: "",
  dsPerfil: "PRODUTOR",
};

function Btn({
  onClick,
  disabled,
  variant = "primary",
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  children: ReactNode;
}) {
  const cls = {
    primary: "bg-accent text-white hover:bg-accent-hi",
    secondary: "border border-border text-muted hover:text-text bg-surface",
    danger: "text-red-600 hover:text-red-700 hover:bg-red-50",
    ghost:
      "text-accent border border-accent/30 bg-accent-bg hover:bg-accent/10",
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-text block mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = (err?: string) =>
  `w-full text-sm border rounded-lg px-3 py-2.5 bg-surface text-text placeholder:text-dim outline-none transition-colors ${
    err
      ? "border-red-300 bg-red-50 focus:border-red-400"
      : "border-border focus:border-accent"
  }`;

export default function Gerenciar() {
  const { showModal } = useAppContext();
  const [aba, setAba] = useState<Aba>("usuarios");

  // ── Usuários ─────────────────────────────────────────────────────────────
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadU, setLoadU] = useState(true);
  const [formU, setFormU] = useState<FormUsuario>(FORM_U);
  const [errosU, setErrosU] = useState<Partial<FormUsuario>>({});
  const [editIdU, setEditIdU] = useState<number | null>(null);
  const [savingU, setSavingU] = useState(false);

  // ── Regiões ───────────────────────────────────────────────────────────────
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loadR, setLoadR] = useState(true);
  const [formR, setFormR] = useState<FormRegiao>({ cidade: "", estado: "" });
  const [editR, setEditR] = useState<{
    id: number;
    form: FormEditRegiao;
  } | null>(null);
  const [adicionando, setAdic] = useState(false);
  const [savingR, setSavingR] = useState(false);

  // ── Vínculos ────────────────────────────────────────────────────────────────
  const [vinUsuario, setVinUsuario] = useState("");
  const [vinRegiao, setVinRegiao] = useState("");
  const [vinculando, setVinculando] = useState(false);

  // ── Fontes ────────────────────────────────────────────────────────────────
  const [fontes, setFontes] = useState<FonteSatelital[]>([]);
  const [loadF, setLoadF] = useState(true);

  useEffect(() => {
    javaApi.getUsuarios().then((u) => {
      setUsuarios(u);
      setLoadU(false);
    });
    javaApi.getRegioes().then((r) => {
      setRegioes(r);
      setLoadR(false);
    });
    javaApi.getFontes().then((f) => {
      setFontes(f);
      setLoadF(false);
    });
  }, []);

  // ── CRUD Usuários ─────────────────────────────────────────────────────────
  const validarU = (): boolean => {
    const e: Partial<FormUsuario> = {};
    if (!formU.nmUsuario.trim()) e.nmUsuario = "Obrigatório";
    if (!formU.dsEmail.trim()) e.dsEmail = "Obrigatório";
    if (!editIdU && !formU.dsSenha.trim()) e.dsSenha = "Obrigatório";
    setErrosU(e);
    return !Object.keys(e).length;
  };

  const handleSalvarU = async () => {
    if (!validarU()) return;
    setSavingU(true);
    try {
      if (editIdU) {
        // PUT /usuarios/{id} → TB_USUARIO
        const u = await javaApi.atualizarUsuario(editIdU, {
          nmUsuario: formU.nmUsuario,
          dsEmail: formU.dsEmail,
          dsPerfil: formU.dsPerfil,
        });
        setUsuarios((prev) =>
          prev.map((x) => (x.id_usuario === editIdU ? u : x)),
        );
        showModal({
          tipo: "sucesso",
          titulo: "Usuário atualizado",
          mensagem: `${u.nm_usuario} atualizado com sucesso.`,
        });
      } else {
        // POST /usuarios → TB_USUARIO
        const u = await javaApi.criarUsuario(formU);
        setUsuarios((prev) => [u, ...prev]);
        showModal({
          tipo: "sucesso",
          titulo: "Usuário criado",
          mensagem: `${u.nm_usuario} cadastrado com sucesso.`,
        });
      }
      setFormU(FORM_U);
      setEditIdU(null);
      setErrosU({});
    } catch (e: any) {
      const msg =
        e?.message?.includes("409") || e?.message?.includes("email")
          ? "E-mail já cadastrado no banco de dados."
          : (e?.message ?? "Erro ao salvar usuário.");
      showModal({ tipo: "erro", titulo: "Erro ao salvar", mensagem: msg });
    } finally {
      setSavingU(false);
    }
  };

  const handleDeletarU = (u: Usuario) => {
    showModal({
      tipo: "aviso",
      titulo: `Deletar ${u.nm_usuario}?`,
      mensagem:
        "Vínculos com regiões também serão removidos. Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          // DELETE /usuarios/{id} → TB_USUARIO
          await javaApi.deletarUsuario(u.id_usuario);
          setUsuarios((prev) =>
            prev.filter((x) => x.id_usuario !== u.id_usuario),
          );
          showModal({
            tipo: "sucesso",
            titulo: "Removido com sucesso",
            mensagem: `${u.nm_usuario} removido do banco Oracle.`,
          });
        } catch {
          showModal({
            tipo: "erro",
            titulo: "Erro",
            mensagem:
              "Não foi possível remover. O usuário pode ter registros vinculados.",
          });
        }
      },
    });
  };

  // ── CRUD Regiões ──────────────────────────────────────────────────────────
  const handleNovaRegiao = async () => {
    if (!formR.cidade.trim() || !formR.estado.trim()) return;
    setAdic(true);
    try {
      // POST /regioes/buscar-por-cidade → TB_REGIAO (coords automáticas)
      await javaApi.criarRegiao(
        formR.cidade.trim(),
        formR.estado.trim().toUpperCase(),
      );
      const regs = await javaApi.getRegioes();
      setRegioes(regs);
      setFormR({ cidade: "", estado: "" });
      showModal({
        tipo: "sucesso",
        titulo: "Região adicionada",
        mensagem: `${formR.cidade} cadastrada com coordenadas automáticas.`,
      });
    } catch (e: any) {
      const msg = e?.message?.includes("404")
        ? "Cidade não encontrada. Verifique o nome e o estado."
        : e?.message?.includes("409") || e?.message?.includes("unique")
          ? "Esta região já está cadastrada no banco."
          : "Erro de conexão. Verifique se o Render está online.";
      showModal({ tipo: "erro", titulo: "Erro ao adicionar", mensagem: msg });
    } finally {
      setAdic(false);
    }
  };

  const handleSalvarEditRegiao = async () => {
    if (!editR) return;
    setSavingR(true);
    try {
      // PUT /regioes/{id} → TB_REGIAO
      await javaApi.atualizarRegiao(editR.id, {
        nmRegiao: editR.form.nmRegiao,
        dsEstado: editR.form.dsEstado.toUpperCase(),
        dsBioma: editR.form.dsBioma,
      });
      const regs = await javaApi.getRegioes();
      setRegioes(regs);
      setEditR(null);
      showModal({
        tipo: "sucesso",
        titulo: "Região atualizada",
        mensagem: `${editR.form.nmRegiao} atualizada no Oracle.`,
      });
    } catch {
      showModal({
        tipo: "erro",
        titulo: "Erro",
        mensagem: "Não foi possível atualizar a região.",
      });
    } finally {
      setSavingR(false);
    }
  };

  const handleDeletarRegiao = (r: Regiao) => {
    showModal({
      tipo: "aviso",
      titulo: `Remover ${r.nm_regiao}?`,
      mensagem:
        "Leituras, previsões e alertas vinculados também serão removidos. Esta ação não pode ser desfeita.",
      onConfirm: async () => {
        try {
          // DELETE /regioes/{id} → TB_REGIAO (cascata)
          await javaApi.deletarRegiao(r.id_regiao);
          setRegioes((prev) => prev.filter((x) => x.id_regiao !== r.id_regiao));
          showModal({
            tipo: "sucesso",
            titulo: "Removida",
            mensagem: `${r.nm_regiao} removida com sucesso.`,
          });
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

  return (
    <div className="bg-gerenciar pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <h1 className="text-lg font-semibold text-text mb-1">Gerenciar</h1>
        <p className="text-sm text-muted mb-6">
          Todas as operações salvam diretamente no banco Oracle FIAP.
        </p>

        {/* Abas */}
        <div className="flex gap-0 border-b border-border mb-6">
          {(
            [
              { id: "usuarios", label: "Usuários" },
              { id: "regioes", label: "Regiões" },
              { id: "vinculos", label: "Vínculos" },
              { id: "fontes", label: "Fontes Satelitais" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setAba(t.id)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px flex flex-col items-start gap-0.5 ${
                aba === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── USUÁRIOS ─────────────────────────────────────────────────────── */}
        {aba === "usuarios" && (
          <div className="space-y-5">
            {/* Formulário POST/PUT */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-4">
                {editIdU ? "Atualizar usuário" : "Novo usuário"}
                {editIdU && (
                  <span className="text-xs font-normal text-muted ml-2">
                    ID #{editIdU}
                  </span>
                )}
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <Field label="Nome" required error={errosU.nmUsuario}>
                  <input
                    value={formU.nmUsuario}
                    onChange={(e) =>
                      setFormU((p) => ({ ...p, nmUsuario: e.target.value }))
                    }
                    placeholder="Nome completo"
                    className={inputCls(errosU.nmUsuario)}
                  />
                </Field>
                <Field label="E-mail" required error={errosU.dsEmail}>
                  <input
                    value={formU.dsEmail}
                    type="email"
                    onChange={(e) =>
                      setFormU((p) => ({ ...p, dsEmail: e.target.value }))
                    }
                    placeholder="email@exemplo.com"
                    className={inputCls(errosU.dsEmail)}
                  />
                </Field>
                {!editIdU && (
                  <Field label="Senha" required error={errosU.dsSenha}>
                    <input
                      value={formU.dsSenha}
                      type="password"
                      onChange={(e) =>
                        setFormU((p) => ({ ...p, dsSenha: e.target.value }))
                      }
                      placeholder="Mínimo 6 caracteres"
                      className={inputCls(errosU.dsSenha)}
                    />
                  </Field>
                )}
                <Field label="Perfil">
                  <select
                    value={formU.dsPerfil}
                    onChange={(e) =>
                      setFormU((p) => ({
                        ...p,
                        dsPerfil: e.target.value as
                          | "ADMIN"
                          | "PRODUTOR"
                          | "GESTOR",
                      }))
                    }
                    className={inputCls()}
                  >
                    <option value="PRODUTOR">PRODUTOR</option>
                    <option value="GESTOR">GESTOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </Field>
              </div>
              <div className="flex gap-2">
                <Btn
                  onClick={handleSalvarU}
                  disabled={savingU}
                  variant="primary"
                >
                  {savingU ? "Salvando..." : editIdU ? "Atualizar" : "Salvar"}
                </Btn>
                {editIdU && (
                  <Btn
                    onClick={() => {
                      setFormU(FORM_U);
                      setEditIdU(null);
                      setErrosU({});
                    }}
                    variant="secondary"
                  >
                    Cancelar
                  </Btn>
                )}
              </div>
            </div>

            {/* Lista */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-surface2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted">
                  Usuários cadastrados
                </p>
                <span className="text-xs font-mono text-dim">
                  {usuarios.length} registros
                </span>
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
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text truncate">
                          {u.nm_usuario}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {u.ds_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-accent border border-accent/30 bg-accent-bg px-2 py-0.5 rounded-md font-medium">
                          {u.ds_perfil}
                        </span>
                        <span className="text-xs font-mono text-dim">
                          #{u.id_usuario}
                        </span>
                        <Btn
                          onClick={() => {
                            setFormU({
                              nmUsuario: u.nm_usuario,
                              dsEmail: u.ds_email,
                              dsSenha: "",
                              dsPerfil: u.ds_perfil,
                            });
                            setEditIdU(u.id_usuario);
                            setErrosU({});
                          }}
                          variant="ghost"
                        >
                          Editar
                        </Btn>
                        <Btn onClick={() => handleDeletarU(u)} variant="danger">
                          Deletar
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REGIÕES ──────────────────────────────────────────────────────── */}
        {aba === "regioes" && (
          <div className="space-y-5">
            {/* POST nova região */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-1">
                Adicionar região
              </p>
              <p className="text-xs text-muted mb-4">
                Informe cidade e estado — coordenadas e bioma são buscados
                automaticamente via Nominatim e INPE.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={formR.cidade}
                  onChange={(e) =>
                    setFormR((p) => ({ ...p, cidade: e.target.value }))
                  }
                  placeholder="Cidade (ex: Cuiabá)"
                  className="flex-1 text-sm border border-border rounded-lg px-3 py-2.5 bg-surface text-text placeholder:text-dim outline-none focus:border-accent transition-colors"
                />
                <input
                  value={formR.estado}
                  onChange={(e) =>
                    setFormR((p) => ({
                      ...p,
                      estado: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="UF"
                  maxLength={2}
                  className="w-16 text-sm border border-border rounded-lg px-3 py-2.5 bg-surface text-text placeholder:text-dim outline-none focus:border-accent transition-colors text-center"
                />
                <Btn
                  onClick={handleNovaRegiao}
                  disabled={adicionando || !formR.cidade || !formR.estado}
                  variant="primary"
                >
                  {adicionando ? "Buscando..." : "Adicionar"}
                </Btn>
              </div>
            </div>

            {/* PUT editar região */}
            {editR && (
              <div className="bg-accent-bg border border-accent/20 rounded-xl p-5">
                <p className="text-sm font-semibold text-text mb-4">
                  Editando região #{editR.id}
                </p>
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  <Field label="Nome">
                    <input
                      value={editR.form.nmRegiao}
                      onChange={(e) =>
                        setEditR((p) =>
                          p
                            ? {
                                ...p,
                                form: { ...p.form, nmRegiao: e.target.value },
                              }
                            : null,
                        )
                      }
                      className={inputCls()}
                    />
                  </Field>
                  <Field label="Estado (UF)">
                    <input
                      value={editR.form.dsEstado}
                      maxLength={2}
                      onChange={(e) =>
                        setEditR((p) =>
                          p
                            ? {
                                ...p,
                                form: {
                                  ...p.form,
                                  dsEstado: e.target.value.toUpperCase(),
                                },
                              }
                            : null,
                        )
                      }
                      className={inputCls()}
                    />
                  </Field>
                  <Field label="Bioma">
                    <input
                      value={editR.form.dsBioma}
                      onChange={(e) =>
                        setEditR((p) =>
                          p
                            ? {
                                ...p,
                                form: { ...p.form, dsBioma: e.target.value },
                              }
                            : null,
                        )
                      }
                      className={inputCls()}
                    />
                  </Field>
                </div>
                <div className="flex gap-2">
                  <Btn
                    onClick={handleSalvarEditRegiao}
                    disabled={savingR}
                    variant="primary"
                  >
                    {savingR ? "Salvando..." : "Atualizar"}
                  </Btn>
                  <Btn onClick={() => setEditR(null)} variant="secondary">
                    Cancelar
                  </Btn>
                </div>
              </div>
            )}

            {/* Lista */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-surface2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted">
                  Regiões monitoradas
                </p>
                <span className="text-xs font-mono text-dim">
                  {regioes.length} registros
                </span>
              </div>
              {loadR ? (
                <LoadingSpinner />
              ) : regioes.length === 0 ? (
                <p className="text-sm text-muted text-center py-8">
                  Nenhuma região encontrada.
                </p>
              ) : (
                <div className="divide-y divide-border">
                  {regioes.map((r) => (
                    <div
                      key={r.id_regiao}
                      className="flex items-center justify-between px-5 py-3 hover:bg-surface2 transition-colors gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text">
                          {r.nm_regiao}
                        </p>
                        <p className="text-xs text-muted font-mono">
                          {r.ds_estado} · {r.ds_bioma} ·{" "}
                          {r.nr_latitude.toFixed(4)},{" "}
                          {r.nr_longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-dim">
                          #{r.id_regiao}
                        </span>
                        <Btn
                          onClick={() =>
                            setEditR({
                              id: r.id_regiao,
                              form: {
                                nmRegiao: r.nm_regiao,
                                dsEstado: r.ds_estado,
                                dsBioma: r.ds_bioma,
                              },
                            })
                          }
                          variant="ghost"
                        >
                          Editar
                        </Btn>
                        <Btn
                          onClick={() => handleDeletarRegiao(r)}
                          variant="danger"
                        >
                          Remover
                        </Btn>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── VÍNCULOS REGIÃO-USUÁRIO ─────────────────────────────────────── */}
        {aba === "vinculos" && (
          <div className="space-y-5">
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-1">
                Vincular região a usuário
              </p>
              <p className="text-xs text-muted mb-4">
                Um usuário pode monitorar múltiplas regiões. Selecione e vincule
                abaixo.
              </p>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-text block mb-1.5">
                    Usuário
                  </label>
                  <select
                    value={vinUsuario}
                    onChange={(e) => setVinUsuario(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-surface text-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Selecione um usuário</option>
                    {usuarios.map((u) => (
                      <option key={u.id_usuario} value={u.id_usuario}>
                        {u.nm_usuario} — {u.ds_perfil}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-text block mb-1.5">
                    Região
                  </label>
                  <select
                    value={vinRegiao}
                    onChange={(e) => setVinRegiao(e.target.value)}
                    className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-surface text-text outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Selecione uma região</option>
                    {regioes.map((r) => (
                      <option key={r.id_regiao} value={r.id_regiao}>
                        {r.nm_regiao} / {r.ds_estado}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Btn
                    variant="primary"
                    disabled={vinculando}
                    onClick={async () => {
                      if (!vinUsuario || !vinRegiao)
                        return showModal({
                          tipo: "aviso",
                          titulo: "Atenção",
                          mensagem: "Selecione usuário e região.",
                        });
                      setVinculando(true);
                      try {
                        // POST /regioes-usuarios → TB_REGIAO_USUARIO
                        await javaApi.vincular(
                          parseInt(vinRegiao),
                          parseInt(vinUsuario),
                        );
                        setVinUsuario("");
                        setVinRegiao("");
                        showModal({
                          tipo: "sucesso",
                          titulo: "Vínculo criado",
                          mensagem: "Região vinculada ao usuário com sucesso.",
                        });
                      } catch {
                        showModal({
                          tipo: "erro",
                          titulo: "Erro",
                          mensagem:
                            "Não foi possível vincular. O vínculo pode já existir.",
                        });
                      } finally {
                        setVinculando(false);
                      }
                    }}
                  >
                    {vinculando ? "Vinculando..." : "Vincular"}
                  </Btn>
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-4">
                Usuários e regiões
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {usuarios.map((u) => (
                  <div
                    key={u.id_usuario}
                    className="border border-border rounded-lg p-3 bg-surface2"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-dim">
                        #{u.id_usuario}
                      </span>
                      <p className="text-sm font-medium text-text">
                        {u.nm_usuario}
                      </p>
                      <span className="text-[10px] text-accent border border-accent/30 bg-accent-bg px-1.5 py-0.5 rounded font-medium ml-auto">
                        {u.ds_perfil}
                      </span>
                    </div>
                    <p className="text-xs text-muted">{u.ds_email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FONTES SATELITAIS ─────────────────────────────────────────────── */}
        {aba === "fontes" && (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-border bg-surface2 flex items-center justify-between">
              <p className="text-xs font-medium text-muted">
                Fontes de dados satelitais
              </p>
              <span className="text-xs font-mono text-dim">
                {fontes.length} registros
              </span>
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
                          <span className="text-xs font-mono text-dim">
                            #{f.id_fonte}
                          </span>
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
      </div>
    </div>
  );
}
