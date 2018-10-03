#include <ESP8266WiFi.h>
#include <WebSocketsClient.h> //https://github.com/Links2004/arduinoWebSockets
WebSocketsClient webSocket;

const char *ssid = "yourSSID";
const char *password = "yourPassword";
const char *APSSID = "APSSID";
const char *APpassword ="appassword";

#define MAX_CLIENTS 5

WiFiServer server(80);
WiFiClient clients[MAX_CLIENTS];
uint8_t i;

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

  if (server.hasClient()) {
    for (i = 0; i < MAX_CLIENTS; i++) {
          clients[i] = server.available();
          Serial.print("New client: "); Serial.print(i);
          continue;

  switch (type) { 
    case WStype_DISCONNECTED:   
      Serial.printf("[WSc] Disconnected!\n");
      break;
    case WStype_CONNECTED:
      Serial.printf("[WSc] Connected to url: %s\n", payload);
      break;
    case WStype_TEXT: 
      Serial.printf("[WSc] get text: %s\n", payload);
      clients[i].write((char*)payload);
      break;
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      break;
      }
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP8266 Websocket Client");
  WiFi.begin(ssid, password);
  WiFi.softAP(APSSID, APpassword);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  
  webSocket.begin("smartfarm28082018.herokuapp.com", 80); //port 80 is designated port for external access
  webSocket.onEvent(webSocketEvent);
  server.begin();
}

void loop() {

  webSocket.loop();

 for (i = 0; i < MAX_CLIENTS; i++) {
  if (clients[i] && clients[i].connected()) {
      if (clients[i].available()) {
        String line = clients[i].readStringUntil('\r');
        Serial.print("Server receive from Client:");
        Serial.println(line);
        webSocket.sendTXT(line);
     }
  }
}
}
