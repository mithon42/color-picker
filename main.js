/**
 * Date: 21-03-2022
 * Author: Mithon Islam
 * Description: Color Picker Application Width Huge Dom Functionalities
 */



// ==//==//==// Globals //==//==//==
let toastContainer = null
const defaultColor = {
    red: 221,
    green: 222,
    blue: 238
}
const copySounds = new Audio('../audio-sound/notification.mp3')

// Preset Colors
const defaultPresetColors = [
    '#0F40FF',
    '#DDFF00',
    '#064d29',
    '#B1E635',
    '#E1BEE7',
    '#FF80AB',
    '#FF8A80',
    '#EA80AB',
    '#9FA8DA',
    '#90CAF9',
    '#B388FF',
    '#82B1FF',
    '#84FFFF',
    '#F0F4C3',
    '#FF0000',
    '#FFF000',
    '#9DA3E0',
    '#366DF0',
    '#6E143F',
    '#6B9994',
    '#FAC3D2',
    '#909000',
    '#389AD7',
    '#BE9C9E',
];
let customColors = new Array(24);


// ==//==//==// Onload Handler //==//==//==
window.onload = () => {
    main()
    updateColorCodeToDom(defaultColor)

    // Display Preset Colors
    displayColorBoxes(document.getElementById('preset-colors'), defaultPresetColors)
    
    const customColorsString = localStorage.getItem('custom-color')
    if(customColorsString){
        customColors = JSON.parse(customColorsString)
        displayColorBoxes(document.getElementById('custom-color'), customColors)
    }
}


// ==//==//==// Main Or Boot Function, This function will take care of getting all the DOM References //==//==//==
function main(){
    // DOM References
    const generateRandomColorBtn = document.getElementById('generate-random-color-btn')
    const colorInputHex = document.getElementById('color-input-hex')
    const colorSliderRed = document.getElementById('color-slider-input-red')
    const colorSliderGreen = document.getElementById('color-slider-input-green')
    const colorSliderBlue = document.getElementById('color-slider-input-blue')
    const copyToClipboardBtn = document.getElementById('copy-to-clipboard-btn')
    const presetColorsParent = document.getElementById('preset-colors')
    const saveToCustomBtn  = document.getElementById('save-to-custom-btn')
    const customColorsParent = document.getElementById('custom-colors')
    const bgFileInput = document.getElementById('bg-file-input')
    const bgFileInputBtn = document.getElementById('bg-file-input-btn')
    const bgFileDeleteBtn = document.getElementById('bg-file-delete-btn')
    const bgPreview = document.getElementById('bg-preview')
    const bgController = document.getElementById('bg-controller')




    // Event Listeners
    generateRandomColorBtn.addEventListener('click', handleGenerateRandomColorBtn)
    colorInputHex.addEventListener('keyup', handleColorInputHex)

    // Sliders
    colorSliderRed.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue))
    colorSliderGreen.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue))
    colorSliderBlue.addEventListener('change', handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue))

    // Copy to Clipboard
    copyToClipboardBtn.addEventListener('click', handleCopyToClipboard)

    // Preset Color
    presetColorsParent.addEventListener('click', handlePresetColorsParent)

    // Save to Custom
    saveToCustomBtn.addEventListener('click', handleSaveToCustomBtn(colorInputHex, customColorsParent))
    customColorsParent.addEventListener('click', handlePresetColorsParent)


    // Background Input
    bgFileInputBtn.addEventListener('click', handleBgFileInputBtn(bgFileInput))

    bgFileInput.addEventListener('change', handleBgFileInput(bgPreview, bgFileDeleteBtn, bgController))

    bgFileDeleteBtn.addEventListener('click', handleBgFileDeleteBtn(bgPreview, bgFileDeleteBtn, bgFileInput, bgController))

    document.getElementById('bg-size').addEventListener('change', changeBackgroundPreferences)
    document.getElementById('bg-repeat').addEventListener('change', changeBackgroundPreferences)
    document.getElementById('bg-position').addEventListener('change', changeBackgroundPreferences)
    document.getElementById('bg-attachment').addEventListener('change', changeBackgroundPreferences)
}



// ==//==//==// Event Handlers //==//==//==
/**
 * Handle Generate Random Color Button Events
 */
