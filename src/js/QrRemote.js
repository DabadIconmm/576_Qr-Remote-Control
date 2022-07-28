//URL example -> https://svrdnv4.iconmultimedia.com/WSResources/RemoteResources.asmx/GetKey?id=4053364 -> https:// SMO.vars["RemoteControlIP"] + SMO.vars["WebServiceURLMaster"] + "/GetKey?id=" + SMO.vars["ObjIDSalida"]

//Global Vars
var key = "";
var isDraw = false;
var xhr;
var nombreSMO = "QR Remote Control";
var dommie = "http://wwww.denevads.es";

//SmoVars
function defaultVars() {
  //Generales
  SMO.vars["ModoPresentacion"] ? "" : (SMO.vars["ModoPresentacion"] = 3);
  SMO.vars["Lang"] ? "" : (SMO.vars["Lang"] = "ES");

  //Especificas
  SMO.vars["RemoteControlIP"] ? "" : (SMO.vars["RemoteControlIP"] = "svrdnv4.iconmultimedia.com");
  SMO.vars["ServiceMethod"] ? "" : (SMO.vars["ServiceMethod"] = "remoteControl.aspx");
  SMO.vars["WebServiceURLMaster"] ? "" : (SMO.vars["WebServiceURLMaster"] = "WSResources/RemoteResources.asmx");
  SMO.vars["ObjectID"] ? "" : (SMO.vars["ObjectID"] = 4195525);
  SMO.vars["ObjectId"] ? "" : (SMO.vars["ObjectId"] = 4195525); //Id del Salida;
  /* SMO.vars["ObjIdSalida"] = 4097789; //Id Salida */
  SMO.vars["ObjIdSalida"] ? "" : (SMO.vars["ObjIdSalida"] = 4053364);
  SMO.vars["ObjectIdSalida"] ? "" : (SMO.vars["ObjectIdSalida"] = 4053364);
}

function initSMO() {
  try {
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (initSMO) Iniciando SMO.", Dnv.LogLevel.Info);
    console.log("[SMO " + nombreSMO + "] (initSMO) Iniciando SMO.");
    // Cargamos las variables por defecto.
    defaultVars();

    /* Debemos definir el comportamiento del SMO en cada uno de los modos de presentación.
     * IMPORTANTE: Rellenar cada modo, aunque sea redundante, en caso de simplificarlo, comentar el motivo.
     */
    if (SMO.vars["ModoPresentacion"] == 5) {
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (initSMO) Modo Presentacion: " + SMO.vars["ModoPresentacion"] + ".", Dnv.LogLevel.Info);
      haveParameters(SMO.vars["WebServiceURLMaster"], SMO.vars["ObjectIdSalida"]);
    } else {
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (initSMO) Modo Presentacion: " + SMO.vars["ModoPresentacion"] + ". Utilizamos Url Predef.", Dnv.LogLevel.Info);
      var url = "http://wwww.denevads.es";
      makeQR(url);
    }

    sizing();

    window.addEventListener("resize", sizing);
  } catch (e) {
    console.error("[SMO " + nombreSMO + "] (initSMO)  ERROR." + e.message);
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (initSMO)  ERROR." + e.message, Dnv.LogLevel.Error);
  }
}

//Comprobamos los parámetros para la petición del xml
function haveParameters(param1, param2) {
  Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (haveParameters) Comprobamos parámetros.", Dnv.LogLevel.Info);
  try {
    if (param1 && param2) {
      var url = SMO.vars["WebServiceURLMaster"] + "/GetKey?id=" + SMO.vars["ObjectIdSalida"]; //Salida
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (haveParameters) URL: " + url + ".", Dnv.LogLevel.Info);
      request(url, "GET");
      //setTimeout() 5s
      setInterval(function intervalRequest() {
        request(url, "GET");
      }, 5000);
    } else {
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (haveParameters) No params, pintamos URL predef.", Dnv.LogLevel.Info);
      var url = "http://www.denevads.es";
      console.log("No params. Pintamos QR por defecto.");
      makeQR(url);
    }
  } catch (e) {
    console.error("[SMO " + nombreSMO + "] (haveParameters)  ERROR." + e.message);
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (haveParameters)  ERROR." + e.message, Dnv.LogLevel.Error);
  }
}

