// Arquivo: app/assets/js/scripts/login.js

/**
 * Script for login.ejs
 */
// Validation Regexes.
const validUsername         = /^[a-zA-Z0-9_]{1,16}$/
const basicEmail            = /^\S+@\S+\.\S+$/
//const validEmail          = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i

// Login Elements
const loginCancelContainer  = document.getElementById('loginCancelContainer')
const loginCancelButton     = document.getElementById('loginCancelButton')
const loginEmailError       = document.getElementById('loginEmailError')
const loginUsername         = document.getElementById('loginUsername')
const loginPasswordError    = document.getElementById('loginPasswordError')
const loginPassword         = document.getElementById('loginPassword')
const checkmarkContainer    = document.getElementById('checkmarkContainer')
const loginRememberOption   = document.getElementById('loginRememberOption')
const loginButton           = document.getElementById('loginButton')
const loginForm             = document.getElementById('loginForm')

// Control variables.
let lu = false, lp = false

// --- CUSTOM: Offline Mode State ---
let isOfflineMode = false;

// --- CUSTOM: Inject Offline Checkbox ---
// Injects a checkbox to toggle offline mode into the login form options
function injectOfflineCheckbox() {
    const optionsContainer = document.getElementById('loginOptions');
    if (optionsContainer && !document.getElementById('loginOfflineOption')) {
        const offlineDiv = document.createElement('div');
        offlineDiv.style.display = 'flex';
        offlineDiv.style.alignItems = 'center';
        offlineDiv.style.marginTop = '5px';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'loginOfflineOption';
        checkbox.style.marginRight = '5px';
        
        const label = document.createElement('label');
        label.htmlFor = 'loginOfflineOption';
        label.innerText = 'Login Offline';
        label.style.fontSize = '12px';
        label.style.color = '#fff';
        label.style.fontFamily = 'Avenir Book';

        offlineDiv.appendChild(checkbox);
        offlineDiv.appendChild(label);
        
        // Insert before the existing options or append
        optionsContainer.parentNode.insertBefore(offlineDiv, optionsContainer);

        // Bind Event
        checkbox.addEventListener('change', (e) => {
            isOfflineMode = e.target.checked;
            toggleOfflineModeUI(isOfflineMode);
        });
    }
}

// --- CUSTOM: Toggle UI for Offline Mode ---
function toggleOfflineModeUI(offline) {
    if (offline) {
        loginPassword.disabled = true;
        loginPassword.style.opacity = '0.5';
        loginPassword.value = ''; // Clear password
        loginPasswordError.style.opacity = 0;
        lp = true; // Bypass password validation
        
        // Re-validate username to enable button if username is present
        validateEmail(loginUsername.value);
    } else {
        loginPassword.disabled = false;
        loginPassword.style.opacity = '1';
        lp = false; // Require password again
        validatePassword(loginPassword.value); // Re-validate
    }
}

// Helper to generate UUID from string (Offline)
function getOfflineUUID(username) {
    // Simple hash function to generate a consistent UUID-like string from username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    // Create a UUID-like pattern
    const hex = (hash >>> 0).toString(16).padStart(8, '0');
    return `00000000-0000-0000-0000-${hex.padStart(12, '0')}`; 
}

// Initialize Custom UI
injectOfflineCheckbox();


/**
 * Show a login error.
 * * @param {HTMLElement} element The element on which to display the error.
 * @param {string} value The error text.
 */
function showError(element, value){
    element.innerHTML = value
    element.style.opacity = 1
}

/**
 * Shake a login error to add emphasis.
 * * @param {HTMLElement} element The element to shake.
 */
function shakeError(element){
    if(element.style.opacity == 1){
        element.classList.remove('shake')
        void element.offsetWidth
        element.classList.add('shake')
    }
}

/**
 * Validate that an email field is neither empty nor invalid.
 * * @param {string} value The email value.
 */
function validateEmail(value){
    if(value){
        if(!basicEmail.test(value) && !validUsername.test(value)){
            showError(loginEmailError, Lang.queryJS('login.error.invalidValue'))
            loginDisabled(true)
            lu = false
        } else {
            loginEmailError.style.opacity = 0
            lu = true
            if(lp){
                loginDisabled(false)
            }
        }
    } else {
        lu = false
        showError(loginEmailError, Lang.queryJS('login.error.requiredValue'))
        loginDisabled(true)
    }
}

/**
 * Validate that the password field is not empty.
 * * @param {string} value The password value.
 */
function validatePassword(value){
    if(isOfflineMode) return; // Skip validation in offline mode

    if(value){
        loginPasswordError.style.opacity = 0
        lp = true
        if(lu){
            loginDisabled(false)
        }
    } else {
        lp = false
        showError(loginPasswordError, Lang.queryJS('login.error.invalidValue'))
        loginDisabled(true)
    }
}

// Emphasize errors with shake when focus is lost.
loginUsername.addEventListener('focusout', (e) => {
    validateEmail(e.target.value)
    shakeError(loginEmailError)
})
loginPassword.addEventListener('focusout', (e) => {
    validatePassword(e.target.value)
    shakeError(loginPasswordError)
})

// Validate input for each field.
loginUsername.addEventListener('input', (e) => {
    validateEmail(e.target.value)
})
loginPassword.addEventListener('input', (e) => {
    validatePassword(e.target.value)
})

/**
 * Enable or disable the login button.
 * * @param {boolean} v True to enable, false to disable.
 */
function loginDisabled(v){
    if(loginButton.disabled !== v){
        loginButton.disabled = v
    }
}

/**
 * Enable or disable loading elements.
 * * @param {boolean} v True to enable, false to disable.
 */
