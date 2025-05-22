import { loadUserTasks, initializeUserTasks } from "../userTasks.js";

function loadUsers(){
    try{
        return JSON.parse(localStorage.getItem('users')) || [];
    }catch (e) {
        console.error('Failed to load user from localStorage', e);
        return [];
    }
}

function saveUsers(users){
    localStorage.setItem('users', JSON.stringify(users));
}

export function signup(userData){
    const users = loadUsers();
    const exists = users.some(u => u.email === userData.email);
    if(exists){
        return null;
    }
    const newUser = { ...userData };
    initializeUserTasks(newUser.email)
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
}

export function login(email, password){

    if(!email || !password) return null;

    const users = loadUsers();
    console.log("Login attempt with email:", email, "password:", password);
    console.log("Users loaded from localStorage:", users);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    console.log("Trimmed and lowercased email:", trimmedEmail);
    console.log("Trimmed password:", trimmedPassword);

    const user = users.find(u => {
        console.log("Checking user:", u);
        if (!u || typeof u !== 'object') {
            console.log("Invalid user format in array.");
            return false;
        }
        const userEmail = String(u.email).trim().toLowerCase();
        const userPassword = String(u.password).trim();

        console.log("Comparing with stored user - Email:", userEmail, "Password:", userPassword);
        const emailMatch = userEmail === trimmedEmail;
        const passwordMatch = userPassword === trimmedPassword;
        console.log("Email match:", emailMatch, "Password match:", passwordMatch);

        return emailMatch && passwordMatch;
    });

    console.log("Login result - found user:", user);

    if(!user) return null;
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
}

export function logout(){
    localStorage.removeItem('currentUser');
}

export function getCurrentUser(){
    try{
        const user = JSON.parse(localStorage.getItem('currentUser')) || null;
        console.log("getCurrentUser: ", user);
        return user;
    }catch(e){
        console.error('Failed to load currentUser from local Storage', e)
        return null;
    }
}

export function updateCurrentUser(updates){
    const user = getCurrentUser();
    if(!user) return null;
    const updatedUser = { ...user, ...updates};
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));

    const users = loadUsers();
    const idx = users.findIndex(u => u.email === user.email);
    if(idx !== -1){
        users[idx] = updatedUser;
        saveUsers(users);
    }
    return updatedUser;
}
