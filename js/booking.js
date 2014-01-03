(function ($) {
    "use strict";
    var s;
    var LHBooking = {
        settings: {
            validation_rules: {
                string: {
                    regex: /^[a-zA-Z-]*$/,
                    msg: "Please enter A-Z characters only"
                },
                number: {
                    regex: /^[0-9]*$/,
                    msg: "Please enter a number"
                },
                email: {
                    regex: /^([_a-z0-9-]+)(\.[_a-z0-9-]+)*@([a-z0-9-]+)(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/,
                    msg: "Please enter a valid e-mail address"
                },
                date: {
                    regex: /^[0-9.]*$/,
                    msg: "Please enter a date"
                },
                phone: {
                    regex: /^[0-9.-\/]*$/,
                    msg: "Please enter a valid phone number"
                },
                required: {
                    msg: "This field is required"
                }
            }
        },
        init: function () {
            s = this.settings;
            this.bindUI();
            if ($(".new").length > 0) {
                this.updateId();
            } else if ($(".bookings").length > 0) {
                this.getBookings();
            }
        },
        bindUI: function () {
            $(".booking").on("submit", $.proxy(this.submitForm, this));
            $("body").on("change", ".status", $.proxy(this.saveChanges, this));
        },
        submitForm: function (e) {
            if (this.validate(e)) {
                this.saveForm();
            }
        },
        validate: function (e) {
            var $target = $(e.target);
            var _this = this;
            var is_valid = true;
            e.preventDefault();
            if ($target[0].nodeName === "FORM") { //validate forms only 
                $(".error-msg").remove();
                $target.find("input").not("input[type='submit'], input[type='hidden']").each(function () {
                    var $this = $(this);
                    var value = $this.val();
                    var rules = $(this).data("validate").split(" ");
                    $this.removeClass("error");
                    if (rules.indexOf("required") > -1 && value === "") {
                        _this.addError($this, s.validation_rules.required.msg);
                        is_valid = false;
                    } else {
                        $.each(rules, function () {
                            var rule = this;
                            var regex;
                            if (rule !== "required" && value !== "") {
                                regex = s.validation_rules[rule].regex;
                                if (!regex.test(value)) {
                                    _this.addError($this, s.validation_rules[rule].msg);
                                    is_valid = false;
                                }
                            }
                        });
                    }
                });
            }
            return is_valid;
        },
        addError: function (trg, ct) {
            trg.after("<span class='error-msg'>" + ct + "</span>").addClass("error");
        },
        saveForm: function () {
            var lh_bookings = (localStorage.getItem('LHbookings')) ? JSON.parse(localStorage.getItem('LHbookings')) : {};
            var ser_obj = {};
            var obj = {};
            var id;
            var arr = $(".booking").serializeArray();
            this.updateId(); //just in case there was an other booking since the page was loaded (not likely on localstorage...)
            $.each(arr, function () {
                if (this.name !== "id") {
                    if (ser_obj[this.name]) {
                        if (!ser_obj[this.name].push) {
                            ser_obj[this.name] = [ser_obj[this.name]];
                        }
                        ser_obj[this.name].push(this.value || "");
                    } else {
                        ser_obj[this.name] = this.value || "";
                    }
                } else {
                    id = this.value;
                }
            });
            obj[id] = ser_obj;
            $.extend(lh_bookings, obj);
            localStorage.setItem('LHbookings', JSON.stringify(lh_bookings));
            this.resetForm();
            this.updateId();
        },
        updateId: function () {
            var obj;
            var id;
            if (localStorage.getItem('LHbookings') != null) {
                obj = JSON.parse(localStorage.getItem('LHbookings'));
                id = Object.keys(obj).length + 1;
            } else {
                id = 1;
            }
            $("#id").val(id);
        },
        resetForm: function () {
            $(".booking").find("input").not("input[type='submit'], input[type='hidden']").val("");
        },
        getBookings: function () {
            var obj;
            if (localStorage.getItem('LHbookings') != null) {
                obj = JSON.parse(localStorage.getItem('LHbookings'));
                this.showBookings(obj);
            }
        },
        showBookings: function (obj) {
            var list_item;
            var html = "";
            for (var key in obj) {
                list_item = obj[key];
                html += this.showBooking(key, list_item);
            }
            $(".entries").html(html);
        },
        showBooking: function (id, obj) {
            var value;
            var status;
            var html = "<div id='" + id + "' class='entry'>";
            for (var key in obj) {
                value = obj[key];
                html += " ";
                if (key !== "booking_status") {
                    html += "<p>" + key + ": <span class='" + key + "'>" + value + "</span></p>";
                } else {
                    status = value;
                }
            }
            switch (status) {
            case "booked":
                html += "<select class='status'><option value='booked' selected>Not arrived</option><option value='seated'>Seated</option></select></div>";
                break;
            case "seated":
                html += "<select class='status'><option value='booked'>Not arrived</option><option value='seated' selected>Seated</option></select></div>";
                break;
            default:
                html += "<select class='status'><option value='booked' selected>Not arrived</option><option value='seated'>Seated</option></select></div>";
            }
            return html;
        },
        saveChanges: function (e) {
            var $target = $(e.target);
            var value = $target.val();
            var id = $target.parent().attr("id");
            var booking_obj = (localStorage.getItem("LHbookings") != null) ? JSON.parse(localStorage.getItem('LHbookings')) : {};
            var line_obj = booking_obj[id];
            var new_obj = {};
            new_obj.booking_status = value;
            $.extend(line_obj, new_obj);
            booking_obj[id] = line_obj;
            localStorage.setItem('LHbookings', JSON.stringify(booking_obj));
        }
    };
    LHBooking.init();

})(jQuery);