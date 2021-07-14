function Validator(options) {
  const formElement = document.querySelector(options.form);
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      } else {
        element = element.parentElement;
      }
    }
  }

  const listRules = {};
  function validateForm(inputElement, rule) {
    if (inputElement) {
      const errElement = getParent(
        inputElement,
        options.formGroup
      ).querySelector(options.errElement);

      if (Array.isArray(listRules[rule.item])) {
        listRules[rule.item].push(rule.check);
      } else {
        listRules[rule.item] = [rule.check];
      }

      inputElement.onblur = function () {
        // errMessage = rule.check(inputElement.value);
        let errMessage;
        let rules = listRules[rule.item];
        // for/of là duyệt qua các value của arr hoặc object
        for (let i of rules) {
          //   console.log(i);
          errMessage = i(inputElement.value);
          if (errMessage) {
            break;
          }
        }
        if (errMessage) {
          errElement.innerText = errMessage;
          getParent(inputElement, options.formGroup).classList.add("invalid");
        } else {
          errElement.innerText = "";
          getParent(inputElement, options.formGroup).classList.remove(
            "invalid"
          );
        }
      };
      inputElement.oninput = function () {
        errElement.innerText = "";
        getParent(inputElement, options.formGroup).classList.remove("invalid");
      };
    }
  }

  //   submit form

  formElement.onsubmit = function (e) {
    let checkSubmit = true;
    // console.log(listRules);
    e.preventDefault();
    options.rules.forEach((rule) => {
      const inputElement = formElement.querySelector(rule.item);

      if (inputElement) {
        const errElement = getParent(
          inputElement,
          options.formGroup
        ).querySelector(options.errElement);

        let errMessage;
        let rules = listRules[rule.item];
        // for/of là duyệt qua các value của arr hoặc object
        for (let i of rules) {
          switch (inputElement.type) {
            case "radio":
            case "checkbox":
              errMessage = i(formElement.querySelector(rule.item + ":checked"));
              break;
            default:
              errMessage = i(inputElement.value);
          }

          if (errMessage) {
            break;
          }
        }

        if (errMessage) {
          errElement.innerText = errMessage;
          checkSubmit = false;
          getParent(inputElement, options.formGroup).classList.add("invalid");
        } else {
          errElement.innerText = "";
          getParent(inputElement, options.formGroup).classList.remove(
            "invalid"
          );
        }
      }
    });
    if (checkSubmit) {
      if (typeof options.onSubmit === "function") {
        const inputValue = formElement.querySelectorAll("[name]");
        const dataForm = Array.from(inputValue).reduce((values, input) => {
          switch (input.type) {
            case "radio":
              values[input.name] = formElement.querySelector(
                'input[name="' + input.name + '"]:checked'
              ).value;
              break;

            case "checkbox":
              console.log(input.name);
              if (!input.matches(":checked")) {
                if (!values[input.name]) {
                  values[input.name] = "";
                }

                return values;
              }

              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            case "file":
              values[input.name] = input.files;
              break;

            default:
              values[input.name] = input.value;
          }
          return values;
        }, {});
        console.log(dataForm);
        // console.log(inputValue);
      }
    }
  };

  if (formElement) {
    options.rules.forEach((rule) => {
      const inputElements = formElement.querySelectorAll(rule.item);
      //   console.log("s", inputElements);
      Array.from(inputElements).forEach((inputElement) => {
        // console.log(inputElement);
        validateForm(inputElement, rule);
      });
    });
    console.log(listRules);
  }
}
Validator.isRequired = function (item, message) {
  return {
    item,
    check: function (value) {
      return value ? undefined : message || "Không được để trống";
    },
  };
};
Validator.isEmail = function (item, message) {
  return {
    item,
    check: function (value) {
      const regex =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return regex.test(value) ? undefined : message || "Sai định dạng email";
    },
  };
};
Validator.minLength = function (item, min, message) {
  return {
    item,
    check: function (value) {
      return value.length >= min ? undefined : message || "Sai định dạng";
    },
  };
};
Validator.confirmPassword = function (item, getPass, message) {
  return {
    item,
    check: function (value) {
      return value === getPass() ? undefined : message || " sai password";
    },
  };
};
