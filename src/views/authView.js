import { getCurrentUser, updateCurrentUser } from '../services/authService.js';

function authView(title, id, fields, buttonText, errorId) {
  return `
    <form class="${id}-form auth-form" id="${id}Form">
      <h2 class="form-title">${title}</h2>
      <div class="form-inputs">
        ${fields.map(field => `
          <div class="input-box">
            <input 
              type="${field.type}" 
              name="${field.name}" 
              class="input-field" 
              placeholder="${field.placeholder}" 
              required 
              ${field.autocomplete || ''}
            >
            <i class="${field.icon} icon" aria-hidden="true"></i>
          </div>
        `).join('')}
        <div id="${errorId}" class="error-message"></div>
        ${id === 'signIn' ? `
          <div class="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>` : ''}
        <div class="input-box">
          <button type="submit" class="input-submit">
            <span>${buttonText}</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </form>
  `;
}

const signInFields = [ 
        {   
            type: 'text',
            name: 'email',
            placeholder: 'Email',
            icon: 'fa fa-user',
            autocomplete:'autocomplete="off"'
        },
        {
            type: 'password',
            name: 'password',
            placeholder: 'Password',
            icon: 'fas fa-lock',
            autocomplete: 'autocomplete="off"'
        }
    ];

const signUpFields = [
            { 
                type: 'text', 
                name: 'username', 
                placeholder: 'Username', 
                icon: 'fa fa-user' 
            },
            { 
                type: 'text', 
                name: 'designation', 
                placeholder: 'Designation', 
                icon: 'fa-solid fa-briefcase' 
            },
            { 
                type: 'text', 
                name: 'phoneNumber', 
                placeholder: 'Phone Number', 
                icon: 'fa-solid fa-phone' 
            },
            { 
                type: 'email', 
                name: 'email', 
                placeholder: 'Email', 
                icon: 'fa-solid fa-envelope' 
            },
            { 
                type: 'password', 
                name: 'password', 
                placeholder: 'Password', 
                icon: 'fas fa-lock' 
            }        
    ];

export function initAuthUI({ login, signup }){

    const container = document.querySelector('.col-2');

    container.innerHTML = `
        <div class="btn-box">
            <button class="btn btn-signin" id="signin">Sign In</button>
            <button class="btn btn-signUp" id="signup">Sign Up</button>
        </div>
        ${authView('Sign In', 'signIn', signInFields, 'Sign In', 'signInError')}
        ${authView('Sign Up', 'signUp', signUpFields, 'Sign Up', 'signUpError')}
    `;


    const signInForm = document.getElementById('signInForm');
    const signUpForm = document.getElementById('signUpForm');
    const signinBtn = document.getElementById('signin');
    const signupBtn = document.getElementById('signup');

    signInForm.style.display = 'block';
    signUpForm.style.display = "none";

    signinBtn.addEventListener('click', () => {
        signInForm.style.display = "block";
        signUpForm.style.display = 'none';
    });

    signupBtn.addEventListener('click', () => {
        signInForm.style.display = 'none';
        signUpForm.style.display = 'block';
    });

    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signInForm.email.value.trim();
        const password = signInForm.password.value.trim();
        console.log('login', email, password);
        login({ email, password }); 
    });

    signUpForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = signUpForm.username.value.trim();
        const designation = signUpForm.designation.value.trim();
        const phoneNumber = signUpForm.phoneNumber.value.trim();
        const email = signUpForm.email.value.trim();
        const password = signUpForm.password.value.trim();
        signup({ username, designation, phoneNumber, email, password });
    });
}

export function showLogoutButton(logout){
  const navLabels = document.querySelectorAll('.secondary-nav .nav-label');

  let logoutLink = null;

  navLabels.forEach(label => {
    if(label.textContent.trim().toLowerCase() === 'logout'){
      logoutLink = label.closest('.nav-link');
    }
  });

  if(logoutLink){
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }else{
    console.error("logout link not found");
  }
  
}


export function showError(type, message){
    const errorElement = document.getElementById(type === 'login' ? 'signInError' : 'signUpError');
    if(errorElement){
        errorElement.textContent = message;
    }
}


export function populateProfileDetails() {
    console.log("Attempting to populate profile details.");  
    const user = getCurrentUser();
    if (!user) {
        console.error("No current user found to populate profile details.");
        return;
    }
    console.log("Current user found:", user);

    const usernameEl = document.getElementById('username');
    const designationEl = document.getElementById('designation');
    const emailEl = document.getElementById('email');
    const birthDateEl = document.getElementById('birthDate');
    const aboutContentEl = document.getElementById('aboutContent');

    if (usernameEl) usernameEl.textContent = user.username || 'N/A';
    if (designationEl) designationEl.textContent = user.designation || 'N/A';
    if (emailEl) emailEl.textContent = user.email || 'N/A';
    if (birthDateEl) birthDateEl.textContent = user.birthDate || 'N/A'; 
    if (aboutContentEl) aboutContentEl.textContent = user.aboutContent || 'N/A'; 

    console.log("Profile details populated.");
}

export function initProfileEdit() {
    console.log("Attempting to initialize profile edit functionality.");
    const editButton = document.getElementById('editProfileBtn');
    const profileDetailsDiv = document.querySelector('.profile-details');

    if (!editButton || !profileDetailsDiv) {
        console.error("Profile edit elements not found.");
        return;
    }
    console.log("Profile edit elements found.");

    let isEditing = false;
    let originalDetailsHTML = profileDetailsDiv.innerHTML;

    editButton.addEventListener('click', () => {
        if (isEditing) {
            // Save functionality
            const updatedDetails = {
                username: document.getElementById('edit-username').value.trim(),
                designation: document.getElementById('edit-designation').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                birthDate: document.getElementById('edit-birthDate').value.trim(),
                aboutContent: document.getElementById('edit-aboutContent').value.trim(),
            };

            updateCurrentUser(updatedDetails);
            populateProfileDetails();
            profileDetailsDiv.innerHTML = originalDetailsHTML; 
            isEditing = false;
            editButton.innerHTML = '<i class="fa-solid fa-user-pen"></i>'; 
        } else {
            
            originalDetailsHTML = profileDetailsDiv.innerHTML; 
            const user = getCurrentUser();
            if (!user) {
                console.error("No current user found to edit profile details.");
                return;
            }

            profileDetailsDiv.innerHTML = `
                <div class="profile-name details">
                    <p class="name label-title">Username</p>
                    <input type="text" id="edit-username" value="${user.username || ''}">
                </div>
                <div class="profile-designation details">
                    <p class="designation label-title">Designation</p>
                    <input type="text" id="edit-designation" value="${user.designation || ''}">
                </div>
                <div class="profile-email details">
                    <p class="email label-title">Email</p>
                    <input type="email" id="edit-email" value="${user.email || ''}">
                </div>
                <div class="profile-dateOfBirth details">
                    <p class="birthdate label-title">Date of Birth</p>
                    <input type="date" id="edit-birthDate" value="${user.birthDate || ''}">
                </div>
                <div class="profile-about details">
                    <p class="about-me label-title">About</p>
                    <textarea id="edit-aboutContent">${user.aboutContent || ''}</textarea>
                </div>
                <button id="cancelProfileBtn">Cancel</button>
            `;

            document.getElementById('cancelProfileBtn').addEventListener('click', () => {
                profileDetailsDiv.innerHTML = originalDetailsHTML; 
                isEditing = false;
                editButton.innerHTML = '<i class="fa-solid fa-user-pen"></i>'; 
            });

            isEditing = true;
            editButton.textContent = 'Save'; 
        }
    });
}
