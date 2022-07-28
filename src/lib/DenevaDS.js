window.SMO = {
    vars: {},
    id: "",
    event_new_datasource: "event_new_datasource",
    event_start: "event_start",
    event_get_variable: "event_get_variable",
    event_current_stram: "event_current_stream",
    event_info_current_location: "event_info_current_location",
    event_set_salida_data: "event_set_salida_data",
    event_update_from_salida: "event_update_from_salida",
    init: function() {
        var match,
            pl = /\+/g,
            search = /([^&=]+)=?([^&]*)/g,
            decode = function(s) {
                return decodeURIComponent(s.replace(pl, " "));
            },
            query = window.location.search.substring(1);
        while (match = search.exec(query)) {
            this.vars[decode(match[1])] = decode(match[2]);
        }
     
        if (this.vars.idSmo) {
            this.id = this.vars.idSmo;
            return;
        }
        console.warn("No idSmo found in URL");
    },
    start: function() {
        /*window.addEventListener(SMO.event_start, function(){})*/
        window.addEventListener(SMO.event_start, function(){})
        var event = new CustomEvent(this.event_start);
        window.dispatchEvent(event);
    },
    setDatasource: function(datasource) {
        /*window.addEventListener(SMO.event_new_datasource, function(data){})*/
        var event = new CustomEvent(this.event_new_datasource, { 'detail': datasource.xml });
        window.dispatchEvent(event);
    },
    getVariable: function(data) {
        /* data = {variable: codigoVariable, valor: valorVariable } */
        /*  window.addEventListener(SMO.event_get_variable, function(data){}) */
        var event = new CustomEvent(this.event_get_variable, data);
        window.dispatchEvent(event);
    },
    setCurrentStream: function(stream) {
        /* stream = string */
        /*  window.addEventListener(SMO.event_current_stream, function(data){}) */
        var event = new CustomEvent(this.event_current_stream, stream);
        window.dispatchEvent(event);
    },
    infoCurrentLocation: function(data) {
        /* {"top": "x","left": "y","width": "ancho","height": "alto"} */
        /*  window.addEventListener(SMO.event_info_current_location, function(data){}) */
        var event = new CustomEvent(this.event_info_current_location, data);
        window.dispatchEvent(event);
    },
    setSalidaData: function(data) {
        /* data = {

                    "dataKey": "SLIDE_HASHES",

                    "data": [

                    {

                    "codigo": "500271",

                    "idioma": "27",

                    "denominacion": "nombre slide",

                    "hash": "03D358736906A95CCF171029D3442A2A"

                    }

                    ]

                } */
         /* window.addEventListener(SMO.event_set_salida_data, function(data){}) */
        var event = new CustomEvent(this.event_set_salida_data, data);
        window.dispatchEvent(event);
    },
    getDatasource: function getDatasource() {
        if (SMO.vars.url == undefined) {
            Dnv.smoCallbacks.getFile(SMO.vars.LocalData);
            return;
        }
        Dnv.smoCallbacks.getFile(SMO.vars.url);

    },
    startCheckDatasource: function startCheckDatasource() {
        setTimeout(function() { SMO.getDatasource(); }, 1000);
        setInterval(function() {
            SMO.getDatasource();
        }, 10000);
    },
    updatefromsalida: function(data) {
        /* data ={} */
        /*  window.addEventListener(SMO.event_update_from_salida, function(data){}) */
        var event = new CustomEvent(this.event_update_from_salida, data);
        window.dispatchEvent(event);
    }
};

