#define IR_SEND_PIN 16  // Pico GP16 -> resistor -> transistor/base -> IR LED

#include <Arduino.h>
#include <IRremote.hpp>

const int LED_PIN = LED_BUILTIN;
const size_t LINE_LIMIT = 96;

String inputLine;

void blinkLed(int times = 1) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(45);
    digitalWrite(LED_PIN, LOW);
    delay(45);
  }
}

void printReady() {
  Serial.println("READY TVBOX_IR_BRIDGE v1");
  Serial.println("FORMAT SEND <NEC|SAMSUNG> <address> <command> [repeats]");
}

void printErr(const char* message) {
  Serial.print("ERR ");
  Serial.println(message);
  blinkLed(2);
}

uint32_t parseNumber(const char* token) {
  if (token == nullptr) return 0;
  return strtoul(token, nullptr, 0);
}

void handleSend(char* protocolToken, char* addressToken, char* commandToken, char* repeatsToken) {
  if (protocolToken == nullptr || addressToken == nullptr || commandToken == nullptr) {
    printErr("missing arguments");
    return;
  }

  String protocol = String(protocolToken);
  protocol.toUpperCase();

  uint16_t address = static_cast<uint16_t>(parseNumber(addressToken));
  uint16_t command = static_cast<uint16_t>(parseNumber(commandToken));
  uint8_t repeats = repeatsToken == nullptr ? 0 : static_cast<uint8_t>(parseNumber(repeatsToken));

  if (protocol == "NEC") {
    IrSender.sendNEC(address, command, repeats);
  } else if (protocol == "SAMSUNG") {
    IrSender.sendSamsung(address, command, repeats);
  } else {
    printErr("unsupported protocol");
    return;
  }

  blinkLed(1);
  Serial.print("OK ");
  Serial.print(protocol);
  Serial.print(" 0x");
  Serial.print(address, HEX);
  Serial.print(" 0x");
  Serial.print(command, HEX);
  Serial.print(" ");
  Serial.println(repeats);
}

void processLine(String line) {
  line.trim();
  if (line.length() == 0) return;

  char buffer[LINE_LIMIT + 1];
  line.toCharArray(buffer, sizeof(buffer));

  char* verb = strtok(buffer, " ,\t");
  if (verb == nullptr) return;

  String command = String(verb);
  command.toUpperCase();

  if (command == "PING") {
    Serial.println("OK PONG");
    return;
  }

  if (command == "HELP") {
    printReady();
    return;
  }

  if (command != "SEND") {
    printErr("unknown command");
    return;
  }

  char* protocol = strtok(nullptr, " ,\t");
  char* address = strtok(nullptr, " ,\t");
  char* irCommand = strtok(nullptr, " ,\t");
  char* repeats = strtok(nullptr, " ,\t");
  handleSend(protocol, address, irCommand, repeats);
}

void setup() {
  Serial.begin(115200);
  delay(350);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  IrSender.begin(IR_SEND_PIN);
  printReady();
}

void loop() {
  while (Serial.available() > 0) {
    char next = static_cast<char>(Serial.read());

    if (next == '\n' || next == '\r') {
      processLine(inputLine);
      inputLine = "";
      continue;
    }

    if (inputLine.length() >= LINE_LIMIT) {
      inputLine = "";
      printErr("line too long");
      continue;
    }

    inputLine += next;
  }
}
