#include <ESP8266WiFi.h>
#include <WebSocketsClient.h> //https://github.com/Links2004/arduinoWebSockets
#include <DHT.h>

WebSocketsClient webSocket;
const char* ssid = "Hiep";
const char* password = "nhungdoicanh";
const int LED = 16;
int received = 0;
float tempConst, temp;

#define DHTPIN 5
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

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
      if(strcmp((char*)payload, "id_5&LED_ON") == 0) {
      digitalWrite(LED, 0); // Khi client phát sự kiện "LED_ON" thì server sẽ bật LED
    } else if(strcmp((char*)payload, "id_5&LED_OFF") == 0) {
      digitalWrite(LED, 1); // Khi client phát sự kiện "LED_OFF" thì server sẽ tắt LED
    } else if(strcmp((char*)payload, "temp_received") == 0){
      received = 1;
    } else if((strcmp((char*)payload, "Websocket is open") == 0)||(strcmp((char*)payload, "New websocket is open") == 0)){
      received = 0;
    }
      break; 
    case WStype_BIN:
      Serial.printf("[WSc] get binary length: %u\n", length);
      break;
    }
}

void setup() {
  pinMode(LED, OUTPUT);
  dht.begin();
  Serial.begin(115200);
  Serial.println("ESP8266 Websocket Client");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");  
  
  webSocket.begin("smarthome-thesis-bku.herokuapp.com", 80); //port 80 is designated port for external access
  webSocket.onEvent(webSocketEvent);
  tempConst = dht.readTemperature();
}

void loop() {
   temp = dht.readTemperature();
   if (temp != tempConst){
    tempConst = temp;
   }

  webSocket.loop();
  if ((digitalRead(LED) == 0)&&(received==0)) {
 
  webSocket.sendTXT("id_5&analog&LED_ON&"+String(tempConst, 1));
  } else if ((digitalRead(LED) == 1)&&(received==0)) {
  webSocket.sendTXT("id_5&analog&LED_OFF&"+String(tempConst, 1));
  }
}