function loginLoading(v){
    if(v){
        loginButton.setAttribute('loading', v)
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'))
    } else {
        loginButton.removeAttribute('loading')
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'))
    }
}

/**
 * Enable or disable login form.
 * * @param {boolean} v True to enable, false to disable.
 */
function formDisabled(v){
    loginDisabled(v)
    loginCancelButton.disabled = v
    loginUsername.disabled = v
    // Only disable password if not already disabled by offline mode
    if(!isOfflineMode) loginPassword.disabled = v
    
    if(v){
        checkmarkContainer.setAttribute('disabled', v)
    } else {
        checkmarkContainer.removeAttribute('disabled')
    }
    loginRememberOption.disabled = v
}

let loginViewOnSuccess = VIEWS.landing
let loginViewOnCancel = VIEWS.settings
let loginViewCancelHandler

function loginCancelEnabled(val){
    if(val){
        $(loginCancelContainer).show()
    } else {
        $(loginCancelContainer).hide()
    }
}

loginCancelButton.onclick = (e) => {
    switchView(getCurrentView(), loginViewOnCancel, 500, 500, () => {
        loginUsername.value = ''
        loginPassword.value = ''
        loginCancelEnabled(false)
        if(loginViewCancelHandler != null){
            loginViewCancelHandler()
            loginViewCancelHandler = null
        }
    })
}

// Disable default form behavior.
loginForm.onsubmit = () => { return false }

// Bind login button behavior.
loginButton.addEventListener('click', () => {
    // Disable form.
    formDisabled(true)

    // Show loading stuff.
    loginLoading(true)

    // --- CUSTOM: Branch for Offline Login ---
    if(isOfflineMode) {
        const username = loginUsername.value;
        const uuid = getOfflineUUID(username);
        
        // Objeto de autenticação offline
        const offlineAuth = {
            uuid: uuid,
            accessToken: 'access-token-offline-' + uuid,
            clientToken: 'client-token-offline-' + uuid,
            displayName: username,
            type: 'offline'
        };

        // Simula delay de login
        setTimeout(async () => {
            try {
                // CORREÇÃO: Modificamos o objeto retornado diretamente (passagem por referência)
                
                // 1. Pega a REFERÊNCIA das contas atuais
                const authAccounts = ConfigManager.getAuthAccounts();
                
                // 2. Insere a conta offline diretamente no objeto
                authAccounts[offlineAuth.uuid] = {
                    uuid: offlineAuth.uuid,
                    accessToken: offlineAuth.accessToken,
                    clientToken: offlineAuth.clientToken,
                    displayName: offlineAuth.displayName,
                    username: username,
                    type: 'offline'
                };

                // 3. Define como selecionada
                ConfigManager.setSelectedAccount(offlineAuth.uuid);
                
                // 4. Salva as alterações no disco
                ConfigManager.save();
                
                // Atualiza a UI da Landing Page
                updateSelectedAccount(offlineAuth);
                
                // FLUXO DE SUCESSO UI (Animações)
                loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'));
                $('.circle-loader').toggleClass('load-complete');
                $('.checkmark').toggle();
                
                setTimeout(() => {
                    switchView(VIEWS.login, loginViewOnSuccess, 500, 500, async () => {
                        if(loginViewOnSuccess === VIEWS.settings){
                            await prepareSettings();
                        }
                        // Resetar variáveis de controle
                        loginViewOnSuccess = VIEWS.landing; 
                        loginCancelEnabled(false); 
                        loginViewCancelHandler = null; 
                        loginUsername.value = '';
                        loginPassword.value = '';
                        
                        // Resetar estado do botão
                        $('.circle-loader').toggleClass('load-complete');
                        $('.checkmark').toggle();
                        loginLoading(false);
                        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'));
                        formDisabled(false);
                    });
                }, 1000);

            } catch (err) {
                console.error("Offline Login Error", err);
                loginLoading(false);
                formDisabled(false);
                showError(loginEmailError, "Erro ao salvar: " + err.message);
            }
        }, 500);
        
        return; // Encerra o fluxo offline aqui
    }

    // Original Online Login Flow
    AuthManager.addMojangAccount(loginUsername.value, loginPassword.value).then((value) => {
        updateSelectedAccount(value)
        loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'))
        $('.circle-loader').toggleClass('load-complete')
        $('.checkmark').toggle()
        setTimeout(() => {
            switchView(VIEWS.login, loginViewOnSuccess, 500, 500, async () => {
                // Temporary workaround
                if(loginViewOnSuccess === VIEWS.settings){
                    await prepareSettings()
                }
                loginViewOnSuccess = VIEWS.landing // Reset this for good measure.
                loginCancelEnabled(false) // Reset this for good measure.
                loginViewCancelHandler = null // Reset this for good measure.
                loginUsername.value = ''
                loginPassword.value = ''
                $('.circle-loader').toggleClass('load-complete')
                $('.checkmark').toggle()
                loginLoading(false)
                loginButton.innerHTML = loginButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'))
                formDisabled(false)
            })
        }, 1000)
    }).catch((displayableError) => {
        loginLoading(false)

        let actualDisplayableError
        if(isDisplayableError(displayableError)) {
            // msftLoginLogger.error('Error while logging in.', displayableError)
            actualDisplayableError = displayableError
        } else {
            // Uh oh.
            // msftLoginLogger.error('Unhandled error during login.', displayableError)
            actualDisplayableError = Lang.queryJS('login.error.unknown')
        }

        setOverlayContent(actualDisplayableError.title, actualDisplayableError.desc, Lang.queryJS('login.tryAgain'))
        setOverlayHandler(() => {
            formDisabled(false)
            toggleOverlay(false)
        })
        toggleOverlay(true)
    })

})