window.Dnv = {
    init: function() {
        window.onmessage = function(e) {
            if (e.data.target) {
                try {
                    var targets = e.data.target.split('.');
                    var fn = window;
                    var obj = window;
                    for (var i = 0; i < targets.length; i++) {
                        obj = fn;
                        fn = obj[targets[i]];
                    }
                    fn.call(obj, e.data.objData); // conservamos el valor de this
                } catch (ex) {
                    //Si no ha podido llamar es porque no existe el entorno

                }
            }
        };
    },
    Utils: {
        dataToJSON: function dataToJSON(data) {
            try {
                console.log("[Dnv.Utils.dataToJSON] Transformamos los datos a JSON");
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(data.xml, "text/xml");
                var dataForJSON = xmlDoc.getElementsByTagName("item")[0].innerHTML;
                dataForJSON = dataForJSON.replace(/{'/g, '{"').replace(/'}/g, '"}').replace(/:'/g, ':"').replace(/':/g, '":').replace(/,'/g, ',"').replace(/',/g, '",').replace(/\['/g, '["').replace(/'\]/g, '"]').replace(/(\r\n|\n|\r)/gm, "");
                return JSON.parse(dataForJSON);
            } catch (error) {
                console.error("[Dnv.Utils.dataToJSON] Error al transformar los datos a JSON. Error: " + error.message);
                return {};
            }
        }
    },
    LogLevel: {
        Debug: 0,
        Info: 1,
        Warning: 2,
        Error: 3
    },
    AlarmaLevel: {
        Ok_off: 0,
        Ok: 1,
        Scanning: 2,
        Timeout: 3,
        Warning: 4,
        Error: 5
    },

    smoCallbacks: {
        onSmoLoad: function() {
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.onSmoLoad",
                objData: undefined,
                idSmo: window.SMO.id
            }, "*");
        },
        onSmoReady: function() {
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.onSmoReady",
                objData: undefined,
                idSmo: window.SMO.id
            }, "*");
        },
        smoLog: function(msn, level) {
            //level = Dnv.LogLevel.Debug...
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.smoLog",
                objData: {
                    level: level,
                    txt: msn
                },
                idSmo: window.SMO.id
            }, "*");
        },
        smoAlarma: function(msn, level) {
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.smoAlarma",
                objData: {
                    level: level,
                    txt: msn
                },
                idSmo: window.SMO.id
            }, "*")
        },
        reiniciarDispositivo: function(msn) {
            //Permite reiniciar el player, proporcionando una razón para el reinicio. Solo Player HTML5
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.reiniciarDispositivo",
                objData: {
                    txt: msn // Razón del reinicio 
                },
                idSmo: window.SMO.id
            }, "*");
        },
        urlNext: function() {
            //Permite avanzar plantilla. Solo si Reloj Maestro activado.
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.urlNext",
                objData: undefined,
                idSmo: window.SMO.id
            }, "*");
        },
        exitInteractivity: function() {
            //Para canales interactivos, vuelve al canal de reposo. Solo Android y Player PC.
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.exitInteractivity",
                objData: undefined,
                idSmo: window.SMO.id
            }, "*");
        },
        showBrowser: function() {
            /* DEPRECATED NOT IMPLEMENTED */
        },
        closeBrowser: function() {
            /* DEPRECATED NOT IMPLEMENTED */
        },
        urlNextDirectamente: function() {
            /* NOT IMPLEMENTED */
        },
        setVariable: function(variable, valor) {
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.setVariable",
                objData: {
                    variable: variable,
                    valor: valor
                },
                idSmo: window.SMO.id
            }, "*");
        },
        getVariable: function() {
            window.parent.postMessage({
                target: "Dnv.smoCallbacks.getVariable",
                objData: {
                    variable: ""
                },
                idSmo: window.SMO.id
            }, "*");
            /* MIRAR SMO.getVariable */
        },
        getFile: function(file) {
            parent.postMessage({
                target: "Dnv.smoCallbacks.getFile",
                objData: file,
                idSmo: window.SMO.id
            }, "*");
        },
        setLocalData: function(variable, valor) {
            parent.postMessage({
                target: "Dnv.smoCallbacks.setLocalData",
                objData: {
                    nameData: variable,
                    data: valor
                },
                idSmo: window.SMO.id
            }, "*");
        },
        getLocalData: function(variable) {
            parent.postMessage({
                target: "Dnv.smoCallbacks.getLocalData",
                objData: variable, // nameData 
                idSmo: window.SMO.id
            }, "*");
            /* MIRAR SMO.setDatasource */
        },
        getCurrentStream: function() {

            parent.postMessage({
                target: "Dnv.smoCallbacks.getCurrentStream",
                objData: undefined,
                idSmo: window.SMO.id
            }, "*");
            /* MIRAR SMO.setCurrentStream' */
        },
        finAviso: function(id) {
            arent.postMessage({
                target: "Dnv.smoCallbacks.finAviso",
                objData: id, // id del aviso 
                idSmo: window.SMO.id
            }, "*");
        },
        refreshDatasource: function(codigo) {
            parent.postMessage({
                target: "Dnv.smoCallbacks.refreshDatasource",
                objData: codigo, // Codigo del datasource 
                idSmo: window.SMO.id
            }, "*");
        },
        getLocation: function() {
            parent.postMessage({
                target: "Dnv.smoCallbacks.getLocation",
                objData: undefined,
                idSmo: window.SMO.id
            }, "*");
            /* MIRAR SMO.infoCurrentLocation   */
        },
        getSalidaData: function(data) {
            parent.postMessage({
                target: "Dnv.smoCallbacks.getSalidaData",
                objData: data, // Nombre del "data" que solicita. El player recibe ese string y hace un select case del mismo para devolver un json con datos al smo\html5 que le ha invocado.  
                idSmo: window.SMO.id
            }, "*");
            /* MIRAR SMO.setSalidaData */
        },
        ejecutaFuncion: function(data) {
            /*data ={
                    funcion: "", // Nombre de la función que se debe ejecutar  
                    params: "" // Parámetros que debemos enviarle a la funcion. sin separadores ni nada, un string y se usa como tal. Solo esta implementada en un caso y se usa como tal sin parsear ni nada 
                } */
            parent.postMessage({
                target: "Dnv.smoCallbacks.ejecutaFuncion",
                objData: data,
                idSmo: window.SMO.id
            }, "*");
        },
        addObserver: function(data) {
            /*data ="fruta"
             */
            parent.postMessage({
                target: "Dnv.smoCallbacks.addObserver",
                objData: data,
                idSmo: window.SMO.id
            }, "*");
        },
        notify: function(data) {
            /*data ={
                    destino: "fruta",
                    value: "{'fruta':'manzana', 'color':'roja'}"
                } */
            parent.postMessage({
                target: "Dnv.smoCallbacks.notify",
                objData: data,
                idSmo: window.SMO.id

            }, "*");
        },
        playOnceChannelByTrigger: function(trigger) {
            parent.postMessage({
                target: "Dnv.smoCallbacks.playOnceChannelByTrigger",
                objData: { triggerCanal: trigger },
                idSmo: window.SMO.id
            }, "*");
        },
        stopPlayOnceChannelByTrigger: function() {
            parent.postMessage({ target: "Dnv.smoCallbacks.stopPlayOnceChannelByTrigger", objData: {}, idSmo: window.SMO.id }, "*");
        },
        playOnceChannel: function(codigoCanal) {
            parent.postMessage({ target: "Dnv.smoCallbacks.playOnceChannel", objData: { codigoCanal: codigoCanal, params: "PLAYONCE_CHANNEL|" + codigoCanal }, idSmo: window.SMO.id }, "*");
        },
        stopPlayOnceChannel: function() {
            parent.postMessage({ target: "Dnv.smoCallbacks.stopPlayOnceChannel", objData: {}, idSmo: window.SMO.id }, "*");
        }


    }
}
SMO.init();
Dnv.init();