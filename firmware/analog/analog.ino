#include <ESP8266WiFi.h>
#include <WebSocketsClient.h> //https://github.com/Links2004/arduinoWebSockets
#include <DHT.h>

WebSocketsClient webSocket;
const char* ssid = "Hiep";
const char* password = "nhungdoicanh";
const int LED = 16;

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
      if(strcmp((char*)payload, "LED_ON") == 0) {
      digitalWrite(LED, 0); // Khi client phát sự kiện "LED_ON" thì server sẽ bật LED
    } else if(strcmp((char*)payload, "LED_OFF") == 0) {
      digitalWrite(LED, 1); // Khi client phát sự kiện "LED_OFF" thì server sẽ tắt LED
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
}

void loop() {
   float temp = dht.readTemperature();
   // float humid = dht.readHumidity();
//   String temp_char = String(temp);
   // String humid_char = String(humid);

Serial.println(temp);

  webSocket.loop();
  if (digitalRead(LED) == 0) {
 
  webSocket.sendTXT("id_5&LED_ON&"+String(temp, 3));
  } else if (digitalRead(LED) == 1) {
  webSocket.sendTXT("id_5&LED_OFF&"+String(temp, 3));
  }
}