//Petición de credenciales
function request(url, method) {
  Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Pedimos credenciales.", Dnv.LogLevel.Info);
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  try {
    xhr.onreadystatechange = function () {
      try {
        if (xhr.readyState == 4 && xhr.status == 200) {
          console.info("State download XML.: " + this.readyState + "\n status: " + this.status + ". XML download.");
          Dnv.smoCallbacks.smoLog(
            "[SMO " + nombreSMO + "] (request) State download XML.: " + this.readyState + ", status: " + this.status + ". XML download: " + JSON.stringify(data),
            Dnv.LogLevel.Info
          );
          var data = xhr.responseXML.documentElement.textContent;
          //Getting XML & Eliminate error caracters response
          var rpl = unescapeHTML(
            data
              .replace(/(\r\n|\n|\r)/gm, "")
              .replace('<?xml version="1.0" encoding="utf-8"?><string xmlns="http://localhost/">', "")
              .replace("</string>", "")
          );
          //Parsing response string to XML
          var parser = new DOMParser();
          var xmlDoc = parser.parseFromString(rpl, "text/xml");
          var item = xmlDoc.getElementsByTagName("item")[0];

          //Comprobación que tenemos el atributo "inUse" key
          if (item.getAttribute("inUse")) {
            var isUse = item.getAttribute("inUse"); //IMPORTANT! Return String!!
            //Hide QR & show an image with errors & information
            if (key != item.getAttribute("key") && isUse != "True") {
              Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Creamos NUEVO QR", Dnv.LogLevel.Info);
              key = item.getAttribute("key");
              var body = document.querySelector("body");
              body.style.backgroundColor = "white";
              makeQRRemote(key);
            }

            if (isUse == "True") {
              Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) La clave ESTA EN USO", Dnv.LogLevel.Info);
              document.getElementById("qrcode").innerHTML = "";
              var body = document.querySelector("body");
              body.style.backgroundColor = "transparent";
            }
          } else {
            makeQR(dommie);
            Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) No recoge datos del uso de la clave del XML. Pintamos web por defecto.", Dnv.LogLevel.Info);
            console.error("No recoge datos del uso de la clave del XML. Pintamos web por defecto.");
          }
        } else if (xhr.readyState == 4 && xhr.status == 0) {
          makeQR(dommie);
        } else {
          console.info("State download XML.: " + this.readyState + "\n status: " + this.status);
          Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (getJson) State download XML.: " + this.readyState + ", status: " + this.status + ".", Dnv.LogLevel.Info);
        }
      } catch (error) {
        Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.", Dnv.LogLevel.Error);
        console.info("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.");
        makeQR(dommie);
      }
    };

    xhr.open(method, url, true);

    xhr.send(null);
  } catch (error) {
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.", Dnv.LogLevel.Error);
    console.info("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.");
    makeQR(dommie);
  }
}

//---------
//QR responsive
function sizing() {
  var size = window.innerHeight >= window.innerWidth ? window.innerWidth : window.innerHeight;
  var container = document.getElementById("container");
  container.style.height = size + "px";
  container.style.width = size + "px";
}

/* Create QR URL of final QR
-> https://svrdnv4.iconmultimedia.com/denevacuatro/main/remoteControl/remoteControl.aspx?key=07065734-95BF-45F5-A486-C2440CF0CA9B */
function makeQRRemote(el) {
  if (!SMO.vars["RemoteControlIP"]) {
    var param = SMO.vars["WebServiceURLMaster"].split("WSResources")[0];
    var url = param + "denevacuatro/main/remoteControl/remoteControl.aspx?key=" + el; //key got xml
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (makeQRRemote) QR con URL: " + url + ".", Dnv.LogLevel.Info);
  } else {
    var url = "http://" + SMO.vars["RemoteControlIP"] + "/denevacuatro/main/remoteControl/remoteControl.aspx?key=" + el;
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (makeQRRemote) QR con URL: " + url + ".", Dnv.LogLevel.Info);
  }
  // http://acceso.denevacuatro.com/denevacuatro/main/remoteControl/remoteControl.aspx

  document.getElementById("qrcode").innerHTML = "";

  var qrcode = new QRCode(document.getElementById("qrcode"), {
    width: 1080,
    height: 1080,
  });
  qrcode.makeCode(url); // dentro del () introducir el valor del QR
}

function makeQR(el) {
  Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (makeQRRemote) QR con URL: " + el + ".", Dnv.LogLevel.Info);
  document.getElementById("qrcode").innerHTML = "";

  var qrcode = new QRCode(document.getElementById("qrcode"), {
    width: 1080,
    height: 1080,
  });
  qrcode.makeCode(el); // dentro del () introducir el valor del QR
}

//Eliminate error caracters of the URL
function unescapeHTML(escapedHTML) {
  return escapedHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
