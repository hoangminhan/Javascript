function Validator(options) {
  const formElement = document.querySelector(options.form);

  const listRule = {};

  function getParent(inputElement, selectForm) {
    while (inputElement.parentElement) {
      if (inputElement.parentElement.matches(selectForm)) {
        return inputElement.parentElement;
      }
      inputElement = inputElement.parentElement;
    }
  }
  formElement.onsubmit = function (event) {
    event.preventDefault();
    let chekcSubmit = true;

    options.rules.forEach((rule) => {
      const inputElement = formElement.querySelector(rule.itemSelect);
      const errElement = getParent(
        inputElement,
        options.formGroup
      ).querySelector(options.errSelect);
      let errMessage;
      let rules = listRule[rule.itemSelect];

      for (let i of rules) {
        switch (inputElement.type) {
          case "radio":
            errMessage = i(
              formElement.querySelector(rule.itemSelect + ":checked")
            );
            break;
          default:
            errMessage = i(inputElement.value);
        }
        if (errMessage) break;
      }

      if (errMessage) {
        chekcSubmit = false;

        errElement.innerText = errMessage;
        getParent(inputElement, options.formGroup).classList.add("invalid");
      } else {
        getParent(inputElement, options.formGroup).classList.remove("invalid");
        errElement.innerText = "";
      }
    });
    if (chekcSubmit) {
      const inputValue = formElement.querySelectorAll("[name]");
      let dataForm = Array.from(inputValue).reduce((values, input) => {
        switch (input.type) {
          case "radio":
            values[input.name] = formElement.querySelector(
              'input[name="' + input.name + '"]:checked'
            ).value;
            break;
          case "checkbox":
            console.log(input);
            if (!input.matches(":checked")) {
              if (!values[input.name]) {
                values[input.name] = "";
              }
              return values;
            } else {
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            }
          case "file":
            values[input.name] = input.files;
            break;
          default:
            values[input.name] = input.value;
            break;
        }
        return values;
      }, {});
      options.submitForm(dataForm);
    }
  };

  function validateForm(inputElement, rule) {
    if (Array.isArray(listRule[rule.itemSelect])) {
      listRule[rule.itemSelect].push(rule.check);
    } else {
      listRule[rule.itemSelect] = [rule.check];
    }
    inputElement.onblur = function () {
      const errElement = getParent(
        inputElement,
        options.formGroup
      ).querySelector(options.errSelect);

      let errMessage;
      let rules = listRule[rule.itemSelect];

      for (let i of rules) {
        errMessage = i(inputElement.value);
        if (errMessage) break;
      }

      if (errMessage) {
        errElement.innerText = errMessage;
        getParent(inputElement, options.formGroup).classList.add("invalid");
      } else {
        getParent(inputElement, options.formGroup).classList.remove("invalid");
        errElement.innerText = "";
      }
    };
    inputElement.oninput = function () {
      getParent(inputElement, options.formGroup).classList.remove("invalid");
      getParent(inputElement, options.formGroup).querySelector(
        options.errSelect
      ).innerText = "";
    };
  }

  if (formElement) {
    options.rules.forEach((rule) => {
      const inputElements = document.querySelectorAll(rule.itemSelect);
      Array.from(inputElements).forEach((inputElement) => {
        validateForm(inputElement, rule);
      });
    });
  }
}
Validator.isRequired = function (itemSelect, message) {
  return {
    itemSelect,
    check: function (value) {
      return value ? undefined : message || "Không được để trống";
    },
  };
};
Validator.isEmail = function (itemSelect, message) {
  return {
    itemSelect,
    check: function (value) {
      const regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value) ? undefined : message || "Sai định dạng";
    },
  };
};

Validator.minLength = function (itemSelect, min, message) {
  return {
    itemSelect,
    check: function (value) {
      return value.length >= min ? undefined : message || "Nhập sai";
    },
  };
};

Validator.confirmPassword = function (itemSelect, getPass, message) {
  return {
    itemSelect,
    check: function (value) {
      return value === getPass() ? undefined : message || "Nhập sai mật khẩu";
    },
  };
};
