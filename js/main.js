/**
 * Lottery Retailer Portal - Main JavaScript
 * Handles form validation, interactions, and dynamic behaviors
 * State-Agnostic Wireframe Implementation
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validates email format
 */
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Validates phone number format
 */
function validatePhone(phone) {
  const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return re.test(phone);
}

/**
 * Validates SSN format
 */
function validateSSN(ssn) {
  const re = /^\d{3}-?\d{2}-?\d{4}$/;
  return re.test(ssn);
}

/**
 * Validates ZIP code format
 */
function validateZipCode(zip) {
  const re = /^\d{5}$/;
  return re.test(zip);
}

/**
 * Format phone number as user types
 */
function formatPhoneNumber(value) {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (match) {
    return !match[2] ? match[1] : `(${match[1]}) ${match[2]}${match[3] ? '-' + match[3] : ''}`;
  }
  return value;
}

/**
 * Format SSN as user types
 */
function formatSSN(value) {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{0,3})(\d{0,2})(\d{0,4})$/);
  if (match) {
    return !match[2] ? match[1] : `${match[1]}-${match[2]}${match[3] ? '-' + match[3] : ''}`;
  }
  return value;
}

/**
 * Calculate age from date of birth
 */
function calculateAge(dateString) {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Show form error message
 */
function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + 'Error');
  
  if (field && errorSpan) {
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');
    errorSpan.textContent = '⚠️ ' + message;
    errorSpan.classList.remove('hidden');
  }
}

/**
 * Show form success state
 */
function showSuccess(fieldId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + 'Error');
  
  if (field && errorSpan) {
    field.classList.remove('is-invalid');
    field.classList.add('is-valid');
    errorSpan.classList.add('hidden');
  }
}

/**
 * Clear field validation state
 */
