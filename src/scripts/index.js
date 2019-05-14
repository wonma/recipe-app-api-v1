//-----------------------   Sign-up Modal   -----------------------//
const modal = document.querySelector('#modal')

// Open Sign-up
document.getElementById('open-modal').addEventListener('click', () => {
    modal.classList.add('modal--is-visible')
})

// Close Sign-up
document.getElementById('modal-close').addEventListener('click', () => {
    modal.classList.remove('modal--is-visible')
})

//------------------  Functions for /users Request   -----------------------//
const showError = function (area, message) {
    document.querySelector('#errorMessage').innerHTML = ''
    const errorArea = document.querySelector(area) // div
    const errorMessage = document.createElement('p')
    errorMessage.textContent = message
    errorArea.append(errorMessage)
}

const fillLocalStorage = function (loginInfo) {
    // [1] x-auth
    if (typeof loginInfo.token === 'string') { // the value shouldn't be 'undefined'
        localStorage.setItem('x-auth', loginInfo.token)
    } else {
        return
    }
    // [2] user
    localStorage.setItem('user', loginInfo.user.name)

    // [3] filterIngre
    const filterIngre = loginInfo.user.filterIngre.map((ingre) => {
        return { 'name': ingre, 'chosen': false }
    })
    localStorage.setItem('filterIngre', JSON.stringify(filterIngre))

    // [4] filterType
    const filterType = loginInfo.user.filterType.map((type) => {
        return type === 'any' ? { 'name': type, 'chosen': true } : { 'name': type, 'chosen': false }
    })
    localStorage.setItem('filterTypes', JSON.stringify(filterType))
}

//-----------------------  POST /users REQUEST  -----------------------//
document.querySelector('#register-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const [userName, email, password, passwordConfirm] = e.target.elements
    const validChars = /^([a-zA-Z0-9_\-]*)$/  // No special character, no space allowed

    // When nothing has been typed
    if (!userName.value.length || 
        !email.value.length || 
        !password.value.length || 
        !passwordConfirm.value.length) { 
        showError('#errorMessage', 'Please fill all the fields.')
        return false
    }

    // When something has been typed
    if (!validChars.test(userName.value)) {
        showError('#errorMessage', 'Username error: No special character, no space')
        return false
    } else if (password.value.length < 6) {
        showError('#errorMessage', 'Password should be at least 6 characters.')
        return false
    } else if (password.value !== passwordConfirm.value) {
        showError('#errorMessage', 'Please type your password again.')
        return false
    } 

    fetch('https://ingre-app.herokuapp.com/users/', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: userName.value,
            email: email.value,
            password: password.value,
            passwordConfirm: passwordConfirm.value
        })
    })
    .then(response => response.json())
    .then(loginInfo => {    // if the inputs are invalid, 'loginInfo' becomes 'errors' object.
        
        //-----------------------   Error Handling   -----------------------//
        document.querySelector('#errorMessage').innerHTML =''
        if(loginInfo.code === 11000) {
            showError('#errorMessage', 'The email is already registered.')
        }
        if(loginInfo.email) {
            showError('#errorMessage', 'Woops! Email is invalid.')
        } else if(loginInfo.password) {
            showError('#errorMessage', 'Woops! Password is invalid.')
        }

        // Populate localStorage(token, username, filterIngre, filterType)
        fillLocalStorage(loginInfo)

        // Router Change to Main Page
        location.assign(`/main`)
    })
    .catch(err => console.log(err))
})

//-----------------------  GET /users REQUEST  -----------------------//
document.querySelector('#login-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const [email, password] = e.target.elements
    console.log('haha')
    fetch('https://ingre-app.herokuapp.com/users/login', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: email.value,
            password: password.value,
        })
    }).then(response => response.json())
        .then(loginInfo => {
            //-----------------------   Error Handling   -----------------------//
            document.querySelector('#loginError').innerHTML = ''
            if (loginInfo.message ==='No existing user') {
                showError('#loginError', `The email is not registered.`)
                return false
            } else if (loginInfo.message === 'Wrong password') {
                showError('#loginError', `Check the password please.`)
                return false
            }
            
            // Populate localStorage(token, username, filterIngre, filterType)
            fillLocalStorage(loginInfo)

            // Router Change to Main Page
            location.assign(`/main`)
        })
        .catch(err => {console.log(err)})
})

