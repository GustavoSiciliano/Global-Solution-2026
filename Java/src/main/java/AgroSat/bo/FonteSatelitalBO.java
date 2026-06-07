package AgroSat.bo;

import AgroSat.dao.FonteSatelitalDAO;
import AgroSat.excecao.Excecao;
import AgroSat.vo.FonteSatelital;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class FonteSatelitalBO {

    @Inject
    FonteSatelitalDAO dao;

    public List<FonteSatelital> listarTodas() {
        return dao.listarTodas();
    }

    public FonteSatelital buscarPorId(Long id) {
        FonteSatelital f = dao.buscarPorId(id);
        if (f == null) throw new Excecao("Fonte satelital nao encontrada: " + id, 404);
        return f;
    }

    public FonteSatelital inserir(FonteSatelital f) {
        validar(f);
        return dao.inserir(f);
    }

    public FonteSatelital atualizar(Long id, FonteSatelital f) {
        buscarPorId(id);
        validar(f);
        FonteSatelital atualizada = dao.atualizar(id, f);
        if (atualizada == null) throw new Excecao("Erro ao atualizar fonte", 500);
        return atualizada;
    }

    public void deletar(Long id) {
        buscarPorId(id);
        if (!dao.deletar(id)) throw new Excecao("Erro ao deletar fonte", 500);
    }

    private void validar(FonteSatelital f) {
        if (f.getNmFonte() == null || f.getNmFonte().isBlank())
            throw new Excecao("Nome da fonte e obrigatorio", 400);
        if (f.getDsUrl() == null || f.getDsUrl().isBlank())
            throw new Excecao("URL e obrigatoria", 400);
        if (f.getDsTipoDado() == null || f.getDsTipoDado().isBlank())
            throw new Excecao("Tipo de dado e obrigatorio", 400);
    }
}