function clearValidation(fieldId) {
  const field = document.getElementById(fieldId);
  const errorSpan = document.getElementById(fieldId + 'Error');
  
  if (field && errorSpan) {
    field.classList.remove('is-invalid', 'is-valid');
    errorSpan.classList.add('hidden');
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[type] || 'ℹ️';
  
  toast.innerHTML = `
    <span style="font-size: 1.5rem;">${icon}</span>
    <div style="flex: 1;">
      <p style="margin: 0; font-weight: 600;">${message}</p>
    </div>
  `;
  
  container.appendChild(toast);
  
  // Remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Slide out animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============================================
// REGISTRATION FORM
// ============================================

function initializeRegistrationForm() {
  const form = document.getElementById('registrationForm');
  if (!form) return;
  
  // Real-time validation
  const fullName = document.getElementById('fullName');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirmPassword = document.getElementById('confirmPassword');
  const phone = document.getElementById('phone');
  const address = document.getElementById('address');
  const securityQuestion = document.getElementById('securityQuestion');
  const securityAnswer = document.getElementById('securityAnswer');
  const terms = document.getElementById('terms');
  
  // Full Name validation
  if (fullName) {
    fullName.addEventListener('blur', function() {
      if (this.value.trim().length < 2) {
        showError('fullName', 'Please enter your full name');
      } else {
        showSuccess('fullName');
      }
    });
  }
  
  // Email validation
  if (email) {
    email.addEventListener('blur', function() {
      if (!validateEmail(this.value)) {
        showError('email', 'Please enter a valid email address');
      } else {
        // Simulate unique email check
        if (this.value.toLowerCase() === 'taken@example.com') {
          showError('email', 'This email is already registered');
        } else {
          showSuccess('email');
        }
      }
    });
  }
  
  // Password validation with strength indicator
  if (password) {
    password.addEventListener('input', function() {
      updatePasswordStrength(this.value);
      
      // Validate confirm password if filled
      if (confirmPassword && confirmPassword.value) {
        validatePasswordMatch();
      }
    });
    
    password.addEventListener('blur', function() {
      const value = this.value;
      if (value.length < 8) {
        showError('password', 'Password must be at least 8 characters');
      } else if (!/[a-zA-Z]/.test(value) || !/[0-9]/.test(value)) {
        showError('password', 'Password must contain letters and numbers');
      } else {
        showSuccess('password');
      }
    });
  }
  
  // Confirm Password validation
  if (confirmPassword) {
    confirmPassword.addEventListener('blur', validatePasswordMatch);
    confirmPassword.addEventListener('input', validatePasswordMatch);
  }
  
  function validatePasswordMatch() {
    if (password.value !== confirmPassword.value) {
      showError('confirmPassword', 'Passwords do not match');
    } else if (confirmPassword.value.length > 0) {
      showSuccess('confirmPassword');
    }
  }
  
  // Phone formatting and validation
  if (phone) {
    phone.addEventListener('input', function() {
      this.value = formatPhoneNumber(this.value);
    });
    
    phone.addEventListener('blur', function() {
      if (!validatePhone(this.value)) {
        showError('phone', 'Please enter a valid phone number');
      } else {
        showSuccess('phone');
      }
    });
  }
  
  // Address validation
  if (address) {
    address.addEventListener('blur', function() {
      if (this.value.trim().length < 10) {
        showError('address', 'Please enter your complete address');
      } else {
        showSuccess('address');
      }
    });
  }
  
  // Security Question validation
  if (securityQuestion) {
    securityQuestion.addEventListener('change', function() {
      if (!this.value) {
        showError('securityQuestion', 'Please select a security question');
      } else {
        showSuccess('securityQuestion');
      }
    });
  }
  
  // Security Answer validation
  if (securityAnswer) {
    securityAnswer.addEventListener('blur', function() {
      if (this.value.trim().length < 2) {
        showError('securityAnswer', 'Please enter an answer');
      } else {
        showSuccess('securityAnswer');
      }
    });
  }
  
  // Terms checkbox validation
  if (terms) {
    terms.addEventListener('change', function() {
      const errorSpan = document.getElementById('termsError');
      if (!this.checked) {
        errorSpan.classList.remove('hidden');
      } else {
        errorSpan.classList.add('hidden');
      }
    });
  }
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    
    if (!fullName.value.trim()) {
      showError('fullName', 'Please enter your full name');
      isValid = false;
    }
    
    if (!validateEmail(email.value)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (password.value.length < 8 || !/[a-zA-Z]/.test(password.value) || !/[0-9]/.test(password.value)) {
      showError('password', 'Password must be at least 8 characters with letters and numbers');
      isValid = false;
    }
    
    if (password.value !== confirmPassword.value) {
      showError('confirmPassword', 'Passwords do not match');
      isValid = false;
    }
    
    if (!validatePhone(phone.value)) {
      showError('phone', 'Please enter a valid phone number');
      isValid = false;
    }
    
    if (!address.value.trim()) {
      showError('address', 'Please enter your address');
      isValid = false;
    }
    
    if (!securityQuestion.value) {
      showError('securityQuestion', 'Please select a security question');
      isValid = false;
    }
    
    if (!securityAnswer.value.trim()) {
      showError('securityAnswer', 'Please enter an answer');
      isValid = false;
    }
    
    if (!terms.checked) {
      document.getElementById('termsError').classList.remove('hidden');
      isValid = false;
    }
    
    if (isValid) {
      // Show success modal
      document.getElementById('registeredEmail').textContent = email.value;
      document.getElementById('successModal').classList.add('active');
      showToast('Registration successful!', 'success');
    } else {
      showToast('Please fix the errors in the form', 'error');
    }
  });
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
  const bars = [
    document.getElementById('strengthBar1'),
    document.getElementById('strengthBar2'),
    document.getElementById('strengthBar3'),
    document.getElementById('strengthBar4')
  ];
  const label = document.getElementById('passwordStrengthLabel');
  
  if (!bars[0] || !label) return;
  
  // Reset bars
  bars.forEach(bar => {
    bar.classList.remove('active-weak', 'active-medium', 'active-strong');
  });
  
  if (password.length === 0) {
    label.textContent = '';
    return;
  }
  
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  // Determine strength level
  let level, className, text;
  
  if (strength <= 2) {
    level = 1;
    className = 'active-weak';
    text = 'Weak';
  } else if (strength <= 3) {
    level = 2;
    className = 'active-medium';
    text = 'Medium';
  } else {
    level = 3;
    className = 'active-strong';
    text = 'Strong';
  }
  
  // Apply to bars
  const barCount = Math.min(4, Math.ceil(strength * 4 / 5));
  for (let i = 0; i < barCount; i++) {
    bars[i].classList.add(className);
  }
  
  label.textContent = text;
}

// ============================================
// LOGIN FORM
// ============================================

function initializeLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;
  
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  
  // Email validation
  if (email) {
    email.addEventListener('blur', function() {
      if (!validateEmail(this.value)) {
        showError('email', 'Please enter a valid email address');
      } else {
        showSuccess('email');
      }
    });
  }
  
  // Password validation
  if (password) {
    password.addEventListener('blur', function() {
      if (this.value.length === 0) {
        showError('password', 'Please enter your password');
      } else {
        showSuccess('password');
      }
    });
  }
  
  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    let isValid = true;
    
    if (!validateEmail(email.value)) {
      showError('email', 'Please enter a valid email address');
      isValid = false;
    }
    
    if (!password.value) {
      showError('password', 'Please enter your password');
      isValid = false;
    }
    
    if (isValid) {
      // Simulate authentication
      const modal = document.getElementById('successModal');
      const continueBtn = document.getElementById('modalContinueBtn');
      
      // Determine redirect based on email
      let redirectUrl = 'dashboard.html';
      if (email.value.toLowerCase().includes('agency')) {
        redirectUrl = 'backoffice_application.html';
      }
      
      continueBtn.onclick = function() {
        window.location.href = redirectUrl;
      };
      
      modal.classList.add('active');
      showToast('Login successful!', 'success');
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
    } else {
      showToast('Please check your credentials', 'error');
    }
  });
}

