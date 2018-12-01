#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

WebSocketsClient webSocket;
const char* ssid = "Hiep";
const char* password = "nhungdoicanh";
int motion;
int received = 0;
String sendStatus, sendStatusTemp = "id_28&motion&ON";

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch (type) { 
    case WStype_DISCONNECTED:   
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      break;
    case WStype_TEXT: 
      Serial.printf("[WSc] get text: %s\n", payload);
      break; 
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      break;
    }
}

void setup() {
 Serial.begin(115200);
 WiFi.begin(ssid, password);

 while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");

  webSocket.begin("smarthome-thesis-bku.herokuapp.com", 80); //port 80 is designated port for external access
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  motion = analogRead(A0);
  webSocket.loop();
  if ((motion>60)&&(motion<80)&&(received==0))
  {
    sendStatusTemp = "id_28&motion&ON";
  } else if (motion==1024){
    sendStatusTemp = "id_28&motion&OFF";
  }
  if (sendStatus != sendStatusTemp)
  {
    sendStatus = sendStatusTemp;
    webSocket.sendTXT(sendStatus);
    Serial.println(sendStatus);
  }
  delay(1000);
}
