import { chosenType } from './filters'

// STEP 3 - renderRecipe 실행 중 filterRecipe 자료 추출 다음에 실행되는 '돔 제작'
const getRecipeDOM = (recipe) => {
    const recipeLi = document.createElement('li')
    const recipeA = document.createElement('a')
    recipeA.classList.add('recipe__link')
    recipeA.setAttribute('href', `/recipe#${recipe._id}`) // 보는 링크
    recipeLi.appendChild(recipeA)
    recipeLi.classList.add('recipe')

    // Title
    const titleEl = document.createElement('h3')
    titleEl.classList.add('recipe__title')
    titleEl.textContent = recipe.title
    recipeA.appendChild(titleEl)

    // Food Type
    const foodTypeEl = document.createElement('span')
    foodTypeEl.textContent = recipe.type
    foodTypeEl.classList.add('recipe__type')
    recipeA.appendChild(foodTypeEl)


    // Main Ingredient
    const mainIngreArea = document.createElement('div')
    mainIngreArea.classList.add('recipe__mainIngres')

    const mainTitle = document.createElement('p')
    mainTitle.textContent = 'main'
    mainIngreArea.appendChild(mainTitle)

    const mainIngresWrapper = document.createElement('div')
    mainIngresWrapper.classList.add('recipe__ingresWrapper')

    recipe.mainIngre.forEach((eachIngre) => {
        const mainIngreEl = document.createElement('span')
        mainIngreEl.textContent = eachIngre.name.split('-').join(' ')
        mainIngresWrapper.appendChild(mainIngreEl)
    })
    mainIngreArea.appendChild(mainIngresWrapper)
    recipeA.appendChild(mainIngreArea)


    // Sub Ingredient
    const subIngreArea = document.createElement('div')
    subIngreArea.classList.add('recipe__subIngres')

    const subTitle = document.createElement('p')
    subTitle.textContent = 'sub'
    subIngreArea.appendChild(subTitle)

    const subIngresWrapper = document.createElement('div')
    subIngresWrapper.classList.add('recipe__ingresWrapper')

    recipe.subIngre.forEach((eachIngre) => {
        const subIngreEl = document.createElement('span')
        subIngreEl.textContent = eachIngre.name.split('-').join(' ')
        subIngresWrapper.appendChild(subIngreEl)
    })
    subIngreArea.appendChild(subIngresWrapper)
    recipeA.appendChild(subIngreArea)


    // Message
    const matchScoreEl = document.createElement('span')
    matchScoreEl.classList.add('recipe__message')
    // Helping message only when the matchRate is not zero. (So, initial page load -> No helping message)
    if (recipe.matchRate !== 0) {
        if (recipe.matchRate >= 80) {
            matchScoreEl.textContent = 'Perfect Match!'
        } else if (recipe.matchRate >= 40) {
            matchScoreEl.textContent = 'Nice Match!'
        } else if (recipe.matchRate >= 20) {
            matchScoreEl.textContent = 'Not a bad Match!'
        } else {
            matchScoreEl.textContent = 'Go grocery shopping!'
        }
    }

    // Go-to-edit button
    const editEl = document.createElement('a')
    editEl.textContent = 'edit'
    editEl.classList.add('recipe__edit')
    editEl.setAttribute('href', `/edit#${recipe._id}`) // hbs이후의 수정된 링크
    editEl.setAttribute('data-recipeID', recipe._id)
    // editEl.setAttribute('href', `/edit.html#${recipe._id}`) // hbs이전의 수정하는 링크

    // Message + Button Combining
    const rowBox = document.createElement('div')
    rowBox.classList.add('recipe__bottomLine')
    rowBox.appendChild(matchScoreEl)
    rowBox.appendChild(editEl)
    recipeA.appendChild(rowBox)

    return recipeLi
}