// ============================================
// APPLICATION FORM (MULTI-STAGE)
// ============================================

let currentStage = 1;
const totalStages = 4;
let uploadedFiles = [];

function initializeApplicationForm() {
  const form = document.getElementById('applicationForm');
  if (!form) return;
  
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');
  const btnSaveDraft = document.getElementById('btnSaveDraft');
  
  // Navigation buttons
  if (btnNext) {
    btnNext.addEventListener('click', function() {
      if (validateCurrentStage()) {
        nextStage();
      }
    });
  }
  
  if (btnPrev) {
    btnPrev.addEventListener('click', prevStage);
  }
  
  if (btnSaveDraft) {
    btnSaveDraft.addEventListener('click', function() {
      showToast('Draft saved successfully', 'success');
    });
  }
  
  // Form submission
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateCurrentStage()) {
        submitApplication();
      }
    });
  }
  
  // Initialize field validations
  initializeStage1Validation();
  initializeStage2Validation();
  initializeStage3Validation();
  initializeStage4Validation();
}

/**
 * Navigate to next stage
 */
function nextStage() {
  if (currentStage >= totalStages) return;
  
  // Hide current stage
  document.getElementById(`stage${currentStage}`).style.display = 'none';
  
  // Update stage
  currentStage++;
  
  // Show next stage
  document.getElementById(`stage${currentStage}`).style.display = 'block';
  
  // Update progress
  updateProgress();
  
  // Update buttons
  updateNavigationButtons();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  // Update review summary if on stage 4
  if (currentStage === 4) {
    updateReviewSummary();
  }
}

/**
 * Navigate to previous stage
 */