function handleGenerateRandomColorBtn(){
    const color = generateColorDecimal()
    updateColorCodeToDom(color)
}

/**
 * Handle Color Input Hex Events
 */
function handleColorInputHex(event){
    const hexColor = event.target.value
    if(hexColor){
        this.value = hexColor.toUpperCase()
        if(isValidHex(hexColor)){
            const color = hexToDecimalColors(hexColor)
            updateColorCodeToDom(color)
        }
    }
}

/**
 * Handle Color Sliders Events
 */
function handleColorSliders(colorSliderRed, colorSliderGreen, colorSliderBlue){
    return function(){
        const color = {
            red: parseInt(colorSliderRed.value),
            green: parseInt(colorSliderGreen.value),
            blue: parseInt(colorSliderBlue.value)
        }
        updateColorCodeToDom(color)
    }
}

/**
 * Handle copy To clipboard Events
 */
function handleCopyToClipboard(){
    const colorModeRadios = document.getElementsByName('color-mode')
    const mode = getCheckedValueFormRadios(colorModeRadios)
    if(mode === null){
        throw new Error('Invalid Radio Input')
    }

    if(toastContainer !== null){
        toastContainer.remove()
        toastContainer = null;
    }

    if(mode === 'hex'){
        const hexColor = document.getElementById('color-input-hex').value
        if(hexColor && isValidHex(hexColor)){
            navigator.clipboard.writeText(`#${hexColor}`)
            generateToastMessage(`#${hexColor} Copied`)
        } else{
            alert('Invalid Hex Code')
        }
    } else {
        const rgbColor = document.getElementById('color-input-rgb').value
        if(rgbColor){
            navigator.clipboard.writeText(rgbColor)
            generateToastMessage(`${rgbColor} Copied`)
        } else{
            alert('Invalid RGB Color')
        }
    }
}

/**
 * Handle Present Colors Parent
 */
function handlePresetColorsParent(event){
    const child = event.target;
    if(toastContainer !== null){
        toastContainer.remove()
        toastContainer = null;
    }
    if(child.className === 'color-box'){
        navigator.clipboard.writeText(child.getAttribute('data-color'))
        copySounds.volume = 0.4;
        copySounds.play();
        generateToastMessage(`${child.getAttribute('data-color')} Copied`)
    }
}

/**
 *  Handle Save to Custom Color
 */
function handleSaveToCustomBtn(inputHex, customColorsParent){
    return function(){
        const color = `#${inputHex.value}`
        if(customColors.includes(color)){
            alert('Already Saved Color')
            return
        }
        customColors.unshift(color)
        if(customColors.length > 24){
            customColors = customColors.slice(0, 24)
        }

        localStorage.setItem('custom-colors', JSON.stringify(customColors))

        removeChildren(customColorsParent)
        displayColorBoxes(customColorsParent, customColors)
    }
}
function handleBgFileInputBtn (bgFileInput){
    return function(){
        bgFileInput.click()
    }
}
function handleBgFileInput(bgPreview, bgFileDeleteBtn, bgController){
    return function(event){
        const file = event.target.files[0]
        const imgUrl = URL.createObjectURL(file)
        bgPreview.style.background = `url(${imgUrl})`
        document.body.style.background = `url(${imgUrl})`
        bgFileDeleteBtn.style.display = 'inline'
        bgController.style.display = 'block'
    }
}

function handleBgFileDeleteBtn(bgPreview, bgFileDeleteBtn, bgFileInput, bgController){
    return function(){
        bgPreview.style.background = `#dddeee`
        document.body.style.background = `#dddeee`
        bgFileDeleteBtn.style.display = 'none'
        bgFileInput.value = null
        bgController.style.display = 'none'
    }
}

// ==//==//==// DOM Function //==//==//==
/**
 * Update dom elements with calculated color values
 * @param {object} color
 */
