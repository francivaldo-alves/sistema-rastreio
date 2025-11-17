const btnLogin = document.getElementById("btnLogin");
const msgLogin = document.getElementById("msgLogin");
const usuarioInput = document.getElementById("usuario");
const senhaInput = document.getElementById("senha");

btnLogin.addEventListener("click", async () => {
    const usuario = usuarioInput.value.trim();
    const senha = senhaInput.value.trim();

    if (!usuario || !senha) {
        msgLogin.textContent = "Preencha o usuário e a senha.";
        msgLogin.className = "mb-4 text-center text-red-600";
        return;
    }

    msgLogin.textContent = "Verificando credenciais...";
    msgLogin.className = "mb-4 text-center text-blue-600";
    btnLogin.disabled = true;

    try {
        const resposta = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ usuario, senha })
        });

        const data = await resposta.json();

        if (data.sucesso) {
            // Salva token no navegador
            localStorage.setItem("authToken", data.token);

            msgLogin.textContent = "✔ Login bem-sucedido! Redirecionando...";
            msgLogin.className = "mb-4 text-center text-green-600";

            setTimeout(() => {
                window.location.href = "rastreio.html";
            }, 800);
        } else {
            msgLogin.textContent = "❌ Usuário ou senha incorretos.";
            msgLogin.className = "mb-4 text-center text-red-600";
            btnLogin.disabled = false;
        }

    } catch (err) {
        msgLogin.textContent = "❌ Erro ao conectar ao servidor.";
        msgLogin.className = "mb-4 text-center text-red-600";
        btnLogin.disabled = false;
    }
});