function prevStage() {
  if (currentStage <= 1) return;
  
  // Hide current stage
  document.getElementById(`stage${currentStage}`).style.display = 'none';
  
  // Update stage
  currentStage--;
  
  // Show previous stage
  document.getElementById(`stage${currentStage}`).style.display = 'block';
  
  // Update progress
  updateProgress();
  
  // Update buttons
  updateNavigationButtons();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Update progress indicator
 */
function updateProgress() {
  const steps = document.querySelectorAll('.step');
  
  steps.forEach((step, index) => {
    const stepNum = index + 1;
    
    if (stepNum < currentStage) {
      step.classList.add('completed');
      step.classList.remove('active');
    } else if (stepNum === currentStage) {
      step.classList.add('active');
      step.classList.remove('completed');
    } else {
      step.classList.remove('active', 'completed');
    }
  });
}

/**
 * Update navigation buttons
 */
function updateNavigationButtons() {
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');
  
  // Show/hide previous button
  if (btnPrev) {
    btnPrev.style.display = currentStage > 1 ? 'block' : 'none';
  }
  
  // Show/hide next/submit buttons
  if (currentStage === totalStages) {
    if (btnNext) btnNext.style.display = 'none';
    if (btnSubmit) btnSubmit.style.display = 'block';
  } else {
    if (btnNext) btnNext.style.display = 'block';
    if (btnSubmit) btnSubmit.style.display = 'none';
  }
}

/**
 * Validate current stage
 */
function validateCurrentStage() {
  switch (currentStage) {
    case 1:
      return validateStage1();
    case 2:
      return validateStage2();
    case 3:
      return validateStage3();
    case 4:
      return validateStage4();
    default:
      return true;
  }
}

// ============================================
// STAGE 1 VALIDATION
// ============================================

function initializeStage1Validation() {
  // Phone formatting
  const phone = document.getElementById('phone');
  if (phone) {
    phone.addEventListener('input', function() {
      this.value = formatPhoneNumber(this.value);
    });
  }
  
  // SSN formatting
  const ssn = document.getElementById('ssn');
  if (ssn) {
    ssn.addEventListener('input', function() {
      this.value = formatSSN(this.value);
    });
  }
  
  // Date of Birth - Age validation
  const dob = document.getElementById('dateOfBirth');
  if (dob) {
    dob.addEventListener('change', function() {
      const age = calculateAge(this.value);
      const warning = document.getElementById('ageWarning');
      
      if (age < 18) {
        warning.classList.remove('hidden');
        showError('dateOfBirth', 'Applicant must be 18 years or older');
      } else {
        warning.classList.add('hidden');
        showSuccess('dateOfBirth');
      }
    });
  }
  
  // ZIP code validation
  const zipCode = document.getElementById('zipCode');
  if (zipCode) {
    zipCode.addEventListener('input', function() {
      this.value = this.value.replace(/\D/g, '').slice(0, 5);
    });
  }
}

function validateStage1() {
  let isValid = true;
  
  const fields = [
    { id: 'firstName', message: 'Please enter first name' },
    { id: 'lastName', message: 'Please enter last name' },
    { id: 'dateOfBirth', message: 'Please enter date of birth' },
    { id: 'ssn', message: 'Please enter a valid SSN', validator: validateSSN },
    { id: 'email', message: 'Please enter a valid email', validator: validateEmail },
    { id: 'phone', message: 'Please enter a valid phone number', validator: validatePhone },
    { id: 'streetAddress', message: 'Please enter street address' },
    { id: 'city', message: 'Please enter city' },
    { id: 'state', message: 'Please select a state' },
    { id: 'zipCode', message: 'Please enter a valid ZIP code', validator: validateZipCode }
  ];
  
  fields.forEach(field => {
    const input = document.getElementById(field.id);
    if (!input) return;
    
    const value = input.value.trim();
    
    if (!value) {
      showError(field.id, field.message);
      isValid = false;
    } else if (field.validator && !field.validator(value)) {
      showError(field.id, field.message);
      isValid = false;
    } else {
      showSuccess(field.id);
    }
  });
  
  // Check age
  const dob = document.getElementById('dateOfBirth');
  if (dob && dob.value) {
    const age = calculateAge(dob.value);
    if (age < 18) {
      showError('dateOfBirth', 'Applicant must be 18 years or older');
      isValid = false;
    }
  }
  
  if (!isValid) {
    showToast('Please fill in all required fields correctly', 'error');
  }
  
  return isValid;
}

// ============================================
// STAGE 2 VALIDATION
// ============================================

function initializeStage2Validation() {
  // No special initialization needed
}

function validateStage2() {
  let isValid = true;
  
  const lotteryType = document.getElementById('lotteryType');
  const licenseType = document.getElementById('licenseType');
  
  if (!lotteryType.value) {
    showError('lotteryType', 'Please select a lottery type');
    isValid = false;
  } else {
    showSuccess('lotteryType');
  }
  
  if (!licenseType.value) {
    showError('licenseType', 'Please select a license type');
    isValid = false;
  } else {
    showSuccess('licenseType');
  }
  
  if (!isValid) {
    showToast('Please fill in all required fields', 'error');
  }
  
  return isValid;
}

// ============================================
// STAGE 3 VALIDATION (FILE UPLOAD)
// ============================================

function initializeStage3Validation() {
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileInput = document.getElementById('fileInput');
  
  if (!fileUploadArea || !fileInput) return;
  
  // Click to upload
  fileUploadArea.addEventListener('click', function() {
    fileInput.click();
  });
  
  // Drag and drop
  fileUploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
  });
  
  fileUploadArea.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
  });
  
  fileUploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  });
  
  // File input change
  fileInput.addEventListener('change', function() {
    handleFiles(this.files);
  });
}

/**
 * Handle file uploads
 */
function handleFiles(files) {
  const fileList = document.getElementById('fileList');
  const filesContainer = document.getElementById('filesContainer');
  const documentType = document.getElementById('documentType');
  
  Array.from(files).forEach(file => {
    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showToast(`File "${file.name}" is too large. Max size: 10MB`, 'error');
      return;
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast(`File "${file.name}" has invalid format. Accepted: PDF, JPG, PNG`, 'error');
      return;
    }
    
    // Add to uploaded files
    const fileObj = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      type: documentType.value
    };
    
    uploadedFiles.push(fileObj);
    
    // Display file
    displayFile(fileObj);
    
    showToast(`File "${file.name}" uploaded successfully`, 'success');
  });
  
  // Show file list
  if (uploadedFiles.length > 0) {
    fileList.style.display = 'block';
  }
}

