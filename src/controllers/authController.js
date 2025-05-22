// import * as authService from '../services/authService.js';
// import * as authView from '../views/authView.js';
import { initAuthUI, showError, showLogoutButton } from '../views/authView.js';
import { login, signup } from '../services/authService.js';

export function initAuth(){
        initAuthUI({
            login : ({ email, password }) => {
                console.log('loginclicked');
                const user = login(email, password);
                console.log('user', user)
                if(!user){
                    showError('login', 'Invalid email or password');
                    return;
                }
               
                    location.reload();
            },
            signup: ( userData ) => {
                const newUser =  signup(userData);
               if(!newUser){
                    showError('signUp', 'user exxists');
                    return;
                }
               
                location.reload();
            
            }
        });
    
        showLogoutButton(() => {
          logout();
          location.reload();
        })
}
