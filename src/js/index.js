//URL example -> https://svrdnv4.iconmultimedia.com/WSResources/RemoteResources.asmx/GetKey?id=4053364 -> https:// SMO.vars["RemoteControlIP"] + SMO.vars["WebServiceURLMaster"] + "/GetKey?id=" + SMO.vars["ObjIDSalida"]

//Global Vars
var key = "";
var isDraw = false;
var url;
var xhr;
var nombreSMO = "QR Remote Control";

//SmoVars
function defaultVars() {
  //Generales
  SMO.vars["ModoPresentacion"] = 3;
  SMO.vars["Lang"] = "ES";

  //Especificas
  SMO.vars["RemoteControlIP"] = "svrdnv4.iconmultimedia.com";
  SMO.vars["ServiceMethod"] = "remoteControl.aspx";
  SMO.vars["WebServiceURLMaster"] = "WSResources/RemoteResources.asmx";
  SMO.vars["ObjectID"] = 4195525;
  SMO.vars["ObjectId"] = 4195525; //Id del Salida;
  /* SMO.vars["ObjIdSalida"] = 4097789; //Id Salida */
  SMO.vars["ObjIdSalida"] = 4053364;
  SMO.vars["ObjectIdSalida"] = 4053364;
}

//Init
function initSMO() {
  try {
    console.log("[SMO " + nombreSMO + "] (initSMO) Iniciando SMO.");
    LogUtils.write(
      "[SMO " + nombreSMO + "] (initSMO) Iniciando SMO.",
      LogUtils.LEVEL_INFO
    );

    //Introduction Defaultvars
    defaultVars();

    //Registramos las callbacks
    SMO.init({});

    if (SMO.vars["WebServiceURLMaster"].match("pts")) {
      SMO.vars["RemoteControlIP"] = "pts.denevacuatro.com";
    } else if (SMO.vars["WebServiceURLMaster"].match("svrdnv4")) {
      SMO.vars["RemoteControlIP"] = "svrdnv4.iconmultimedia.com";
    } else if (SMO.vars["WebServiceURLMaster"].match("acceso")) {
      SMO.vars["RemoteControlIP"] = "acceso.denevacuatro.com";
    }
    
    if (SMO.vars["ModoPresentacion"] == "5") {
      //Estamos en Produccion, el smartObject no necesita hacer más para cargarse
      //Siempre en este orden, al registrarnos en el player Android, ignorará la llamada del getFlashDatasource, asi evitamos algo de consumo de recursos.
      SmoEvent.raise(SmoEvent.ON_READY);
      haveParameters(
        SMO.vars["WebServiceURLMaster"],
        SMO.vars["ObjectIdSalida"]
      );
    } else {
      url = "http://wwww.denevads.es";
      makeQR(url);
    }

    sizing();

    window.addEventListener("resize", sizing);
  } catch (e) {
    console.error("Error: " + e);
    LogUtils.write(
      "[SMO " + nombreSMO + "] (initSMO) ERROR: " + e.message,
      LogUtils.LEVEL_ERROR
    );
  }
}

//If have SMO.vars choose URL
//URL example -> https://svrdnv4.iconmultimedia.com/WSResources/RemoteResources.asmx/GetKey?id=3839895 -> https:// SMO.vars["RemoteControlIP"] + SMO.vars["WebServiceURLMaster"] + "/GetKey?id=" + SMO.vars["ObjIDSalida"]
function haveParameters(param1, param2) {
  try {
    if (param1 && param2) {
      var url =
        SMO.vars["WebServiceURLMaster"] +
        "/GetKey?id=" +
        SMO.vars["ObjectIdSalida"]; //Salida

      request(url, "GET");
      //setTimeout() 5s
      setInterval(function intervalRequest() {
        request(url, "GET");
      }, 5000);
      console.log("Have params. Pintamos QR con url: " + SMO.vars["url"]);
      LogUtils.write(
        "[SMO " +
          nombreSMO +
          "] (HaveParameters) Tenemos params. Url: " +
          SMO.vars["url"],
        LogUtils.LEVEL_INFO
      );
    } else {
      var url = "http://www.denevads.es";
      makeQR(url);
      console.log("No params. Pintamos QR por defecto.");
      LogUtils.write(
        "[SMO " + nombreSMO + "] (HaveParameters) ERROR: no params.",
        LogUtils.LEVEL_INFO
      );
    }
  } catch (e) {
    console.log("No params. Pintamos QR por defecto.");
    LogUtils.write(
      "[SMO " + nombreSMO + "] (HaveParameters) ERROR: no params.",
      LogUtils.LEVEL_INFO
    );
  }
}

