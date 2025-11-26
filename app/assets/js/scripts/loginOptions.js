// Arquivo: app/assets/js/scripts/loginOptions.js

const loginOptionsCancelContainer = document.getElementById('loginOptionCancelContainer')
const loginOptionMicrosoft = document.getElementById('loginOptionMicrosoft')
const loginOptionMojang = document.getElementById('loginOptionMojang')
const loginOptionOffline = document.getElementById('loginOptionOffline') // Novo botão
const loginOptionsCancelButton = document.getElementById('loginOptionCancelButton')

let loginOptionsCancellable = false

let loginOptionsViewOnLoginSuccess
let loginOptionsViewOnLoginCancel
let loginOptionsViewOnCancel
let loginOptionsViewCancelHandler

function loginOptionsCancelEnabled(val){
    if(val){
        $(loginOptionsCancelContainer).show()
    } else {
        $(loginOptionsCancelContainer).hide()
    }
}

loginOptionMicrosoft.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
        ipcRenderer.send(
            MSFT_OPCODE.OPEN_LOGIN,
            loginOptionsViewOnLoginSuccess,
            loginOptionsViewOnLoginCancel
        )
    })
}

loginOptionMojang.onclick = (e) => {
    switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
        loginViewOnSuccess = loginOptionsViewOnLoginSuccess
        loginViewOnCancel = loginOptionsViewOnLoginCancel
        loginCancelEnabled(true)
    })
}

// --- CUSTOM: Lógica do Botão Offline ---
if(loginOptionOffline) {
    loginOptionOffline.onclick = (e) => {
        switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
            // Define o fluxo de sucesso/cancelamento igual ao da Mojang
            loginViewOnSuccess = loginOptionsViewOnLoginSuccess
            loginViewOnCancel = loginOptionsViewOnLoginCancel
            loginCancelEnabled(true)

            // Ativa automaticamente o modo offline no formulário de login
            // Usamos um pequeno timeout para garantir que a transição de tela iniciou
            setTimeout(() => {
                const offlineCheckbox = document.getElementById('loginOfflineOption');
                // Se o checkbox existir e NÃO estiver marcado, clica nele.
                if(offlineCheckbox && !offlineCheckbox.checked) {
                    offlineCheckbox.click(); // Dispara o evento de 'change' para ajustar a UI (esconder senha)
                }
            }, 50);
        })
    }
}

loginOptionsCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginOptionsViewOnCancel, 500, 500, () => {
        // Clear login values (Mojang login)
        // No cleanup needed for Microsoft.
        loginUsername.value = ''
        loginPassword.value = ''
        if(loginOptionsViewCancelHandler != null){
            loginOptionsViewCancelHandler()
            loginOptionsViewCancelHandler = null
        }
    })
}