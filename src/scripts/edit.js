import uuidv4 from 'uuid/v4'

const recipeID = location.hash.substring(1)
const token = localStorage.getItem('x-auth')

let theIngres;
let pageMode = 'createMode'
if (recipeID.length > 0) { pageMode = 'editMode' }

//---------------------  Error message for user   -----------------------//
function handleError(text) {
    const errorBox = document.querySelector('#edit__error-msg')
    const errorText = document.createElement('p')
    errorBox.innerHTML = ''
    errorText.textContent = text
    errorBox.appendChild(errorText)
}

// Make error box disappear when any part of the form is clicked.
document.querySelector('#edit-form').addEventListener('click', () => {
    const errorBox = document.querySelector('#edit__error-msg')
    errorBox.innerHTML = ''
})

//-----------------------   Rendering Ingredients   -----------------------//
// Triggered by input handler
function updateLocalStorage(type) {
    type === 'main' ? theIngres.mainIngre = [] : theIngres.subIngre = []
    Array.from(document.querySelector(`#${type}IngreArea`).children).forEach((each) => {
        console.log(each)

        const _id = each.dataset.id
        const name = each.children[0].value
        const amount = each.children[1].value
        type === 'main'
            ? theIngres.mainIngre.push({ _id, name, amount })
            : theIngres.subIngre.push({ _id, name, amount })
    })
    localStorage.setItem(`${type}Ingre`, JSON.stringify(theIngres[`${type}Ingre`]))
}

const generateIngreDOM = (ingre, type) => {

    const ingreLi = document.createElement('li')
    const nameEl = document.createElement('input')
    const amountEl = document.createElement('input')
    const removeEl = document.createElement('button')
    
    nameEl.value = ingre.name.toLowerCase()
    amountEl.value = ingre.amount.toLowerCase()
    
    ingreLi.setAttribute('id', `${type}Ingre`)
    ingreLi.setAttribute('data-id', ingre._id)

    nameEl.setAttribute('placeholder', 'name')
    nameEl.setAttribute('maxlength', '15')
    
    amountEl.setAttribute('placeholder', 'amount')
    amountEl.setAttribute('maxlength', '15')

    // Input(name) Event Handler
    nameEl.addEventListener('input', function () {
        updateLocalStorage(type)
    })

    // Input(amount) Event Handler
    amountEl.addEventListener('input', function () {
        updateLocalStorage(type)
    })

    // Remove functionality
    removeEl.addEventListener('click', function () {
        let eachIngre = JSON.parse(localStorage.getItem(`${type}Ingre`))
        const ingreIndex = eachIngre.findIndex((each) => each._id === ingre._id)
        eachIngre.splice(ingreIndex, 1)
        type === 'main' ? theIngres.mainIngre = eachIngre : theIngres.subIngre = eachIngre
        localStorage.setItem(`${type}Ingre`, JSON.stringify(theIngres[`${type}Ingre`]))
        renderIngre(type)
    })

    ingreLi.classList.add('edit__ingre')
    nameEl.classList.add('edit__ingre-name')
    amountEl.classList.add('edit__ingre-amount')

    ingreLi.appendChild(nameEl)
    ingreLi.appendChild(amountEl)
    ingreLi.appendChild(removeEl)
    return ingreLi
}

const renderIngre = (type) => {
    const ingreArea = document.querySelector(`#${type}IngreArea`)
    ingreArea.innerHTML = ''
    let ingreArray = type === 'main' ? theIngres.mainIngre : theIngres.subIngre
    ingreArray.forEach(obj => ingreArea.appendChild(generateIngreDOM(obj, type)))
}

//-----------------------   Rendering Type   -----------------------//
const getTypeDOM = (typeName) => {
    // Create a child of '<select>'
    const option = document.createElement('option')
    option.setAttribute('id', typeName)
    option.setAttribute('value', typeName)
    option.classList.add('foodType')
    option.textContent = typeName.charAt(0).toUpperCase() + typeName.slice(1).split('-').join(' ')
    return option
}

const renderType = () => {
    const filterTypes = JSON.parse(localStorage.getItem('filterTypes'))
    const editType = document.querySelector('#editType') // === <select>
    editType.innerHTML = ''
    filterTypes.forEach(type => editType.appendChild(getTypeDOM(type.name)))
}

renderType()

