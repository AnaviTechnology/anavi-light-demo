var mqttClient;
var host = "iot.eclipse.org";
var port = 443;
var path = "/ws";
var workgroup = "workgroup";
var machineid = "";

var topicTemperature = "";
var topicHumidity = "";

function changeColor(red, green, blue)
{
  var payload = '{ "effect":"solid", "color": {"r": '+ red + ', "g":'+ green +', "b":' + blue + ' } }'
  message = new Paho.MQTT.Message(payload);
  message.destinationName = "cmnd/"+machineid+"/color";
  mqttClient.send(message);
  messageBackwardCompat = new Paho.MQTT.Message(payload);
  messageBackwardCompat.destinationName = machineid+"/action/rgbled";
  mqttClient.send(messageBackwardCompat);

  // Send a couple of message for demonstrating ANAVI Miracle Controller
  miracleLed1 = new Paho.MQTT.Message(payload);
  miracleLed1.destinationName = "cmnd/"+machineid+"/led1/color";
  mqttClient.send(miracleLed1);

  miracleLed2 = new Paho.MQTT.Message(payload);
  miracleLed2.destinationName = "cmnd/"+machineid+"/led2/color";
  mqttClient.send(miracleLed2);
}

function onConnect() {
  $('#txtInfo').removeClass('d-none');
  $('#txtHost').text(host);
  $('#txtPort').text(port);
  $('#txtMachineId').text(machineid);
  localStorage['machineid'] = machineid;

  var topicPrefix = workgroup+"/"+machineid+"/air/";
  topicTemperature = topicPrefix+"temperature";
  console.log("Subscribing to topic: "+topicTemperature);
  mqttClient.subscribe(topicTemperature);
  topicHumidity = topicPrefix+"humidity";
  console.log("Subscribing to topic: "+topicHumidity);
  mqttClient.subscribe(topicHumidity);
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:"+responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:"+message.payloadString);
  try {
    var data = JSON.parse(message.payloadString);

    if (topicTemperature == message.destinationName) {
      $('#txtTemperature').text("Temperature: "+data.temperature.toFixed(2)+"C");
    }

    if (topicHumidity == message.destinationName) {
      $('#txtHumidity').text("Humidity: "+data.humidity.toFixed(0)+"%");
    }
  } catch (e) {
    console.log("Malformed data");
  }
}

$(document).ready(function() {

    if (window.location.hash) {
        machineid = window.location.hash.substring(1);
        window.location.hash = "";
    } else {
        machineid = localStorage['machineid'];
    }
    $('#machineid').val(machineid);

    $('#buttonConnect').on('click', function (e) {
         e.preventDefault();
         host = $('#host').val();
         if (0 == host.length)
         {
           host = "iot.eclipse.org";
         }

         port = $('#port').val();
         if (0 == port.length)
         {
           port = 80;
         }

         workgroup = $('#workgroup').val();
         if (0 == workgroup.length)
         {
           workgroup = "workgroup";
         }

         path = $('#path').val();
         if (0 == path.length)
         {
           path = "/ws";
         }

         machineid = $('#machineid').val();
         if (0 == machineid.length)
         {
           console.log("machine id not set");
           $('#alertConnect').removeClass('d-none');
           return;
         }

         console.log(host);
         console.log(port);
         console.log(workgroup);
         console.log(machineid);
         var mqttClientId = "LightDemo" + Math.floor((Math.random() * 1000) + 1);
         mqttClient = new Paho.MQTT.Client(host, Number(port), path, mqttClientId);

         // set callback handlers
         mqttClient.onConnectionLost = onConnectionLost;
         mqttClient.onMessageArrived = onMessageArrived;

         // connect the client
         mqttClient.connect({onSuccess:onConnect});

         $('#alertConnect').addClass('d-none');
         $("#pageConnect").addClass('d-none');
         $("#pageColorPicker").removeClass('d-none');
    });

    $('#buttonDisconnect').on('click', function (e) {
         e.preventDefault();
         mqttClient.disconnect();
         // reset old values
         $('#host').val('');
         $('#port').val('');
         $('#workgroup').val('');
         $('#machineid').val('');
         $("#pageColorPicker").addClass('d-none');
         $('#txtInfo').addClass('d-none');
         $("#pageConnect").removeClass('d-none');
    });

    $('#buttonColorCustom').on('change', function (e) {
        e.preventDefault();
        console.log(e.target.value);
        if(e.target.value.length == 7){
            var r = parseInt(e.target.value.substr(1,2),16);
            var g = parseInt(e.target.value.substr(3,2),16);
            var b = parseInt(e.target.value.substr(5,2),16);
            changeColor(r,g,b);
        }
    });

    $('#buttonColorMax').on('click', function (e) {
         e.preventDefault();
         changeColor(255, 255, 255);
    });

    $('#buttonColorRed').on('click', function (e) {
         e.preventDefault();
         changeColor(255, 0, 0);
    });

    $('#buttonColorGreen').on('click', function (e) {
         e.preventDefault();
         changeColor(0, 255, 0);
    });

    $('#buttonColorBlue').on('click', function (e) {
         e.preventDefault();
         changeColor(0, 0, 255);
    });

    $('#buttonColorOff').on('click', function (e) {
         e.preventDefault();
         changeColor(0, 0, 0);
    });
});
