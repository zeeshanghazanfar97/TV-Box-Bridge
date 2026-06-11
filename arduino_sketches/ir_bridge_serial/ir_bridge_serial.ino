#include <Arduino.h>

#define IR_SEND_PIN 2  // Pico GP2 -> 960R/1k resistor -> BC548 base
#define LED_PIN LED_BUILTIN

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

void sendCarrier38k(unsigned long durationMicros) {
  unsigned long start = micros();

  while (micros() - start < durationMicros) {
    digitalWrite(IR_SEND_PIN, HIGH);
    delayMicroseconds(13);
    digitalWrite(IR_SEND_PIN, LOW);
    delayMicroseconds(13);
  }
}

void spaceMicros(unsigned long durationMicros) {
  digitalWrite(IR_SEND_PIN, LOW);
  delayMicroseconds(durationMicros);
}

void sendRawLSB32(
  uint32_t data,
  unsigned long headerMark,
  unsigned long headerSpace,
  unsigned long bitMark,
  unsigned long zeroSpace,
  unsigned long oneSpace
) {
  sendCarrier38k(headerMark);
  spaceMicros(headerSpace);

  for (int i = 0; i < 32; i++) {
    sendCarrier38k(bitMark);

    if (data & 0x1) {
      spaceMicros(oneSpace);
    } else {
      spaceMicros(zeroSpace);
    }

    data >>= 1;
  }

  sendCarrier38k(bitMark);
  digitalWrite(IR_SEND_PIN, LOW);
}

void sendNECRawLSB(uint32_t data) {
  sendRawLSB32(data, 9000, 4500, 560, 560, 1690);
}

void sendSamsungRawLSB(uint32_t data) {
  sendRawLSB32(data, 4500, 4500, 560, 560, 1690);
}

void printReady() {
  Serial.println("READY TVBOX_IR_BRIDGE manual-raw v2");
  Serial.println("FORMAT SEND <NEC|SAMSUNG> <raw32> [repeats]");
  Serial.println("EXAMPLE SEND NEC 0x3EC1FD01 0");
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

void sendProtocolRaw(const String& protocol, uint32_t raw) {
  if (protocol == "NEC") {
    sendNECRawLSB(raw);
    return;
  }

  if (protocol == "SAMSUNG") {
    sendSamsungRawLSB(raw);
    return;
  }

  printErr("unsupported protocol");
}

void handleSend(char* protocolToken, char* rawToken, char* repeatsToken) {
  if (protocolToken == nullptr || rawToken == nullptr) {
    printErr("missing arguments");
    return;
  }

  String protocol = String(protocolToken);
  protocol.toUpperCase();

  if (protocol != "NEC" && protocol != "SAMSUNG") {
    printErr("unsupported protocol");
    return;
  }

  uint32_t raw = parseNumber(rawToken);
  uint8_t repeats = repeatsToken == nullptr ? 0 : static_cast<uint8_t>(parseNumber(repeatsToken));

  digitalWrite(LED_PIN, HIGH);

  for (uint8_t i = 0; i <= repeats; i++) {
    sendProtocolRaw(protocol, raw);
    if (i < repeats) {
      delay(40);
    }
  }

  digitalWrite(LED_PIN, LOW);

  Serial.print("OK ");
  Serial.print(protocol);
  Serial.print(" 0x");
  Serial.print(raw, HEX);
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
  char* raw = strtok(nullptr, " ,\t");
  char* repeats = strtok(nullptr, " ,\t");
  handleSend(protocol, raw, repeats);
}

void setup() {
  Serial.begin(115200);
  delay(350);

  pinMode(IR_SEND_PIN, OUTPUT);
  digitalWrite(IR_SEND_PIN, LOW);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

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