function updateColorCodeToDom(color){
    let hexColor = generateHexColor(color)
    let rgbColor = generateRGBColor(color)

    document.getElementById('color-display').style.backgroundColor = `#${hexColor}`
    document.getElementById('color-input-hex').value = hexColor
    document.getElementById('color-input-rgb').value = rgbColor
    document.getElementById('color-slider-label-red').innerText = color.red
    document.getElementById('color-slider-label-green').innerText = color.green
    document.getElementById('color-slider-label-blue').innerText = color.blue
    document.getElementById('color-slider-input-red').value = color.red
    document.getElementById('color-slider-input-green').value = color.green
    document.getElementById('color-slider-input-blue').value = color.blue

}

/**
 * Generate a Dynamic DOM Element to show a Toast message
 * @param {String} msg
 */
function generateToastMessage(msg){
    toastContainer = document.createElement('div')
    toastContainer.innerText = msg
    toastContainer.className = 'toast-message toast-message-slider-in'

    toastContainer.addEventListener('click', function(){
        toastContainer.classList.remove('toast-message-slider-in')
        toastContainer.classList.add('toast-message-slider-out')

        toastContainer.addEventListener('animationend', function(){
            toastContainer.remove()
            toastContainer = null
        })
    })

    document.body.appendChild(toastContainer)
}

/**
 * Find the Checked Elements form a list of Radio Buttons
 * @param {Array} nodes 
 * @returns {string / null}
 */
function getCheckedValueFormRadios(nodes){
    let checkedValue = null

    for(let i = 0; i < nodes.length; i++){
        if(nodes[i].checked) {
            checkedValue = nodes[i].value
            break;
        }
    }
    return checkedValue;
}

/**
 * Create a div Element width class Name color-box
 * @param {string} color 
 * @returns {object}
 */
function generateColorBox(color){
    const presetBoxDiv = document.createElement('div')
    presetBoxDiv.className = 'color-box'
    presetBoxDiv.style.backgroundColor = color
    presetBoxDiv.setAttribute('data-color', color)
    return presetBoxDiv
}

/**
 * This function will Create and append new color boxes to it's Parent
 * @param {object} parent 
 * @param {Array} colors 
 */
function displayColorBoxes(parent, colors){
    colors.forEach((color) => {
        const colorBox = generateColorBox(color)
        parent.appendChild(colorBox)
    })
}

/**
 * Remove all children from Parent
 * @param {object} parent 
 */
function removeChildren(parent){
    let child = parent.lastElementChild;
    while(child){
        parent.removeChild(child);
        child = parent.lastElementChild
    }
}


function changeBackgroundPreferences(){
    document.body.style.backgroundSize = document.getElementById('bg-size').value
    document.body.style.backgroundRepeat = document.getElementById('bg-repeat').value
    document.body.style.backgroundPosition = document.getElementById('bg-position').value
    document.body.style.backgroundAttachment = document.getElementById('bg-attachment').value
}



// ==//==//==// Utils Function //==//==//==
/**
 * Generate and return an object of three color decimal values
 * @returns {Object}
 */
 function generateColorDecimal(){
    const red = Math.floor(Math.random() * 255)
    const green = Math.floor(Math.random() * 255)
    const blue = Math.floor(Math.random() * 255)

    return {
        red,
        green,
        blue,
    }
}

/**
 * take a color object of three decimal and values and return a hexadecimal color code
 * @param {object} color;
 * @returns {string}
 */
function generateHexColor({red, green, blue}){
    const getTowCode = (value) => {
        const hex = value.toString(16)
        return hex.length == 1 ? `0${hex}` : hex
    }

    return `${getTowCode(red)}${getTowCode(green)}${getTowCode(blue)}`.toUpperCase()
}

/**
 * Take a color object of three decimal and values and return a rgb color code
 * @param {object} color;
 * @returns {string}
 */
 function generateRGBColor({red, green, blue}){
    return `rgb(${red}, ${green}, ${blue})`
}

/**
 * @param {string} color;
 * @returns {boolean}
 */
 function isValidHex(color){
    if(color.length !== 6) return false
    return /^[0-9A-Fa-f]{6}$/i.test(color)
};

/**
 * Convert hex color to decimal colors object
 * @param {string} hex
 * @returns {object}
 */
 function hexToDecimalColors(hex){
    const red = parseInt(hex.slice(0, 2), 16 )
    const green = parseInt(hex.slice(2, 4), 16 )
    const blue = parseInt(hex.slice(4), 16 )

    return {
        red,
        green,
        blue
    }
}