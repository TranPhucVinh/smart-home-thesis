#include <ESP8266WiFi.h>
#define PORT 23
#define SERVER_PORT 80

// Gioi han so luong clients ket noi
#define MAX_CLIENTS 5

//khoi tao IP adress
IPAddress server_ip(192, 168, 4, 1);
IPAddress local_IP(192, 168, 4, 2);
IPAddress gateway(192, 168, 4, 1);
IPAddress subnet(255, 255, 255, 0);

// Khoi tao port de clients ket noi.
WiFiServer server(PORT);
WiFiClient clients[MAX_CLIENTS], client;

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.print("Setting soft-AP configuration ... ");

  //Cau hinh acces point, cai dat soft AP de client ket noi vao.
  WiFi.softAPConfig(local_IP, gateway, subnet);
  WiFi.softAP("SSID", "password");
  WiFi.begin("APSSID", "appassword");
  //In ra local_IP cua AP.
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());
  Serial.println("Telnet server started");
  server.begin();
}

void loop() {
  uint8_t i;

  while (!client.connected()) {
    if (!client.connect(server_ip, SERVER_PORT)) {
      Serial.println("connection failed");
      delay(1000);
      return;
    }
  }

  // kiem tra co client moi ket noi khong
  if (server.hasClient()) {
    for (i = 0; i < MAX_CLIENTS; i++) {
          clients[i] = server.available();
          Serial.print("New client: "); 
          Serial.print(i);
          continue;
        }
      }

  for (i = 0; i < MAX_CLIENTS; i++) {
    if (clients[i] && clients[i].connected()) {
      if (clients[i].available()) {
        String line = clients[i].readStringUntil('\r');
        client.write(line.c_str());
      }
    }
  }

  while (client.available()) {
    String line = client.readStringUntil('\r');
    for (i = 0; i < MAX_CLIENTS; i++) {
      clients[i].write(line.c_str()); // first send data to all clients[i], edit later when changed
    }
  }

}
