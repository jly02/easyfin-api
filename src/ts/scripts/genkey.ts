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
 * Request API to register the given username and generate a new API key
 */
const genkey = async () => {
    let infoField: HTMLElement = document.getElementById("infoField");
    let keyfield: HTMLElement = document.getElementById("apikey");

    /* [not in use for now]
    const response: Response = await fetch('https://easyfin-api.herokuapp.com/update-users', {
        method: 'POST',
        body: result,
        headers: {'Content-Type': 'application/json'} 
    });
    */

    keyfield.textContent = 'thing';
    infoField.textContent = "Generated API Key! Press 'Show Key' and store your key somewhere, you will not be able to recover it if you lose it!";
}