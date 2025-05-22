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
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
}

export function login(email, password){
    const users = loadUsers();
    const user = users.find(u => u.email === email && u.password === password);
    if(!user) return null;
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
}

export function logout(){
    localStorage.removeItem('currentUser');
}

export function getCurrentUser(){
    try{
        return JSON.parse(localStorage.getItem('currentUser')) || null;
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