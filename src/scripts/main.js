import { renderList } from './mainRender'
import { renderItemFilter, chosenType, editState, pickType } from './filters'

//--------------------   Token & Username   --------------------//
const token = localStorage.getItem('x-auth')
const username = localStorage.getItem('user')

// Block access if without token
if(!token) {location.assign('/index')}

// Display Username
document.querySelector('#username').textContent = username


//-----------------------   Filters   -----------------------//

// Render filters
renderItemFilter(editState.ingre, 'ingre')
renderItemFilter(editState.type, 'type')

const addFilterItem = (editState, filterName) => {
    let items;

    if (filterName === 'ingre') {
        items = { filterIngre: JSON.parse(localStorage.getItem('filterIngre')) }
    } else {
        const currentType = JSON.parse(localStorage.getItem('filterTypes'))
        const updatedTypes = currentType.map(type => {
            if (type.name === "any") {
                return { name: type.name, chosen: true }
            } else {
                return { name: type.name, chosen: false }
            }
        })
        items = { filterTypes: updatedTypes }
    }

    fetch(`https://ingre-app.herokuapp.com/users/me/${filterName + 's'}`, {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': token
        },
        body: JSON.stringify(items)
    })
        .then(response => response.json())
        .then((filterItems) => {
            // reset rendered list
            if (filterName === 'ingre') {
                const currentIngre = JSON.parse(localStorage.getItem('filterIngre'))
                const updatedIngre = currentIngre.map(ingre => {
                    return { name: ingre.name, chosen: false }
                })
                localStorage.setItem('filterIngre', JSON.stringify(updatedIngre))
            } else {
                chosenType.type = 'any'
                const updatedTypes = filterItems.map(type => {
                    if (type === "any") {
                        return { name: type, chosen: true }
                    } else {
                        return { name: type, chosen: false }
                    }
                })
                localStorage.setItem('filterTypes', JSON.stringify(updatedTypes))
            }
            renderItemFilter(editState, filterName)
            renderList(getRecipes)
        })
        .catch((e) => {
            console.log('Error from front')
        })
}

// Edit Ingre Filter
document.querySelector('#add-ingre').addEventListener('click', (e) => {
    const editIngreBtn = document.querySelector('#add-ingre')

    if (editState.ingre === 'off') {
        editState.ingre = 'on'
        editIngreBtn.textContent = 'Done'
        renderItemFilter(editState.ingre, 'ingre')
    } else if (editState.ingre === 'on') {
        editState.ingre = 'off'
        editIngreBtn.textContent = 'Edit'

        addFilterItem(editState.ingre, 'ingre')
    }
})

// Edit Type Filter
document.querySelector('#add-type').addEventListener('click', (e) => {
    const editTypeBtn = document.querySelector('#add-type')

    if (editState.type === 'off') {
        editState.type = 'on'
        editTypeBtn.textContent = 'Done'
        renderItemFilter(editState.type, 'type')
    } else if (editState.type === 'on') {
        editState.type = 'off'
        editTypeBtn.textContent = 'Edit'

        addFilterItem(editState.type, 'type')
    }
})


//-----------------------   Recipes   -----------------------//

let getRecipes = []

fetch('/recipes', {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': token
        }
})
    .then(response => response.json())
    .then((res) => {
        renderList(res.recipes)
        getRecipes = res.recipes
        return res.recipes
    })
    .then((recipes) => {

        // Re-render with ingredients to filter checked
        document.querySelector('#ingredients').addEventListener('change', (e)=> {
            const filterIngre = JSON.parse(localStorage.getItem('filterIngre'))
            filterIngre.forEach((ingre) => {
                if (ingre.name === e.target.value) {
                    ingre.chosen = e.target.checked  // filter ingre선택여부 true로 바뀌게 됨
                }
            })
            localStorage.setItem('filterIngre', JSON.stringify(filterIngre))
            renderList(recipes) // filter할 아템은 계속 filterIngre 어레이오브젝트 참고하게됨
        })

        // Re-render with food type filter checked
        document.querySelector('#foodType').addEventListener('change', (e) => {
            pickType(e.target.value)
            renderItemFilter(editState.ingre, 'type')
            renderList(recipes)
        })
    })
    .catch(err => console.log('Failed to fetch')) 


//-----------------------   Buttons   -----------------------//

// Log out 
document.querySelector('#logout').addEventListener('click', (e) => {
    fetch('/users/me/token', {
        method: 'delete',
        headers: {
            'Content-Type': 'application/json',
            'x-auth': token
        }
    })
        .then(response => {
            localStorage.clear()
            location.assign(`/index`)
            
        })
})

// Creating new recipe button
document.querySelector('#add-new').addEventListener('click', (e) => {
    location.assign(`/edit`)
})
