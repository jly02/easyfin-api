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
    let keyField: HTMLElement = document.getElementById("apikey");
    let usernameField: HTMLElement = document.getElementById("username");

    const response: Response = await fetch('https://easyfin-api.herokuapp.com/update-users', {
        method: 'POST',
        body: JSON.stringify({ username: usernameField.textContent }),
        headers: {'Content-Type': 'application/json'} 
    });
    
    const decoded = await response.json() as IRegisterResponse;

    keyField.textContent = decoded.apikey;
    infoField.textContent = decoded.message;
}

/**
 * Only for use within this for decoding JSON data.
 */
interface IRegisterResponse {
    message: string;
    apikey: string;
}