//-----------------------  Populating input fields   -----------------------//
if (recipeID.length > 0) { // hash 있음 (기존 Recipe 편집)

    fetch(`https://ingre-app.herokuapp.com/recipes/${recipeID}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': token
        }
    })
        .then(response => response.json())
        .then((res) => {
            const {mainIngre, subIngre, title, type, serving, text} = res.recipe

            // title
            const editTitle = document.querySelector('#editTitle')
            editTitle.value = title

            // type
            const editType = document.querySelector('#editType')
            Object.values(editType.children).forEach((each) => {
                if (each.value === type) {
                    document.querySelector(`#${each.id}`).setAttribute('selected', 'selected')
                }
            })

            // serving
            const editServing = document.querySelectorAll('.foodServing')
            Object.values(editServing).forEach((value) => {
                if (value.value == serving) {
                    document.querySelector(`#${value.id}`).setAttribute('selected', 'selected')
                }
            })

            // Ingredients
            localStorage.setItem('mainIngre', JSON.stringify(mainIngre))
            localStorage.setItem('subIngre', JSON.stringify(subIngre))
            theIngres = { mainIngre, subIngre }
            renderIngre('main')
            renderIngre('sub')

            // text body
            const editBody = document.querySelector('#editBody')
            editBody.value = text
        })
} else {    // For a new recipe
    theIngres = {
        mainIngre: [{
            name: '',
            amount: ''
        }],
        subIngre: [{
            name: '',
            amount: ''
        }]
    }
    renderIngre('main')
    renderIngre('sub')
}

//------------------------------  Buttons   ------------------------------//
// Main Ingredient 'Add' Button
document.querySelector('#addMainIngre').addEventListener('click', () => {
    theIngres.mainIngre.push({
        _id: uuidv4(),
        name: '',
        amount: ''
    })
    renderIngre('main')
    localStorage.setItem(`mainIngre`, JSON.stringify(theIngres.mainIngre))
})

// Sub Ingredient 'Add' Button
document.querySelector('#addSubIngre').addEventListener('click', () => {
    const ingreId = uuidv4()
    theIngres.subIngre.push({
        _id: ingreId,
        name: '',
        amount: ''
    })
    renderIngre('sub')
    localStorage.setItem(`subIngre`, JSON.stringify(theIngres.subIngre))
})

// 'Save' Button
document.querySelector('#edit-form').addEventListener('submit', (e) => {
    e.preventDefault()

    try {
        const body = {
            title: e.target.elements.editTitle.value,
            type: e.target.elements.editType.value,
            serving: e.target.elements.editServing.value,
            text: e.target.elements.editBody.value,
            mainIngre: [],
            subIngre: []
        }

        if (body.title.length === 0) {
            throw new Error('empty title')
        }

        function collectIngres(type) {
            document.querySelectorAll(`#${type}Ingre`).forEach((each) => {
                const name = each.children[0].value.toLowerCase().trim().replace(/ +/g, ' ').split(' ').join('-')
                const amount = each.children[1].value.toLowerCase().trim().replace(/ +/g, ' ')
                if (name.length === 0) { throw new Error('empty Ingre') }
                type === 'main' 
                ? body.mainIngre.push({ name, amount })
                : body.subIngre.push({ name, amount })
            })
        }
        collectIngres('main')
        collectIngres('sub')


        if (body.text.length === 0) {throw new Error('empty body')}

        if (pageMode === 'createMode') {
            fetch(`https://ingre-app.herokuapp.com/recipes/`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth': token
                },
                body: JSON.stringify(body)
            })
            .then((res) => {
                location.assign(`/main.html`)
            }).catch((e) => {
                console.log('Hmm fetch failed')
            })

        } else {
            fetch(`https://ingre-app.herokuapp.com/recipes/${recipeID}`, {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth': token
                },
                body: JSON.stringify(body)
            })
                .then(response => response.json())
                .then((res) => {
                    location.assign(`/main.html`)
                }).catch((e) => {
                    console.log('Hmm fetch failed')
                })
        }
    } catch (e) {
        if (e.message === 'empty title') {
            handleError('Title is empty.')
        } else if (e.message === 'empty Ingre') {
            handleError('Fill out the ingredient name(s).')
        } else if (e.message === 'empty body') {
            handleError('Directions area is empty.')
        } 
    }
})

// 'Delete' Button
document.querySelector('#edit-delete').addEventListener('click', (e) => {
    const deleteConfirm = confirm("Want to delete?");
    if (deleteConfirm) {
        fetch(`https://ingre-app.herokuapp.com/recipes/${recipeID}`, {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json',
                'x-auth': token
            }
        }).then((res) => {
            location.assign(`/main.html`)
        })
        .catch((e) => {
            console.log('Deleting request failed')
        })
    }
})