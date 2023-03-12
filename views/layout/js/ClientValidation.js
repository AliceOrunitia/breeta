var ShowPasswordToggle = document.querySelector("[type='password']");
if (ShowPasswordToggle) {
  ShowPasswordToggle.onclick = function () {
    document.querySelector("#password").classList.add("input-password");
    document.getElementById("toggle-password").classList.remove("d-none");

    const passwordInput = document.querySelector("#password");
    const togglePasswordButton = document.getElementById("toggle-password");

    togglePasswordButton.addEventListener("click", togglePassword);
    function togglePassword() {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePasswordButton.setAttribute("aria-label", "Hide password.");
      } else {
        passwordInput.type = "password";
        togglePasswordButton.setAttribute(
          "aria-label",
          "Show password as plain text. " +
            "Warning: this will display your password on the screen."
        );
      }
    }
  };
}

function clientValidator() {
  "use strict";
  const forms = document.querySelectorAll(".validated-form");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        const formData = new FormData(form);
        if (
          formData.get("user[password]") &&
          !formData
            .get("user[password]")
            .match(
              /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
            )
        ) {
          event.preventDefault();
          event.stopPropagation();
          document.querySelector("#passwordLabel").innerText =
            "Password must contain at least 8 characters consisting of at least 1 number, symbol, and upper & lowercase letter";
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
}
clientValidator();

function passwordTester() {
  const password = document.querySelector("#password");
  return password.value.match(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
  )
    ? true
    : false;
}

function passwordMatcher() {
  const password = document.querySelector("#password");
  const passwordConfirmation = document.querySelector("#password-confirmation");
  return password.value === passwordConfirmation.value ? true : false;
}

function breetLengthSubmit() {
  const breetContent = document.querySelector("#breetContent").value.length;
  return breetContent >= 1 && breetContent < 300 ? true : false;
}

function breetLength() {
  const textArea = document.querySelector("#breetContent");
  const breetContent = document.querySelector("#breetContent").value.length;
  const submitButton = document.querySelector("#submitButton");
  const textcount = document.querySelector("#textcount");
  const contentFeedback = document.querySelector("#contentFeedback");

  if (breetContent >= 1 && breetContent < 300) {
    submitButton.classList.add("btn-success");
    submitButton.disabled = false;
  } else if (breetContent > 300) {
    contentFeedback.innerHTML = `Cannot be over 300 characters. Currently: ${breetContent}`;
    submitButton.disabled = true;
    textcount.innerHTML = `Must not be over 300 characters. Currently at: ${breetContent}`;
  } else {
    submitButton.disabled = true;
  }
}

// const myModal = document.getElementById("myModal");
// const myInput = document.getElementById("myInput");

// myModal.addEventListener("shown.bs.modal", function () {
//   myInput.focus();
// });
