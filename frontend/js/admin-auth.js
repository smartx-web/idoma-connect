const TOKEN_KEY = "admin_token";

function getToken(){
    return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(){
    return {
        "Content-Type":"application/json",
        "Authorization":"Bearer " + getToken()
    };
}

function requireLogin(){

    const token = getToken();

    if(!token){
        window.location.href="login.html";
    }
}

function logout(){

    localStorage.removeItem(TOKEN_KEY);

    window.location.href="login.html";
}