// STEP 2
const filterRecipe = (recipes) => {
    const filterIngre = JSON.parse(localStorage.getItem('filterIngre')) // Ingredient 오브젝트 state 모음 Array

    // Collecting chosen ingredients' names
    const chosenIngres = [] //eg. ['beef']
    filterIngre.forEach((ingre) => {
        if (ingre.chosen === true) {
            chosenIngres.push(ingre.name) // ingre state가 chosen 인것만 'chosenIngres' 대열에 올림
        }
    })
    // 다음은 모든레피시들 하나씩을 들여다보고 하는 작업들임
    const filteredRecipes = recipes.filter((oneRecipe) => {

        // Main Ingredients Array
        let mainIngresInOne = [] // eg. Josh's Favorite : ['beef', 'rice']
        oneRecipe.mainIngre.forEach((each) => {
            mainIngresInOne.push(each.name)
        })
        // Sub Ingredients Array
        let subIngresInOne = [] // eg. Josh's Favorite : ['A1 suace']
        oneRecipe.subIngre.forEach((each) => {
            subIngresInOne.push(each.name)
        })

        // Main Ingredient (matching each to chosen ingredients)
        let matchedList = [] //eg. beef를 선택했을 경우 Josh's Favorite은 [true, false]를, Bulgogi는 [true, false, false, false]
        chosenIngres.forEach((ingre) => {
            mainIngresInOne.forEach((each) => {
                each.includes(ingre) ? matchedList.push(true) : matchedList.push(false)
            })
        })

        // Sub Ingredient (matching each to chosen ingredients)
        let subMatchedList = [] //eg. beef를 선택했을 경우 Tomato Past만 [false, false, true, false, false] 즉 25% sub ingre 매칭률
        chosenIngres.forEach((ingre) => {
            subIngresInOne.forEach((each) => {
                each.includes(ingre) ? subMatchedList.push(true) : subMatchedList.push(false)
            })
        })

        // MatchRate
        let mainMatchedRate = 0
        let subMatchedRate = 0
        if (matchedList.length > 0) {
                                        // each => each인것은 본인이 true면 살고, false면 자동 제외되게.
            mainMatchedRate = (matchedList.filter(each => each).length / oneRecipe.mainIngre.length) * .8
        }
        if (subMatchedList.length > 0) {
            subMatchedRate = (subMatchedList.filter(each => each).length / oneRecipe.subIngre.length) * .2
        }
        
        // 각 레시피의 matchRate 프로퍼티에 최종 점수 넣어주기
        oneRecipe.matchRate = (mainMatchedRate + subMatchedRate) * 100

        // --------------재료매치 계산은 모든 레시피 대상으로 이루어지지만, 실제 출력 여부는 여기서부터 판단됨--------------
        // type 판단
        let isTypeMatch = chosenType.type === 'any' || chosenType.type === oneRecipe.type        
        // filterType이 any일 경우에도 통과시켜주고, 본 레시피의 유형과 같아도 통과시켜주고.

        // ingre선택 없으면 모두 출력하도록 설정
        if (chosenIngres.length <= 0) {
            return isTypeMatch  // type 매치만 판단기준이 되도록
        } else {    
            // true를 포함한 matchedList가 있는 경우 + type이 매치하는 경우
            const match01 = matchedList.includes(true) && isTypeMatch

            // true를 포함한  subMatchedList가 있는 경우 + type이 매치하는 경우
            const match02 = subMatchedList.includes(true) && isTypeMatch

            // 위의 두 가지인 경우를 다 출력하도록
            return match01 || match02
        }

    })

    // Sorting criteria
    if (chosenIngres.length <= 0) {
        filteredRecipes.sort((a, b) => { 
            if (a.id > b.id) {
                return 1
            } else if (b.id > a.id) {
                return -1
            } else {
                return 0
            }
        })
    } else {
        filteredRecipes.sort((a, b) => { 
            if (a.matchRate < b.matchRate) {
                return 1
            } else if (b.matchRate < a.matchRate) {
                return -1
            } else {
                return 0
            }
        })
    }

    return filteredRecipes
}

// STEP 1
const renderList = (recipes) => {
    // 컨텐츠 박스가 되는 'recipesArea'
    const recipesArea = document.querySelector('#recipesArea')
    recipesArea.innerHTML = ''

    // (필터 사용 관계 없이 일단,) recipes가 비었으면 '결과 없음'을 렌더하고 function 종료.
    if (recipes.length <= 0) {
        const noResultEl = document.createElement('p')
        noResultEl.textContent = 'No result'
        recipesArea.appendChild(noResultEl) 
        return  
    }
    // recipes를 필터링해온다 (-> STEP.2)
    const filteredRecipes = filterRecipe(recipes)
    if (filteredRecipes.length > 0) {
        filteredRecipes.forEach((recipe) => {
            return recipesArea.appendChild(getRecipeDOM(recipe))
        })
    } else {
        const noResultText = document.createElement('p')
        noResultText.textContent = 'No recipe found'
        recipesArea.appendChild(noResultText)
    }

}

export { renderList }