/**
 * Display uploaded file
 */
function displayFile(fileObj) {
  const filesContainer = document.getElementById('filesContainer');
  
  const fileItem = document.createElement('div');
  fileItem.className = 'file-item';
  fileItem.id = `file-${fileObj.id}`;
  
  fileItem.innerHTML = `
    <div class="file-item-info">
      <span style="font-size: 1.5rem;">📄</span>
      <div>
        <div class="file-item-name">${fileObj.name}</div>
        <div class="file-item-size">${fileObj.size} • ${fileObj.type}</div>
      </div>
    </div>
    <button type="button" class="file-item-remove" onclick="removeFile('${fileObj.id}')" aria-label="Remove file">
      ✕
    </button>
  `;
  
  filesContainer.appendChild(fileItem);
}

/**
 * Remove uploaded file
 */
function removeFile(fileId) {
  uploadedFiles = uploadedFiles.filter(f => f.id != fileId);
  
  const fileItem = document.getElementById(`file-${fileId}`);
  if (fileItem) {
    fileItem.remove();
  }
  
  const fileList = document.getElementById('fileList');
  if (uploadedFiles.length === 0 && fileList) {
    fileList.style.display = 'none';
  }
  
  showToast('File removed', 'info');
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function validateStage3() {
  // Optional: Files are not required, but if uploaded they must be valid
  return true;
}

// ============================================
// STAGE 4 VALIDATION (REVIEW & SUBMIT)
// ============================================

function initializeStage4Validation() {
  const notes = document.getElementById('notes');
  const flaggedIndicator = document.getElementById('flaggedIndicator');
  
  // Show flagged indicator when notes are entered
  if (notes && flaggedIndicator) {
    notes.addEventListener('input', function() {
      if (this.value.trim().length > 0) {
        flaggedIndicator.classList.remove('hidden');
      } else {
        flaggedIndicator.classList.add('hidden');
      }
    });
  }
}

/**
 * Update review summary
 */
function updateReviewSummary() {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const dob = document.getElementById('dateOfBirth').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const streetAddress = document.getElementById('streetAddress').value;
  const city = document.getElementById('city').value;
  const state = document.getElementById('state').value;
  const zipCode = document.getElementById('zipCode').value;
  
  const lotteryType = document.getElementById('lotteryType');
  const businessName = document.getElementById('businessName').value;
  const licenseType = document.getElementById('licenseType');
  
  // Update review fields
  document.getElementById('reviewName').textContent = `${firstName} ${lastName}`;
  document.getElementById('reviewDOB').textContent = dob || '-';
  document.getElementById('reviewEmail').textContent = email || '-';
  document.getElementById('reviewPhone').textContent = phone || '-';
  document.getElementById('reviewAddress').textContent = 
    `${streetAddress}, ${city}, ${state} ${zipCode}` || '-';
  
  document.getElementById('reviewLotteryType').textContent = 
    lotteryType.options[lotteryType.selectedIndex]?.text || '-';
  document.getElementById('reviewBusinessName').textContent = businessName || 'N/A';
  document.getElementById('reviewLicenseType').textContent = 
    licenseType.options[licenseType.selectedIndex]?.text || '-';
  
  document.getElementById('reviewDocCount').textContent = uploadedFiles.length;
}

function validateStage4() {
  const consent = document.getElementById('consent');
  
  if (!consent.checked) {
    document.getElementById('consentError').classList.remove('hidden');
    showToast('Please confirm the accuracy of the information', 'error');
    return false;
  } else {
    document.getElementById('consentError').classList.add('hidden');
  }
  
  return true;
}

// ============================================
// APPLICATION SUBMISSION
// ============================================

function submitApplication() {
  // Generate application number
  const appNumber = 'APP-' + Date.now().toString().slice(-8);
  
  // Check if flagged
  const notes = document.getElementById('notes').value;
  const isFlagged = notes.trim().length > 0;
  
  // Update confirmation modal
  document.getElementById('confirmAppNumber').textContent = appNumber;
  
  if (isFlagged) {
    document.getElementById('flaggedMessage').classList.remove('hidden');
  } else {
    document.getElementById('flaggedMessage').classList.add('hidden');
  }
  
  // Show confirmation modal
  document.getElementById('confirmationModal').classList.add('active');
  
  showToast('Application submitted successfully!', 'success');
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });
  
  // ESC key to close modals
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(modal => {
        modal.classList.remove('active');
      });
    }
  });
});
