import { useEffect } from "react";

// VLibras — acessibilidade para Língua Brasileira de Sinais
// https://vlibras.gov.br
export default function VLibras() {
  useEffect(() => {
    // Injeta o widget apenas uma vez
    if (document.querySelector("[vw]")) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute("vw", "");
    wrapper.className = "enabled";
    wrapper.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.onload = () => {
      // @ts-expect-error VLibras global
      new window.VLibras.Widget("https://vlibras.gov.br/app");
    };
    document.body.appendChild(script);
  }, []);

  return null;
}
