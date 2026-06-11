#include <Arduino.h>
#include <IRremote.hpp>

const int IR_RECEIVE_PIN = 27;
const int LED_PIN = LED_BUILTIN;

// Edit this list if you want to add/remove buttons
const char* keyNames[] = {
  "Red Power Top",
  "White Power",
  "TV",
  "Mute Top Right",
  "TV/AV",
  "Top VOL+",
  "Top VOL-",
  "Top CH+",
  "Top CH-",
  "SET",
  "Mute Middle Right",

  "Red Record",
  "Play/Pause",
  "Stop",
  "Rewind",
  "INFO",
  "Fast Forward",

  "Navigation CH+ / Up",
  "Navigation CH- / Down",
  "Navigation VOL- / Left",
  "Navigation VOL+ / Right",
  "OK",

  "Left Side VOL+",
  "Left Side VOL-",
  "Right Side CH+",
  "Right Side CH-",

  "MENU/EXIT",
  "BACK",

  "Number 1",
  "Number 2",
  "Number 3",
  "Number 4",
  "Number 5",
  "Number 6",
  "Number 7",
  "Number 8",
  "Number 9",
  "Number 0",

  "EPG",
  "FAV",

  "Red AUDIO",
  "Yellow MAIL",
  "Green SUB",
  "Blue MEDIA"
};

const int totalKeys = sizeof(keyNames) / sizeof(keyNames[0]);

struct IRCode {
  String keyName;
  String protocol;
  uint16_t address;
  uint16_t command;
  uint32_t rawData;
  uint16_t bits;
  bool recorded;
};

IRCode recordedCodes[totalKeys];

int currentKeyIndex = 0;
bool finished = false;

void blinkLed() {
  digitalWrite(LED_PIN, HIGH);
  delay(80);
  digitalWrite(LED_PIN, LOW);
}

void printCurrentPrompt() {
  Serial.println();
  Serial.println("====================================");
  Serial.print("Press key ");
  Serial.print(currentKeyIndex + 1);
  Serial.print("/");
  Serial.print(totalKeys);
  Serial.print(": ");
  Serial.println(keyNames[currentKeyIndex]);
  Serial.println("Waiting...");
}

void printFinalResults() {
  Serial.println();
  Serial.println();
  Serial.println("====================================");
  Serial.println("ALL REMOTE CODES RECORDED");
  Serial.println("====================================");
  Serial.println();

  for (int i = 0; i < totalKeys; i++) {
    Serial.print(keyNames[i]);
    Serial.print(" | Protocol: ");
    Serial.print(recordedCodes[i].protocol);
    Serial.print(" | Address: 0x");
    Serial.print(recordedCodes[i].address, HEX);
    Serial.print(" | Command: 0x");
    Serial.print(recordedCodes[i].command, HEX);
    Serial.print(" | Raw: 0x");
    Serial.print(recordedCodes[i].rawData, HEX);
    Serial.print(" | Bits: ");
    Serial.println(recordedCodes[i].bits);
  }

  Serial.println();
  Serial.println("====================================");
  Serial.println("COPY-FRIENDLY LIST");
  Serial.println("====================================");
  Serial.println();

  for (int i = 0; i < totalKeys; i++) {
    Serial.print(recordedCodes[i].keyName);
    Serial.print(" = ");
    Serial.print("Protocol:");
    Serial.print(recordedCodes[i].protocol);
    Serial.print(", Address:0x");
    Serial.print(recordedCodes[i].address, HEX);
    Serial.print(", Command:0x");
    Serial.print(recordedCodes[i].command, HEX);
    Serial.print(", Raw:0x");
    Serial.print(recordedCodes[i].rawData, HEX);
    Serial.print(", Bits:");
    Serial.println(recordedCodes[i].bits);
  }

  Serial.println();
  Serial.println("Done. You can copy this list now.");
}

void setup() {
  Serial.begin(115200);
  delay(2500);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  IrReceiver.begin(IR_RECEIVE_PIN, ENABLE_LED_FEEDBACK);

  Serial.println();
  Serial.println("Raspberry Pi Pico TVNation Remote Recorder");
  Serial.println("IR receiver OUT/S/DATA should be connected to GP15.");
  Serial.println("Press each button only once when prompted.");
  Serial.println("Do not hold the button.");

  for (int i = 0; i < totalKeys; i++) {
    recordedCodes[i].keyName = keyNames[i];
    recordedCodes[i].recorded = false;
  }

  printCurrentPrompt();
}

void loop() {
  if (finished) {
    return;
  }

  if (IrReceiver.decode()) {
    // Ignore repeat signals caused by holding a button
    if (IrReceiver.decodedIRData.flags & IRDATA_FLAGS_IS_REPEAT) {
      IrReceiver.resume();
      return;
    }

    blinkLed();

    recordedCodes[currentKeyIndex].protocol =
      String(getProtocolString(IrReceiver.decodedIRData.protocol));

    recordedCodes[currentKeyIndex].address =
      IrReceiver.decodedIRData.address;

    recordedCodes[currentKeyIndex].command =
      IrReceiver.decodedIRData.command;

    recordedCodes[currentKeyIndex].rawData =
      IrReceiver.decodedIRData.decodedRawData;

    recordedCodes[currentKeyIndex].bits =
      IrReceiver.decodedIRData.numberOfBits;

    recordedCodes[currentKeyIndex].recorded = true;

    Serial.println();
    Serial.println("Recorded:");
    Serial.print("Key: ");
    Serial.println(keyNames[currentKeyIndex]);

    Serial.print("Protocol: ");
    Serial.println(recordedCodes[currentKeyIndex].protocol);

    Serial.print("Address: 0x");
    Serial.println(recordedCodes[currentKeyIndex].address, HEX);

    Serial.print("Command: 0x");
    Serial.println(recordedCodes[currentKeyIndex].command, HEX);

    Serial.print("Raw data: 0x");
    Serial.println(recordedCodes[currentKeyIndex].rawData, HEX);

    Serial.print("Bits: ");
    Serial.println(recordedCodes[currentKeyIndex].bits);

    currentKeyIndex++;

    IrReceiver.resume();

    delay(700); // prevents accidental double recording

    if (currentKeyIndex >= totalKeys) {
      finished = true;
      printFinalResults();
    } else {
      printCurrentPrompt();
    }
  }
}