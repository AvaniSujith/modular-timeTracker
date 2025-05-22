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
            placeholder: 'Email (Username)',
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
        login({ email, password }); // Pass an object with email and password
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
