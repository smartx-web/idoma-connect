const API = "http://localhost:8080/api/v1/auth/login";

const form = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const button = document.getElementById("loginBtn");
const message = document.getElementById("message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    button.disabled = true;
    button.textContent = "Signing in...";
    message.textContent = "";

    try {

        const response = await fetch(API,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                username:username.value.trim(),
                password:password.value
            })
        });

        const result = await response.json();

        if(!response.ok || !result.success){
            throw new Error(result.message);
        }

        localStorage.setItem("admin_token", result.token);

        message.className="message success";
        message.textContent="Login successful";

        setTimeout(()=>{
            window.location.href="index.html";
        },600);

    }catch(error){

        message.className="message error";
        message.textContent=error.message;

    }finally{

        button.disabled=false;
        button.textContent="Sign In";
    }
});
