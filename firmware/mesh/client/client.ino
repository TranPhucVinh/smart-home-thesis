#include "ESP8266WiFi.h"
#define PORT 23 // port 23 la port cua esp8226 lam AP da khoi tao.

const char *ssid = "SSID";
const char *password = "password";
IPAddress server_ip(192, 168, 4, 2);

WiFiClient client;

void setup() {
	uint8_t i = 0;
	Serial.begin(115200);
	WiFi.begin(ssid, password);
	Serial.print("\nConnecting to ");
	Serial.println(ssid);

// Kiem tra tình trang ket noi, neu chua ket noi duoc
// se in chuoi "connecting..." tren man hinh serial terminal.
	while (WiFi.status() != WL_CONNECTED) {
		Serial.println("Connecting...");
		delay(500);
	}
}

unsigned long previousMillis = 0;

void loop() {
	if (WiFi.status() == WL_CONNECTED) {
	// Kiem tra neu client(STA) chua duoc ket noi.
	// Kiem tra tiep tuc neu khong duoc ket noi den IP va PORT cua server(AP
	// thi in ra serial terminal chuoi "connection failed".
	while (!client.connected()) {
		if (!client.connect(server_ip, PORT)) {
			Serial.println("connection failed");
			delay(1000);
			return;
		}
	}
// Neu client(STA) duoc ket noi thi se doc du lieu tu server(AP)
// den khi gap ki tu \r va in ra seria terminal du lieu nhan duoc.
	while (client.available()) {
		String line = client.readStringUntil('\r');
		Serial.print("Client receive from Server:");
		Serial.println(line); //receive data from server and later edit to turn on, off LED
		}
	}
}