//XMLHTTPREQUEST
function request(url, method) {
  if (window.XMLHttpRequest) {
    xhr = new XMLHttpRequest();
  } else {
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  xhr.onreadystatechange = function () {
    try {
      if (xhr.readyState == 4 && xhr.status == 200) {
        var data = xhr.responseXML.documentElement.textContent;
        //Getting XML & Eliminate error caracters response
        var rpl = unescapeHTML(
          data
            .replace(/(\r\n|\n|\r)/gm, "")
            .replace(
              '<?xml version="1.0" encoding="utf-8"?><string xmlns="http://localhost/">',
              ""
            )
            .replace("</string>", "")
        );
        //Parsing response XML & catching dato
        var doc = xmlParse(rpl);

        var item = doc.getElementsByTagName("item")[0];
        if (item.getAttribute("inUse")) {
          var isUse = item.getAttribute("inUse"); //IMPORTANT! Return String!!
          //Hide QR & show an image with errors & information
          if (key != item.getAttribute("key") && isUse != "True") {
            key = item.getAttribute("key");
            var body = document.querySelector("body");
            body.style.backgroundColor = "white";
            makeQRRemote(key);
          }

          if (isUse == "True") {
            document.getElementById("qrcode").innerHTML = "";
            var body = document.querySelector("body");
            body.style.backgroundColor = "transparent";
          }
          console.log("Request OK.");
          LogUtils.write(
            "[SMO " +
              nombreSMO +
              "] (request) Request OK.",
            LogUtils.LEVEL_INFO
          );
        } else {
          dommie = "http://wwww.denevads.es";
          makeQR(dommie);
          console.error("No recoge datos del XML. Pintamos web por defecto.");
          LogUtils.write(
            "[SMO " +
              nombreSMO +
              "] (Request) ERROR: No recoge datos del XML. Pintamos web por defecto.",
            LogUtils.LEVEL_ERROR
          );
        }
      }
    } catch (error) {
      console.error("El error es: " + error);
      LogUtils.write(
        "[SMO " +
          nombreSMO +
          "] (Request) ERROR: No recoge datos del XML." +
          e.message,
        LogUtils.LEVEL_ERROR
      );
      dommie = "http://wwww.denevads.es";
      makeQR(dommie);
    }
  };

  xhr.open(method, url, true);

  xhr.send(null);
}

//---------
//QR responsive
function sizing() {
  var size =
    window.innerHeight >= window.innerWidth
      ? window.innerWidth
      : window.innerHeight;
  var container = document.getElementById("container");
  container.style.height = size + "px";
  container.style.width = size + "px";
}

/* Create QR URL of final QR
-> https://svrdnv4.iconmultimedia.com/denevacuatro/main/remoteControl/remoteControl.aspx?key=07065734-95BF-45F5-A486-C2440CF0CA9B */
function makeQRRemote(el) {
  if (!SMO.vars["RemoteControlIP"]) {
    var param = SMO.vars["WebServiceURLMaster"].split("WSResources")[0];
    var url =
      param + "denevacuatro/main/remoteControl/remoteControl.aspx?key=" + el; //key got xml
  } else {
    var url =
      "http://" +
      SMO.vars["RemoteControlIP"] +
      "/denevacuatro/main/remoteControl/remoteControl.aspx?key=" +
      el;
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
  document.getElementById("qrcode").innerHTML = "";

  var qrcode = new QRCode(document.getElementById("qrcode"), {
    width: 1080,
    height: 1080,
  });
  qrcode.makeCode(el); // dentro del () introducir el valor del QR
}
