/**
 * Show and hide the API Key text field.
 */
const showkey = () => {
    let keyfield: HTMLElement = document.getElementById("apikey");

    if(keyfield.style.display === 'block') {
        keyfield.style.display = 'none';
    } else {
        keyfield.style.display = 'block';
    }
}

/**
 * Generate an API Key, but do not show it yet.
 */
const genkey = async () => {
    let infoField: HTMLElement = document.getElementById("infoField");
    let keyfield: HTMLElement = document.getElementById("apikey");

    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;

    for(let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    /* [not in use for now]
    const response: Response = await fetch('https://easyfin-api.herokuapp.com/update-users', {
        method: 'POST',
        body: result,
        headers: {'Content-Type': 'application/json'} 
    });
    */

    keyfield.textContent = result;
    infoField.textContent = "Generated API Key! Press 'Show Key' and store your key somewhere, you will not be able to recover it if you lose it!";
}