
var ITLecXrmUtils = {

    GetXrm: function () {
        return typeof Xrm != "undefined" && typeof Xrm.Page != "undefined" ? Xrm : ITLecXrmUtils.GetWindowParent().Xrm;
    },

    GetJSON: function () {
        return typeof JSON != "undefined" ? JSON : ITLecXrmUtils.GetWindowParent().JSON;
    },

    GetWindowParent: function () {
        return window.parent;
    }
};

var ITLecXrmUtilsURL = {

    GetClientURL: function () {
        var context = ITLecXrmUtils.GetXrm().Page.context;
        var crmUrl = context.getClientUrl();
        return crmUrl;
    },

    GetOrganizationDataSvc: function () {

        var serverUrl = GetClientURL();
        var oDataPath = serverUrl + "/XRMServices/2011/OrganizationData.svc";
        return oDataPath;
    }
};

var ITLecXrmUtilsEntity = {

    GetCurrentId: function () {
        return ITLecXrmUtils.GetXrm().Page.data.entity.getId();
    }
};

var ITLecXrmUtilsWebResource = {

    GetParam: function (paramName) {
        var vals = new Array();
        if (location.search != "") {
            vals = location.search.substr(1).split("&amp;");
            for (var i in vals) {
                vals[i] = vals[i].replace(/\+/g, " ").split("=");
            }
            //look for the parameter named 'data'
            for (var i in vals) {
                if (vals[i][0].toLowerCase() == "data") {
                    return ITLecXrmUtilsWebResource.parseDataValue(vals[i][1], paramName);
                    break;
                }
            }
        }
        return 0;
    },

    parseDataValue: function (datavalue, paramName) {
        if (datavalue != "") {
            var vals = new Array();

            vals = decodeURIComponent(datavalue).split("&amp;");
            for (var i in vals) {
                vals[i] = vals[i].replace(/\+/g, " ").split("=");

                if (vals[i][0] == paramName) {
                    return vals[i][1];
                }
            }
        }
        return 0;
    }
};

var ITLecXrmUtilsControl = {

    GetControlValue: function (control) {
        var val = ITLecXrmUtils.GetXrm().Page.getAttribute(control).getValue();
        return val;
    },
    SetControlValue: function (control, value) {
        ITLecXrmUtils.GetXrm().Page.getAttribute(control).setValue(value);
        ITLecXrmUtils.GetXrm().Page.getAttribute(control).setSubmitMode("always");
    }
};

var ITLecHTMLUtilsControl = {

    AddItem_Option: function (optionId, optionText, optionValue) {
        var x = document.getElementById(optionId);
        var option = document.createElement("option");
        option.text = optionText;
        option.value = optionValue;
        x.add(option);
    },
    SetSelectedItem_Option: function (optionId, valueToSelect) {
        var element = document.getElementById(optionId);
        element.value = valueToSelect;
    }
};

var ITLecHTTPUtilsRequest = {

    Post: function (_Url, functionName) {
        var retrieveReq = new XMLHttpRequest();

        retrieveReq.open("POST", _Url, true);
        retrieveReq.setRequestHeader("Accept", "application/json");
        retrieveReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        retrieveReq.setRequestHeader("OData-MaxVersion", "4.0");
        retrieveReq.setRequestHeader("OData-Version", "4.0");

        retrieveReq.onreadystatechange = function () { ITLecHTTPUtilsRequest._CallBack(this, functionName); };
        retrieveReq.send();
    },
    Get: function (_Url, functionName) {
        var retrieveReq = new XMLHttpRequest();
        retrieveReq.open("GET", _Url, false);
        retrieveReq.setRequestHeader("Accept", "application/json");
        retrieveReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        
        retrieveReq.onreadystatechange = function () { ITLecHTTPUtilsRequest._CallBack(this, functionName); };
        retrieveReq.send();
    },

    _CallBack: function (retrieveReq, functionName) {

        if (retrieveReq.readyState == 4 /* complete */) {
            var retrieved = ITLecXrmUtils.GetJSON().parse(retrieveReq.responseText);//.d

            if (retrieved) {
                var record = retrieved;

                window[functionName](record);

            }
        }
    }
};
