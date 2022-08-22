//URL example -> https://svrdnv4.iconmultimedia.com/WSResources/RemoteResources.asmx/GetKey?id=4053364 -> https:// SMO.vars["RemoteControlIP"] + SMO.vars["WebServiceURLMaster"] + "/GetKey?id=" + SMO.vars["ObjIDSalida"]
//https://svrdnv4.iconmultimedia.com/dscontrol/ServicioAvisosWeb/RemoteControl/GetKey?id=4258702
//"https://" + SMO.vars["RemoteControlIP"] + "/dscontrol/ServicioAvisosWeb/RemoteControl/GetKey?"  + SMO.vars["id"]

//Global Vars
var key = "";
var nombreSMO = "QR Remote Control";

//SmoVars
function defaultVars() {
  //Generales
  SMO.vars["ModoPresentacion"] ? "" : (SMO.vars["ModoPresentacion"] = 3);
  SMO.vars["Lang"] ? "" : (SMO.vars["Lang"] = "ES");

  //Especificas
  SMO.vars["id"] ? "" : (SMO.vars["id"] = "4258702");
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
      /* var url = "http://wwww.denevads.es";
      makeQR(url); */
      makeQRRemote(false);
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
      /* var url = SMO.vars["WebServiceURLMaster"] + "/GetKey?id=" + SMO.vars["ObjectIdSalida"]; //Salida */
      /* Ruta por verificar
      var url = "https://" + SMO.vars["RemoteControlIP"] + "/dscontrol/ServicioAvisosWeb/RemoteControl/GetKey?" + SMO.vars["id"]; */
      var url = "https://svrdnv4.iconmultimedia.com/dscontrol/ServicioAvisosWeb/RemoteControl/GetKey?id=" + SMO.vars["id"];
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (haveParameters) URL: " + url + ".", Dnv.LogLevel.Info);
      request(url, "GET");
      //setTimeout() 5s
      setInterval(function intervalRequest() {
        request(url, "GET");
      }, 5000);
    } else {
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (haveParameters) No params, pintamos URL predef.", Dnv.LogLevel.Info);
      console.log("No params. Pintamos QR por defecto.");
      makeQRRemote(false);
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
    var xhr = new XMLHttpRequest();
  } else {
    var xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  try {
    xhr.onreadystatechange = function () {
      try {
        if (xhr.readyState == 4 && xhr.status == 200) {
          console.info("State download JSON: " + this.readyState + "\n status: " + this.status + ". JSON download.");
          Dnv.smoCallbacks.smoLog(
            "[SMO " + nombreSMO + "] (request) State download JSON: " + this.readyState + ", status: " + this.status + ". JSON download: " + JSON.stringify(data),
            Dnv.LogLevel.Info
          );
          var data = JSON.parse(xhr.response);

          if (data.inUse == "true") {
            //Si esta en uso, NO QR
            Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) La clave ESTA EN USO", Dnv.LogLevel.Info);
            document.getElementById("qrcode").innerHTML = "";
            var body = document.querySelector("body");
            body.style.backgroundColor = "transparent";
          }

          if (data.inUse == "false") {
            Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Creamos NUEVO QR", Dnv.LogLevel.Info);
            var body = document.querySelector("body");
            body.style.backgroundColor = "white";
            makeQRRemote(data.key);
          }
        } else if (xhr.readyState == 4 && xhr.status == 0) {
          makeQRRemote(false);
        } else {
          console.info("State download JSON: " + this.readyState + "\n status: " + this.status);
          Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (getJson) State download JSON: " + this.readyState + ", status: " + this.status + ".", Dnv.LogLevel.Info);
        }
      } catch (error) {
        Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.", Dnv.LogLevel.Error);
        console.info("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.");
        makeQRRemote(false);
      }
    };

    xhr.open(method, url, true);

    xhr.send(null);
  } catch (error) {
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.", Dnv.LogLevel.Error);
    console.info("[SMO " + nombreSMO + "] (request) Error en la request, error: " + error.message + ". Pintamos QR con url predef.");
    makeQRRemote(false);
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
  document.getElementById("qrcode").innerHTML = "";
  var qrcode = new QRCode(document.getElementById("qrcode"), {
    width: 1080,
    height: 1080,
  });
  if (el == false) {
    Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (makeQRRemote) QR con URL: http://wwww.denevads.es", Dnv.LogLevel.Info);
    qrcode.makeCode("http://wwww.denevads.es"); // dentro del () introducir el valor del QR
  } else {
    if (!SMO.vars["RemoteControlIP"]) {
      var param = SMO.vars["WebServiceURLMaster"].split("WSResources")[0];
      var url = param + "denevacuatro/main/remoteControl/remoteControl.aspx?key=" + el; //key got xml
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (makeQRRemote) QR con URL: " + url + ".", Dnv.LogLevel.Info);
    } else {
      var url = "http://" + SMO.vars["RemoteControlIP"] + "/denevacuatro/main/remoteControl/remoteControl.aspx?key=" + el;
      Dnv.smoCallbacks.smoLog("[SMO " + nombreSMO + "] (makeQRRemote) QR con URL: " + url + ".", Dnv.LogLevel.Info);
    }
    // http://acceso.denevacuatro.com/denevacuatro/main/remoteControl/remoteControl.aspx
    qrcode.makeCode(url); // dentro del () introducir el valor del QR
  }
}

//Eliminate error caracters of the URL
function unescapeHTML(escapedHTML) {
  return escapedHTML.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
