
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
    },
    GetAllEntitiesLogicalNameAPIUrl: function ()
    {

        var serverURL = ITLecXrmUtilsURL.GetClientURL();

        var allEntitiesURL = serverURL + "/api/data/v8.0/EntityDefinitions?$select=LogicalName";

        return allEntitiesURL;
    }
};

var ITLecXrmUtilsEntity = {

    GetCurrentId: function () {
        return ITLecXrmUtils.GetXrm().Page.data.entity.getId();
    }
};

var ITLecXrmUtilsMetaData = {

    ///GetAllEntitiesLogicalName("FunctionName")
    /* Function Example

        function fillOptionSet_CallBack(data) {

        }
    */
   //  ArrAllEntitiesLogicalName,
    GetAllEntitiesLogicalNameAsync: function (GetAllEntitiesLogicalName_CallBack) {
        
        var allEntitiesURL = ITLecXrmUtilsURL.GetAllEntitiesLogicalNameAPIUrl();
        
        ITLecHTTPUtilsRequest.GetAsync(allEntitiesURL, GetAllEntitiesLogicalName_CallBack);
    },
    GetAllEntitiesLogicalName: function ()
    {
        //if (ArrAllEntitiesLogicalName)
        var allEntitiesURL = ITLecXrmUtilsURL.GetAllEntitiesLogicalNameAPIUrl();

        var data = ITLecHTTPUtilsRequest.GetODataObjectResult(allEntitiesURL);


        data.value.sort(function (o1, o2) {
            var t1 = o1.LogicalName.toLowerCase(), t2 = o2.LogicalName.toLowerCase();
            return t1 > t2 ? 1 : t1 < t2 ? -1 : 0;
        });

        return data.value;
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

var ITLecHTMLUtilsControlOption = {

    AddItem: function (optionId, optionText, optionValue) {
        var x = document.getElementById(optionId);
        var option = document.createElement("option");
        option.text = optionText;
        option.value = optionValue;
        x.add(option);
    },
    SetSelectedItem: function (optionId, valueToSelect) {
        var element = document.getElementById(optionId);
        element.value = valueToSelect;
    },
    Clear: function (optionId)
    {
       var optionControl= document.getElementById(optionId);
        var i;
        for (i = optionControl.options.length - 1; i >= 0; i--) {
            optionControl.remove(i);
        }
    }
};

var ITLecHTMLUtilsControl =
    {
        GetValue: function (controlId)
        {
            var val = document.getElementById(controlId).value;
            return val;
        }
    };
var ITLecHTTPUtilsRequest = {

    GetODataResponseText: function (url) {
        
        if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
            xmlhttp = new XMLHttpRequest();
        }
        else {// code for IE6, IE5
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.open("GET", url, false);
        xmlhttp.setRequestHeader("X-Requested-Width", "XMLHttpRequest");
        xmlhttp.setRequestHeader("Accept", "application/json, text/javascript, */*");
        xmlhttp.send(null);
        return xmlhttp.responseText;
    },
    GetODataObjectResult: function (url) {
        str = ITLecHTTPUtilsRequest.GetODataResponseText(url);
        var data = eval('(' + str + ')');
        return data;
    },
    PostAsync: function (_Url, functionName) {
        var retrieveReq = new XMLHttpRequest();

        retrieveReq.open("POST", _Url, true);
        retrieveReq.setRequestHeader("Accept", "application/json");
        retrieveReq.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        retrieveReq.setRequestHeader("OData-MaxVersion", "4.0");
        retrieveReq.setRequestHeader("OData-Version", "4.0");

        retrieveReq.onreadystatechange = function () { ITLecHTTPUtilsRequest._CallBack(this, functionName); };
        retrieveReq.send();
    },
    GetAsync: function (_Url, functionName) {
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

var ITLecXrmUtilsTextBox = {
    

    SetAutoComplete: function (fieldName, arr) {
        

        /*
        arr = [
            { name: 'A. Datum Corporation', code: 'A01' },
            { name: 'Adventure Works Cycles', code: 'A02' }
        ];*/

        var keyPressFcn = function (ext) {
            try {
                var userInput = ITLecXrmUtils.GetXrm().Page.getControl(fieldName).getValue();
                resultSet = {
                    results: new Array(),
                    commands: {
                        id: "sp_commands",
                        label: "Learn More",
                        action: function () {
                            // Specify what you want to do when the user
                            // clicks the "Learn More" link at the bottom
                            // of the auto-completion list.
                            // For this sample, we are just opening a page
                            // that provides information on working with
                            // accounts in CRM.
                            window.open("www.itlec.com");
                        }
                    }
                };

                var userInputLowerCase = userInput.toLowerCase();
                for (i = 0; i < arr.length; i++) {
                    // if (userInputLowerCase === arr[i].name.substring(0, userInputLowerCase.length).toLowerCase()) {
                    if (arr[i].name.toLowerCase().indexOf( userInputLowerCase)!= -1 ) {
                        resultSet.results.push({
                            id: i,
                            fields: [arr[i].name]
                        });
                    }
                    if (resultSet.results.length >= 20) break;
                }

                if (resultSet.results.length > 0) {
                    ext.getEventSource().showAutoComplete(resultSet);
                } else {
                    ext.getEventSource().hideAutoComplete();
                }
            } catch (e) {
                // Handle any exceptions. In the sample code,
                // we are just displaying the exception, if any.
                console.log(e);
            }
        };

        ITLecXrmUtils.GetXrm().Page.getControl(fieldName).addOnKeyPress(keyPressFcn);
    },

    SetAutoCompleteWithEntityNames: function (fieldName) {
        
        var arr = ITLecXrmUtilsMetaData.GetAllEntitiesLogicalName();

       var  newArr = new Array();

       arr.forEach(function (item) {
            var obj = new Object();
            obj.code = item.LogicalName;
            obj.name = item.LogicalName;
            newArr.push(obj);
       });
       ITLecXrmUtilsTextBox.SetAutoComplete(fieldName, newArr);
    }


};
